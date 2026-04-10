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

function getFirstValue(item, candidates) {
  if (!item || typeof item !== "object") return "";
  const keys = Object.keys(item);
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(item, candidate) && item[candidate] != null && item[candidate] !== "") {
      return item[candidate];
    }
    const normalizedCandidate = String(candidate).toLowerCase().replace(/[^a-z0-9]/g, "");
    const matchKey = keys.find((key) =>
      String(key).toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedCandidate
    );
    if (matchKey && item[matchKey] != null && item[matchKey] !== "") {
      return item[matchKey];
    }
  }
  return "";
}

function normalizeFeedItem(item, provider) {
  const title = String(getFirstValue(item, ["title", "name", "productTitle", "product_name", "Product Name"]) || "").trim();
  const brand = String(getFirstValue(item, ["brand", "store", "merchant", "Brand"]) || provider || "Partner").trim();
  const dealPrice = Number(getFirstValue(item, ["dealPrice", "price", "salePrice", "deal_price", "Deal Price", "Price"]) || 0);
  const listPriceInput = Number(getFirstValue(item, ["listPrice", "mrp", "originalPrice", "list_price", "List Price", "MRP"]) || 0);
  const listPrice = listPriceInput > dealPrice ? listPriceInput : Math.round(dealPrice * 1.2);
  const affiliateUrl = String(getFirstValue(item, ["affiliateUrl", "url", "link", "affiliate_url", "URL", "Affiliate URL"]) || "").trim();
  const imageUrl = String(getFirstValue(item, ["imageUrl", "image", "thumbnail", "image_url", "Image URL"]) || "").trim();
  const category = mapCategory(getFirstValue(item, ["category", "department", "Category"]) || "electronics");
  const badge = mapBadge(getFirstValue(item, ["badge", "tag", "Badge"]) || "new");
  const note = String(getFirstValue(item, ["note", "description", "Note", "Description"]) || "Latest live synced offer").trim();

  if (!title || !brand || !affiliateUrl) return null;
  if (!Number.isFinite(dealPrice) || dealPrice <= 0) return null;

  const now = Date.now();
  const expires = new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const sourceId = String(getFirstValue(item, ["id", "sku", "productId", "Product ID"]) || `${provider}-${title}`)
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
    coupon: String(getFirstValue(item, ["coupon", "Coupon"]) || "").trim(),
    expiresOn: expires,
    affiliateUrl,
    imageUrl,
    note,
    featured: Boolean(getFirstValue(item, ["featured", "Featured"])),
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
