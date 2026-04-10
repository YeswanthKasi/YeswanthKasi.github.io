const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const OWNER_UID = "BbEO7ou2wJeilZEsKEsp6YuSyeh2";
const db = admin.firestore();

function mapCategory(raw) {
  const value = String(raw || "").toLowerCase();
  if (value.includes("fashion")) return "fashion";
  if (value.includes("home") || value.includes("kitchen")) return "home";
  if (value.includes("health") || value.includes("fitness")) return "health";
  if (value.includes("beauty")) return "beauty";
  if (value.includes("travel")) return "travel";
  return "electronics";
}

function mapBadge(raw) {
  const value = String(raw || "").toLowerCase();
  if (value.includes("hot")) return "hot";
  if (value.includes("festival")) return "festival";
  if (value.includes("drop") || value.includes("discount")) return "price-drop";
  return "new";
}

function normalizeFeedItem(item, provider) {
  const title = String(item.title || item.name || item.productTitle || "").trim();
  const brand = String(item.brand || item.store || provider || "Partner").trim();
  const dealPrice = Number(item.dealPrice || item.price || item.salePrice || 0);
  const listPriceInput = Number(item.listPrice || item.mrp || item.originalPrice || 0);
  const listPrice = listPriceInput > dealPrice ? listPriceInput : Math.round(dealPrice * 1.2);
  const affiliateUrl = String(item.affiliateUrl || item.url || item.link || "").trim();
  const imageUrl = String(item.imageUrl || item.image || item.thumbnail || "").trim();
  const category = mapCategory(item.category || item.department || "electronics");
  const badge = mapBadge(item.badge || item.tag || "new");
  const note = String(item.note || item.description || "Latest live synced offer").trim();

  if (!title || !brand || !affiliateUrl) return null;
  if (!Number.isFinite(dealPrice) || dealPrice <= 0) return null;

  const now = Date.now();
  const expires = new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const sourceId = String(item.id || item.sku || `${provider}-${title}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 100);

  return {
    id: `live-${sourceId || now}`,
    brand,
    title,
    category,
    badge,
    listPrice,
    dealPrice,
    coupon: String(item.coupon || "").trim(),
    expiresOn: expires,
    affiliateUrl,
    imageUrl,
    note,
    featured: Boolean(item.featured),
    createdAt: now,
    updatedAt: now,
    liveSource: provider
  };
}

async function runSync({ provider, feedUrl, apiKey, itemLimit }) {
  const headers = {
    "accept": "application/json"
  };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
    headers["authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(feedUrl, { headers });
  if (!response.ok) {
    throw new Error(`feed-http-${response.status}`);
  }

  const data = await response.json();
  const rawItems = Array.isArray(data)
    ? data
    : (Array.isArray(data.items) ? data.items : (Array.isArray(data.products) ? data.products : []));

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { syncedCount: 0 };
  }

  const limit = Math.min(Math.max(Number(itemLimit) || 100, 1), 500);
  const normalized = rawItems
    .slice(0, limit)
    .map((item) => normalizeFeedItem(item, provider))
    .filter(Boolean);

  const batch = db.batch();
  normalized.forEach((item) => {
    const ref = db.collection("products").doc(item.id);
    batch.set(ref, item, { merge: true });
  });

  const siteRef = db.collection("site").doc("main");
  batch.set(siteRef, {
    liveData: {
      provider,
      feedUrl,
      itemLimit: limit,
      lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
      lastSyncCount: normalized.length,
      lastSyncStatus: "success"
    }
  }, { merge: true });

  await batch.commit();
  return { syncedCount: normalized.length };
}

exports.syncMerchantFeed = onCall({ region: "us-central1" }, async (request) => {
  if (!request.auth || request.auth.uid !== OWNER_UID) {
    throw new HttpsError("permission-denied", "Only owner can run sync.");
  }

  const provider = String(request.data?.provider || "").trim();
  const feedUrl = String(request.data?.feedUrl || "").trim();
  const apiKey = String(request.data?.apiKey || "").trim();
  const itemLimit = Number(request.data?.itemLimit || 100);

  if (!provider || !feedUrl) {
    throw new HttpsError("invalid-argument", "provider and feedUrl are required");
  }

  try {
    return await runSync({ provider, feedUrl, apiKey, itemLimit });
  } catch (error) {
    throw new HttpsError("internal", `sync-failed-${error.message}`);
  }
});

exports.scheduledSyncFeeds = onSchedule({
  schedule: "every 30 minutes",
  region: "us-central1",
  timeZone: "Asia/Kolkata"
}, async () => {
  const site = await db.collection("site").doc("main").get();
  const liveData = site.exists ? (site.data().liveData || {}) : {};
  if (!liveData.enabled || !liveData.feedUrl || !liveData.provider) return;

  try {
    await runSync({
      provider: String(liveData.provider),
      feedUrl: String(liveData.feedUrl),
      apiKey: String(liveData.apiKey || ""),
      itemLimit: Number(liveData.itemLimit || 100)
    });
  } catch (_error) {
    await db.collection("site").doc("main").set({
      liveData: {
        lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
        lastSyncStatus: "failed"
      }
    }, { merge: true });
  }
});
