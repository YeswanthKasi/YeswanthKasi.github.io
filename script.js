const encodedOwnerEmail = "S2FzaXJlZGRpeWVzd2FudGgyOUBnbWFpbC5jb20=";

const categories = ["electronics", "fashion", "home", "health", "beauty", "travel"];
const badges = ["hot", "new", "festival", "price-drop"];

const defaultProducts = [
    {
        id: "p-3001",
        brand: "Apple",
        title: "AirPods Pro (2nd Gen)",
        category: "electronics",
        badge: "hot",
        listPrice: 20999,
        dealPrice: 16499,
        coupon: "KASIREDDI10",
        expiresOn: "2026-12-31",
        affiliateUrl: "",
        imageUrl: "",
        note: "Active noise cancellation, adaptive audio, premium sound quality. High commission product.",
        featured: true,
        createdAt: 1743100001000,
        updatedAt: 1743100001000
    },
    {
        id: "p-3002",
        brand: "Xiaomi",
        title: "11A Smart TV 43 inch",
        category: "electronics",
        badge: "price-drop",
        listPrice: 24999,
        dealPrice: 19999,
        coupon: "SUMMER30",
        expiresOn: "2026-12-15",
        affiliateUrl: "",
        imageUrl: "",
        note: "4K resolution, Dolby Atmos, smart OS. Best for gaming and streaming. Excellent margins.",
        featured: true,
        createdAt: 1743100002000,
        updatedAt: 1743100002000
    },
    {
        id: "p-3003",
        brand: "Nike",
        title: "Revolution 7 Running Shoes",
        category: "fashion",
        badge: "new",
        listPrice: 6299,
        dealPrice: 3999,
        coupon: "FITPRO20",
        expiresOn: "2026-11-20",
        affiliateUrl: "",
        imageUrl: "",
        note: "Comfortable cushioning for daily wear and workouts. Popular high-traffic product.",
        featured: true,
        createdAt: 1743100003000,
        updatedAt: 1743100003000
    }
];

const defaultSettings = {
    site: {
        siteTitle: "Kasireddi Deals",
        heroTitle: "Kasireddi Deals: Official Hub for Smart Daily Savings",
        heroSubtitle: "Premium product discovery experience with trusted listings, clean categories, and continuously updated offers.",
        privateEmail: decodePrivateEmail(),
        whatsAppLink: ""
    },
    promo: {
        enabled: true,
        label: "Seasonal Picks",
        heading: "Fresh India Deal Drops Are Live",
        text: "Discover trending products and save more with curated daily offers.",
        ctaText: "View Promotions",
        ctaUrl: "#best-deals"
    },
    ads: {
        enabled: true,
        heading: "Sponsored Offers",
        disclaimer: "Ads are managed securely by site owner.",
        client: "ca-pub-6185830543809180",
        slot: "1234567890"
    }
};

const localFallbackKeys = {
    products: "kasireddiLocalFallbackProducts",
    settings: "kasireddiLocalFallbackSettings"
};

const state = {
    products: clone(defaultProducts),
    settings: clone(defaultSettings),
    ownerUnlocked: false,
    adsInitialized: false,
    devModalOpen: false,
    typedSecretBuffer: "",
    cloudReady: false,
    activeOwnerEmail: ""
};

const cloud = {
    app: null,
    auth: null,
    db: null,
    ownerUid: "",
    ownerEmail: decodePrivateEmail(),
    requireEmailVerified: true,
    unsubscribeProducts: null,
    unsubscribeSettings: null,

    initializeApp: null,
    getAuth: null,
    onAuthStateChanged: null,
    signInWithEmailAndPassword: null,
    signInWithPopup: null,
    signInWithRedirect: null,
    getRedirectResult: null,
    GoogleAuthProvider: null,
    signOut: null,
    setPersistence: null,
    browserLocalPersistence: null,

    getFirestore: null,
    doc: null,
    setDoc: null,
    updateDoc: null,
    deleteDoc: null,
    getDocs: null,
    writeBatch: null,
    collection: null,
    query: null,
    orderBy: null,
    onSnapshot: null
};

const elements = {
    navbar: document.getElementById("navbar"),
    mobileMenuBtn: document.getElementById("mobileMenuBtn"),
    navLinks: document.getElementById("navLinks"),
    brandSecretTap: document.getElementById("brandSecretTap"),

    navBrandTitle: document.getElementById("navBrandTitle"),
    footerBrandTitle: document.getElementById("footerBrandTitle"),
    footerYear: document.getElementById("footerYear"),

    heroTitle: document.getElementById("heroTitle"),
    heroSubtitle: document.getElementById("heroSubtitle"),
    metricProducts: document.getElementById("metricProducts"),
    metricSavings: document.getElementById("metricSavings"),
    metricCategories: document.getElementById("metricCategories"),

    promoRibbon: document.getElementById("promoRibbon"),
    promoLabel: document.getElementById("promoLabel"),
    promoHeading: document.getElementById("promoHeading"),
    promoText: document.getElementById("promoText"),
    promoCta: document.getElementById("promoCta"),

    searchInput: document.getElementById("searchInput"),
    categoryFilter: document.getElementById("categoryFilter"),
    badgeFilter: document.getElementById("badgeFilter"),
    sortFilter: document.getElementById("sortFilter"),
    dealsGrid: document.getElementById("dealsGrid"),
    dealsEmpty: document.getElementById("dealsEmpty"),

    adsSection: document.getElementById("adsSection"),
    adsDisplay: document.getElementById("adsDisplay"),
    adsHeading: document.getElementById("adsHeading"),
    adsDisclaimer: document.getElementById("adsDisclaimer"),

    inquiryForm: document.getElementById("inquiryForm"),

    devModal: document.getElementById("devModal"),
    devBackdrop: document.getElementById("devBackdrop"),
    devCloseBtn: document.getElementById("devCloseBtn"),

    ownerLoginForm: document.getElementById("ownerLoginForm"),
    ownerEmailLogin: document.getElementById("ownerEmailLogin"),
    ownerPasswordLogin: document.getElementById("ownerPasswordLogin"),
    ownerGoogleLoginBtn: document.getElementById("ownerGoogleLoginBtn"),
    ownerLogoutBtn: document.getElementById("ownerLogoutBtn"),
    ownerAccessStatus: document.getElementById("ownerAccessStatus"),
    adminDashboard: document.getElementById("adminDashboard"),

    adminTabs: Array.from(document.querySelectorAll(".admin-tab")),
    adminPanels: Array.from(document.querySelectorAll(".admin-panel")),

    productForm: document.getElementById("productForm"),
    productSubmitBtn: document.getElementById("productSubmitBtn"),
    productCancelEditBtn: document.getElementById("productCancelEditBtn"),
    resetDealsBtn: document.getElementById("resetDealsBtn"),
    adminProductsTableBody: document.getElementById("adminProductsTableBody"),

    promotionForm: document.getElementById("promotionForm"),
    siteSettingsForm: document.getElementById("siteSettingsForm"),
    adsSettingsForm: document.getElementById("adsSettingsForm"),

    exportDataBtn: document.getElementById("exportDataBtn"),
    importDataInput: document.getElementById("importDataInput"),
    importDataBtn: document.getElementById("importDataBtn")
};

function decodePrivateEmail() {
    try {
        return atob(encodedOwnerEmail);
    } catch (_error) {
        return "owner@domain.com";
    }
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function readableAuthError(error) {
    const code = error?.code || "auth/unknown";
    switch (code) {
        case "auth/unauthorized-domain":
            return "Unauthorized domain. Add your site domain in Firebase Authentication -> Settings -> Authorized domains.";
        case "auth/popup-blocked":
            return "Popup was blocked by browser. Retrying with redirect login.";
        case "auth/popup-closed-by-user":
            return "Popup was closed before sign-in completed.";
        case "auth/account-exists-with-different-credential":
            return "Account exists with a different sign-in method for this email.";
        default:
            return `Google sign in failed (${code}).`;
    }
}

function showToast(message, type = "success") {
    const oldToast = document.querySelector(".toast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3200);
}

function normalizeTimestamp(value) {
    if (Number.isFinite(value)) return value;
    if (value && typeof value.toMillis === "function") return value.toMillis();
    if (typeof value === "string") {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? Date.now() : parsed;
    }
    return Date.now();
}

function safeExternalUrl(raw) {
    if (typeof raw !== "string") return "";
    const value = raw.trim();
    if (!value) return "";
    try {
        const parsed = new URL(value);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
            return parsed.toString();
        }
    } catch (_error) {
        return "";
    }
    return "";
}

function safeActionUrl(raw) {
    if (typeof raw !== "string") return "";
    const value = raw.trim();
    if (!value) return "";
    if (value.startsWith("#")) {
        return document.querySelector(value) ? value : "";
    }
    return safeExternalUrl(value);
}

function escapeHTML(raw) {
    return String(raw)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function parsePrice(raw) {
    const numeric = Number(raw);
    return Number.isFinite(numeric) ? Math.round(numeric) : NaN;
}

function money(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);
}

function discountPercent(product) {
    return Math.max(Math.round(((product.listPrice - product.dealPrice) / product.listPrice) * 100), 0);
}

function formatDate(raw) {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "No expiry";
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function daysUntil(raw) {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
    return Math.max(Math.ceil((date.getTime() - Date.now()) / 86400000), 0);
}

function categoryLabel(value) {
    const map = {
        electronics: "Electronics",
        fashion: "Fashion",
        home: "Home and Kitchen",
        health: "Health and Fitness",
        beauty: "Beauty",
        travel: "Travel"
    };
    return map[value] || value;
}

function badgeLabel(value) {
    const map = {
        hot: "Hot",
        new: "New",
        festival: "Festival",
        "price-drop": "Price Drop"
    };
    return map[value] || value;
}

function normalizeProduct(raw) {
    if (!raw || typeof raw !== "object") return null;

    const cleanAffiliateSource = typeof raw.affiliateUrl === "string" ? raw.affiliateUrl.trim() : "";
    const cleanImageSource = typeof raw.imageUrl === "string" ? raw.imageUrl.trim() : "";

    const product = {
        id: typeof raw.id === "string" && raw.id ? raw.id : `p-${Date.now()}`,
        brand: typeof raw.brand === "string" ? raw.brand.trim() : "",
        title: typeof raw.title === "string" ? raw.title.trim() : "",
        category: typeof raw.category === "string" ? raw.category.trim() : "",
        badge: typeof raw.badge === "string" ? raw.badge.trim() : "",
        listPrice: parsePrice(raw.listPrice),
        dealPrice: parsePrice(raw.dealPrice),
        coupon: typeof raw.coupon === "string" ? raw.coupon.trim() : "",
        expiresOn: typeof raw.expiresOn === "string" ? raw.expiresOn : "",
        affiliateUrl: cleanAffiliateSource ? safeExternalUrl(cleanAffiliateSource) : "",
        imageUrl: cleanImageSource ? safeExternalUrl(cleanImageSource) : "",
        note: typeof raw.note === "string" ? raw.note.trim() : "",
        featured: Boolean(raw.featured),
        createdAt: normalizeTimestamp(raw.createdAt),
        updatedAt: normalizeTimestamp(raw.updatedAt)
    };

    if (!product.brand || !product.title || !product.note) return null;
    if (!categories.includes(product.category)) return null;
    if (!badges.includes(product.badge)) return null;
    if (!Number.isFinite(product.listPrice) || !Number.isFinite(product.dealPrice)) return null;
    if (product.listPrice <= 0 || product.dealPrice <= 0 || product.dealPrice >= product.listPrice) return null;
    if (cleanAffiliateSource && !product.affiliateUrl) return null;
    if (cleanImageSource && !product.imageUrl) return null;

    const expiryDate = new Date(product.expiresOn);
    if (Number.isNaN(expiryDate.getTime())) {
        const fallback = new Date();
        fallback.setDate(fallback.getDate() + 30);
        product.expiresOn = fallback.toISOString().slice(0, 10);
    }

    return product;
}

function normalizeSettings(raw) {
    const merged = {
        site: {
            ...defaultSettings.site,
            ...(raw && raw.site ? raw.site : {})
        },
        promo: {
            ...defaultSettings.promo,
            ...(raw && raw.promo ? raw.promo : {})
        },
        ads: {
            ...defaultSettings.ads,
            ...(raw && raw.ads ? raw.ads : {})
        }
    };

    merged.site.siteTitle = String(merged.site.siteTitle || defaultSettings.site.siteTitle).trim();
    merged.site.heroTitle = String(merged.site.heroTitle || defaultSettings.site.heroTitle).trim();
    merged.site.heroSubtitle = String(merged.site.heroSubtitle || defaultSettings.site.heroSubtitle).trim();
    merged.site.privateEmail = String(merged.site.privateEmail || defaultSettings.site.privateEmail).trim();
    merged.site.whatsAppLink = safeExternalUrl(String(merged.site.whatsAppLink || "").trim());

    merged.promo.enabled = Boolean(merged.promo.enabled);
    merged.promo.label = String(merged.promo.label || defaultSettings.promo.label).trim();
    merged.promo.heading = String(merged.promo.heading || defaultSettings.promo.heading).trim();
    merged.promo.text = String(merged.promo.text || defaultSettings.promo.text).trim();
    merged.promo.ctaText = String(merged.promo.ctaText || defaultSettings.promo.ctaText).trim();
    merged.promo.ctaUrl = safeActionUrl(String(merged.promo.ctaUrl || defaultSettings.promo.ctaUrl).trim()) || "#best-deals";

    merged.ads.enabled = Boolean(merged.ads.enabled);
    merged.ads.heading = String(merged.ads.heading || defaultSettings.ads.heading).trim();
    merged.ads.disclaimer = String(merged.ads.disclaimer || defaultSettings.ads.disclaimer).trim();
    merged.ads.client = String(merged.ads.client || defaultSettings.ads.client).trim();
    merged.ads.slot = String(merged.ads.slot || defaultSettings.ads.slot).trim();

    return merged;
}

function dealInitials(product) {
    return (product.title || product.brand)
        .split(" ")
        .map((chunk) => chunk[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function dealCardHTML(product) {
    const savings = product.listPrice - product.dealPrice;
    const hasAffiliate = Boolean(product.affiliateUrl);
    const couponChip = product.coupon ? `<span class="chip">Coupon ${escapeHTML(product.coupon)}</span>` : "";
    const featuredChip = product.featured ? `<span class="chip">Featured</span>` : "";

    return `
        <article class="deal-card">
            <div class="deal-image">
                ${product.imageUrl
                    ? `<img src="${product.imageUrl}" alt="${escapeHTML(product.title)}" loading="lazy">`
                    : `<span class="deal-placeholder">${escapeHTML(dealInitials(product))}</span>`}
            </div>
            <div class="deal-content">
                <div class="deal-head">
                    <span class="deal-brand">${escapeHTML(product.brand)}</span>
                    <span class="deal-tag ${product.badge}">${escapeHTML(badgeLabel(product.badge))}</span>
                </div>
                <h3 class="deal-title">${escapeHTML(product.title)}</h3>
                <p class="deal-note">${escapeHTML(product.note)}</p>
                <div class="price-row">
                    <span class="deal-price">${money(product.dealPrice)}</span>
                    <span class="deal-list-price">${money(product.listPrice)}</span>
                </div>
                <div class="meta-row">
                    <span>Save ${money(savings)} (${discountPercent(product)}%)</span>
                    <span>Ends ${formatDate(product.expiresOn)}</span>
                </div>
                <div class="meta-row">
                    <span>${escapeHTML(categoryLabel(product.category))}</span>
                    <span>${couponChip}${featuredChip}</span>
                </div>
                <div class="deal-actions">
                    <button class="btn btn-primary deal-link ${hasAffiliate ? "" : "disabled"}" type="button" data-action="open" data-id="${product.id}" ${hasAffiliate ? "" : "disabled"}>${hasAffiliate ? "Visit Offer" : "Link Pending"}</button>
                </div>
            </div>
        </article>
    `;
}

function getFilteredProducts() {
    const search = elements.searchInput ? elements.searchInput.value.trim().toLowerCase() : "";
    const category = elements.categoryFilter ? elements.categoryFilter.value : "all";
    const badge = elements.badgeFilter ? elements.badgeFilter.value : "all";
    const sort = elements.sortFilter ? elements.sortFilter.value : "newest";

    let list = [...state.products];

    if (search) {
        list = list.filter((item) => {
            const index = `${item.brand} ${item.title} ${item.note} ${item.coupon}`.toLowerCase();
            return index.includes(search);
        });
    }

    if (category !== "all") {
        list = list.filter((item) => item.category === category);
    }

    if (badge !== "all") {
        list = list.filter((item) => item.badge === badge);
    }

    switch (sort) {
        case "max-discount":
            list.sort((a, b) => discountPercent(b) - discountPercent(a));
            break;
        case "low-price":
            list.sort((a, b) => a.dealPrice - b.dealPrice);
            break;
        case "ending-soon":
            list.sort((a, b) => daysUntil(a.expiresOn) - daysUntil(b.expiresOn));
            break;
        case "newest":
        default:
            list.sort((a, b) => b.createdAt - a.createdAt);
            break;
    }

    return list;
}

function renderDeals() {
    if (!elements.dealsGrid) return;
    const list = getFilteredProducts();
    elements.dealsGrid.innerHTML = list.map(dealCardHTML).join("");
    if (elements.dealsEmpty) {
        elements.dealsEmpty.classList.toggle("hidden", list.length > 0);
    }
}

function renderMetrics() {
    if (!elements.metricProducts || !elements.metricSavings || !elements.metricCategories) return;
    elements.metricProducts.textContent = String(state.products.length);

    const totalSavings = state.products.reduce((sum, item) => sum + (item.listPrice - item.dealPrice), 0);
    elements.metricSavings.textContent = money(totalSavings);

    const uniqueCategories = new Set(state.products.map((item) => item.category));
    elements.metricCategories.textContent = String(uniqueCategories.size);
}

function renderAdminTable() {
    if (!elements.adminProductsTableBody) return;

    if (state.products.length === 0) {
        elements.adminProductsTableBody.innerHTML = "<tr><td colspan=\"5\">No products available.</td></tr>";
        return;
    }

    elements.adminProductsTableBody.innerHTML = state.products
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((product) => {
            return `
                <tr>
                    <td>${escapeHTML(product.brand)}<br><strong>${escapeHTML(product.title)}</strong></td>
                    <td>${escapeHTML(categoryLabel(product.category))}</td>
                    <td>${money(product.dealPrice)} / ${money(product.listPrice)}</td>
                    <td>${product.affiliateUrl ? "Ready" : "Pending"}</td>
                    <td>
                        <div class="table-actions">
                            <button class="table-btn edit" data-action="edit-product" data-id="${product.id}" type="button">Edit</button>
                            <button class="table-btn delete" data-action="delete-product" data-id="${product.id}" type="button">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function applySiteContent() {
    document.title = `${state.settings.site.siteTitle} | Official Deals Hub`;
    if (elements.navBrandTitle) elements.navBrandTitle.textContent = state.settings.site.siteTitle;
    if (elements.footerBrandTitle) elements.footerBrandTitle.textContent = state.settings.site.siteTitle;
    if (elements.heroTitle) elements.heroTitle.textContent = state.settings.site.heroTitle;
    if (elements.heroSubtitle) elements.heroSubtitle.textContent = state.settings.site.heroSubtitle;
    if (elements.footerYear) {
        elements.footerYear.textContent = `Copyright ${new Date().getFullYear()} ${state.settings.site.siteTitle}. All rights reserved.`;
    }
}

function applyPromoContent() {
    if (!elements.promoRibbon) return;
    const promo = state.settings.promo;
    elements.promoRibbon.classList.toggle("hidden", !promo.enabled);
    if (elements.promoLabel) elements.promoLabel.textContent = promo.label;
    if (elements.promoHeading) elements.promoHeading.textContent = promo.heading;
    if (elements.promoText) elements.promoText.textContent = promo.text;
    if (elements.promoCta) {
        elements.promoCta.textContent = promo.ctaText;
        elements.promoCta.setAttribute("href", promo.ctaUrl);
    }
}

function applyAdsContent() {
    if (!elements.adsSection || !elements.adsDisplay) return;
    const ads = state.settings.ads;

    elements.adsSection.classList.toggle("hidden", !ads.enabled);
    if (elements.adsHeading) elements.adsHeading.textContent = ads.heading;
    if (elements.adsDisclaimer) elements.adsDisclaimer.textContent = ads.disclaimer;

    elements.adsDisplay.setAttribute("data-ad-client", ads.client);
    elements.adsDisplay.setAttribute("data-ad-slot", ads.slot);

    if (ads.enabled && window.adsbygoogle && !state.adsInitialized && !ads.client.includes("XXXXXXXXXXXXXXXX")) {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            state.adsInitialized = true;
        } catch (_error) {
            showToast("Ad slot configured but unavailable in this environment.", "info");
        }
    }
}

function applyAllUI() {
    applySiteContent();
    applyPromoContent();
    applyAdsContent();
    renderMetrics();
    renderDeals();
    renderAdminTable();
}

function setActiveTab(tab) {
    elements.adminTabs.forEach((item) => {
        item.classList.toggle("active", item.dataset.tab === tab);
    });
    elements.adminPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === `panel-${tab}`);
    });
}

function openDevModal() {
    if (!elements.devModal) return;
    elements.devModal.classList.remove("hidden");
    elements.devModal.setAttribute("aria-hidden", "false");
    state.devModalOpen = true;
}

function closeDevModal() {
    if (!elements.devModal) return;
    elements.devModal.classList.add("hidden");
    elements.devModal.setAttribute("aria-hidden", "true");
    state.devModalOpen = false;
}

function updateOwnerUI() {
    if (!elements.ownerAccessStatus || !elements.ownerLogoutBtn || !elements.adminDashboard) return;

    const loginForm = elements.ownerLoginForm;
    if (!state.cloudReady) {
        elements.ownerAccessStatus.textContent = "Cloud auth not configured. Add Firebase config to enable secure admin access.";
        if (loginForm) {
            loginForm.querySelectorAll("input,button").forEach((node) => {
                node.disabled = true;
            });
        }
        elements.ownerLogoutBtn.classList.add("hidden");
        elements.adminDashboard.classList.add("hidden");
        return;
    }

    if (loginForm) {
        loginForm.querySelectorAll("input,button").forEach((node) => {
            node.disabled = false;
        });
    }

    if (state.ownerUnlocked) {
        elements.ownerAccessStatus.textContent = `Authenticated as ${state.activeOwnerEmail || "owner"}. Admin controls enabled.`;
        elements.ownerLogoutBtn.classList.remove("hidden");
        elements.adminDashboard.classList.remove("hidden");
    } else {
        elements.ownerAccessStatus.textContent = "Sign in with your authorized owner account.";
        elements.ownerLogoutBtn.classList.add("hidden");
        elements.adminDashboard.classList.add("hidden");
    }
}

function resetProductForm() {
    if (!elements.productForm) return;
    elements.productForm.reset();
    elements.productForm.querySelector("#productId").value = "";
    if (elements.productSubmitBtn) elements.productSubmitBtn.textContent = "Save Product";
}

function fillProductForm(product) {
    if (!elements.productForm || !product) return;

    elements.productForm.querySelector("#productId").value = product.id;
    elements.productForm.querySelector("#productBrand").value = product.brand;
    elements.productForm.querySelector("#productTitle").value = product.title;
    elements.productForm.querySelector("#productCategory").value = product.category;
    elements.productForm.querySelector("#productBadge").value = product.badge;
    elements.productForm.querySelector("#productListPrice").value = String(product.listPrice);
    elements.productForm.querySelector("#productDealPrice").value = String(product.dealPrice);
    elements.productForm.querySelector("#productCoupon").value = product.coupon;
    elements.productForm.querySelector("#productExpires").value = product.expiresOn;
    elements.productForm.querySelector("#productAffiliateUrl").value = product.affiliateUrl;
    elements.productForm.querySelector("#productImageUrl").value = product.imageUrl;
    elements.productForm.querySelector("#productNote").value = product.note;
    elements.productForm.querySelector("#productFeatured").checked = product.featured;
    if (elements.productSubmitBtn) elements.productSubmitBtn.textContent = "Update Product";
}

function loadAdminFormsFromState() {
    if (elements.promotionForm) {
        elements.promotionForm.querySelector("#promoLabelInput").value = state.settings.promo.label;
        elements.promotionForm.querySelector("#promoHeadingInput").value = state.settings.promo.heading;
        elements.promotionForm.querySelector("#promoTextInput").value = state.settings.promo.text;
        elements.promotionForm.querySelector("#promoCtaTextInput").value = state.settings.promo.ctaText;
        elements.promotionForm.querySelector("#promoCtaUrlInput").value = state.settings.promo.ctaUrl;
        elements.promotionForm.querySelector("#promoEnabledInput").checked = state.settings.promo.enabled;
    }

    if (elements.siteSettingsForm) {
        elements.siteSettingsForm.querySelector("#siteTitleInput").value = state.settings.site.siteTitle;
        elements.siteSettingsForm.querySelector("#heroTitleInput").value = state.settings.site.heroTitle;
        elements.siteSettingsForm.querySelector("#heroSubtitleInput").value = state.settings.site.heroSubtitle;
        elements.siteSettingsForm.querySelector("#privateEmailInput").value = state.settings.site.privateEmail;
        elements.siteSettingsForm.querySelector("#whatsAppInput").value = state.settings.site.whatsAppLink;
    }

    if (elements.adsSettingsForm) {
        elements.adsSettingsForm.querySelector("#adsHeadingInput").value = state.settings.ads.heading;
        elements.adsSettingsForm.querySelector("#adsClientInput").value = state.settings.ads.client;
        elements.adsSettingsForm.querySelector("#adsSlotInput").value = state.settings.ads.slot;
        elements.adsSettingsForm.querySelector("#adsDisclaimerInput").value = state.settings.ads.disclaimer;
        elements.adsSettingsForm.querySelector("#adsEnabledInput").checked = state.settings.ads.enabled;
    }
}

function getLocalFallback(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch (_error) {
        return null;
    }
}

function saveLocalFallback() {
    try {
        localStorage.setItem(localFallbackKeys.products, JSON.stringify(state.products));
        localStorage.setItem(localFallbackKeys.settings, JSON.stringify(state.settings));
    } catch (_error) {
        return;
    }
}

function loadLocalFallback() {
    const products = getLocalFallback(localFallbackKeys.products);
    if (Array.isArray(products)) {
        const normalized = products.map(normalizeProduct).filter(Boolean);
        if (normalized.length > 0) {
            state.products = normalized;
        }
    }

    const settings = getLocalFallback(localFallbackKeys.settings);
    if (settings) {
        state.settings = normalizeSettings(settings);
    }
}

function userIsAuthorizedOwner(user) {
    if (!user) return false;

    const uidCheck = cloud.ownerUid && user.uid === cloud.ownerUid;
    const emailCheck = cloud.ownerEmail && user.email && user.email.toLowerCase() === cloud.ownerEmail.toLowerCase();
    const verifiedCheck = cloud.requireEmailVerified ? Boolean(user.emailVerified) : true;

    if (!verifiedCheck) return false;
    if (cloud.ownerUid) return uidCheck;
    return emailCheck;
}

async function initializeCloudSecurity() {
    const runtimeConfig = window.KASIREDDI_FIREBASE_CONFIG || {};
    const firebaseConfig = runtimeConfig.firebaseConfig;

    cloud.ownerUid = String(runtimeConfig.ownerUid || "").trim();
    cloud.ownerEmail = String(runtimeConfig.ownerEmail || decodePrivateEmail()).trim();
    cloud.requireEmailVerified = runtimeConfig.requireEmailVerified !== false;

    if (!firebaseConfig || typeof firebaseConfig !== "object" || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
        state.cloudReady = false;
        return false;
    }

    try {
        const [
            firebaseApp,
            firebaseAuth,
            firebaseFirestore
        ] = await Promise.all([
            import("https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js"),
            import("https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js"),
            import("https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js")
        ]);

        cloud.initializeApp = firebaseApp.initializeApp;
        cloud.getAuth = firebaseAuth.getAuth;
        cloud.onAuthStateChanged = firebaseAuth.onAuthStateChanged;
        cloud.signInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword;
        cloud.signInWithPopup = firebaseAuth.signInWithPopup;
        cloud.signInWithRedirect = firebaseAuth.signInWithRedirect;
        cloud.getRedirectResult = firebaseAuth.getRedirectResult;
        cloud.GoogleAuthProvider = firebaseAuth.GoogleAuthProvider;
        cloud.signOut = firebaseAuth.signOut;
        cloud.setPersistence = firebaseAuth.setPersistence;
        cloud.browserLocalPersistence = firebaseAuth.browserLocalPersistence;

        cloud.getFirestore = firebaseFirestore.getFirestore;
        cloud.doc = firebaseFirestore.doc;
        cloud.setDoc = firebaseFirestore.setDoc;
        cloud.updateDoc = firebaseFirestore.updateDoc;
        cloud.deleteDoc = firebaseFirestore.deleteDoc;
        cloud.getDocs = firebaseFirestore.getDocs;
        cloud.writeBatch = firebaseFirestore.writeBatch;
        cloud.collection = firebaseFirestore.collection;
        cloud.query = firebaseFirestore.query;
        cloud.orderBy = firebaseFirestore.orderBy;
        cloud.onSnapshot = firebaseFirestore.onSnapshot;

        cloud.app = cloud.initializeApp(firebaseConfig);
        cloud.auth = cloud.getAuth(cloud.app);
        cloud.db = cloud.getFirestore(cloud.app);

        await cloud.setPersistence(cloud.auth, cloud.browserLocalPersistence);

        state.cloudReady = true;

        // Complete redirect-based sign-in flows when popup is blocked.
        try {
            await cloud.getRedirectResult(cloud.auth);
        } catch (error) {
            showToast(readableAuthError(error), "error");
        }

        cloud.onAuthStateChanged(cloud.auth, async (user) => {
            if (user && !userIsAuthorizedOwner(user)) {
                state.ownerUnlocked = false;
                state.activeOwnerEmail = user.email || "";
                updateOwnerUI();
                showToast("Signed in account is not authorized for owner access.", "error");
                await cloud.signOut(cloud.auth);
                return;
            }

            state.ownerUnlocked = Boolean(user);
            state.activeOwnerEmail = user?.email || "";
            updateOwnerUI();
        });

        subscribeToCloudContent();
        return true;
    } catch (_error) {
        console.error("Cloud auth not available, using local fallback.", _error.message);
        state.cloudReady = false;
        return false;
    }
}

function subscribeToCloudContent() {
    if (!state.cloudReady || !cloud.db) return;

    const productsQuery = cloud.query(cloud.collection(cloud.db, "products"), cloud.orderBy("createdAt", "desc"));
    cloud.unsubscribeProducts = cloud.onSnapshot(
        productsQuery,
        (snapshot) => {
            const items = snapshot.docs
                .map((docSnap) => normalizeProduct({ id: docSnap.id, ...docSnap.data() }))
                .filter(Boolean);
            if (items.length > 0) {
                state.products = items;
                saveLocalFallback();
                applyAllUI();
            } else {
                state.products = clone(defaultProducts);
                applyAllUI();
            }
        },
        (_error) => {
            showToast("Could not sync products from cloud.", "error");
        }
    );

    cloud.unsubscribeSettings = cloud.onSnapshot(
        cloud.doc(cloud.db, "site", "main"),
        (docSnap) => {
            if (docSnap.exists()) {
                state.settings = normalizeSettings(docSnap.data());
                saveLocalFallback();
                applyAllUI();
            }
        },
        (_error) => {
            showToast("Could not sync settings from cloud.", "error");
        }
    );
}

async function saveProductToCloud(product, isUpdate) {
    const payload = {
        ...product,
        updatedAt: Date.now()
    };
    if (!isUpdate) {
        payload.createdAt = Date.now();
    }

    if (isUpdate) {
        await cloud.updateDoc(cloud.doc(cloud.db, "products", product.id), payload);
    } else {
        await cloud.setDoc(cloud.doc(cloud.db, "products", product.id), payload);
    }
}

async function deleteProductFromCloud(productId) {
    await cloud.deleteDoc(cloud.doc(cloud.db, "products", productId));
}

async function resetTemplatesInCloud() {
    const docs = await cloud.getDocs(cloud.collection(cloud.db, "products"));
    const batch = cloud.writeBatch(cloud.db);

    docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
    });

    const now = Date.now();
    defaultProducts.forEach((product, index) => {
        const prepared = normalizeProduct({
            ...product,
            createdAt: now + index,
            updatedAt: now + index
        });
        if (!prepared) return;
        batch.set(cloud.doc(cloud.db, "products", prepared.id), prepared);
    });

    await batch.commit();
}

async function saveSettingsToCloud() {
    await cloud.setDoc(cloud.doc(cloud.db, "site", "main"), state.settings, { merge: true });
}

async function replaceCloudDataFromBackup(backup) {
    const docs = await cloud.getDocs(cloud.collection(cloud.db, "products"));
    const batch = cloud.writeBatch(cloud.db);

    docs.forEach((docSnap) => batch.delete(docSnap.ref));

    backup.products.forEach((item) => {
        const prepared = normalizeProduct(item);
        if (!prepared) return;
        batch.set(cloud.doc(cloud.db, "products", prepared.id), prepared);
    });

    batch.set(cloud.doc(cloud.db, "site", "main"), normalizeSettings(backup.settings || {}), { merge: true });
    await batch.commit();
}

function bindSecretTriggers() {
    let tapCount = 0;
    let tapResetTimer = null;
    const secretPhrase = "kasireddi";

    if (elements.brandSecretTap) {
        elements.brandSecretTap.addEventListener("click", (event) => {
            event.preventDefault();
            tapCount += 1;

            if (tapResetTimer) clearTimeout(tapResetTimer);
            tapResetTimer = setTimeout(() => {
                tapCount = 0;
            }, 1400);

            if (tapCount >= 5) {
                tapCount = 0;
                openDevModal();
            }
        });
    }

    window.addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "d") {
            event.preventDefault();
            openDevModal();
            return;
        }

        if (state.devModalOpen) {
            if (event.key === "Escape") closeDevModal();
            return;
        }

        if (event.key.length === 1) {
            state.typedSecretBuffer = `${state.typedSecretBuffer}${event.key.toLowerCase()}`.slice(-secretPhrase.length);
            if (state.typedSecretBuffer === secretPhrase) {
                state.typedSecretBuffer = "";
                openDevModal();
            }
        }
    });

    if (location.hash.toLowerCase() === "#dev-kd") {
        openDevModal();
        history.replaceState(null, "", `${location.pathname}${location.search}`);
    }
}

function bindEvents() {
    if (elements.mobileMenuBtn && elements.navLinks) {
        elements.mobileMenuBtn.addEventListener("click", () => {
            elements.navLinks.classList.toggle("active");
        });

        elements.navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                elements.navLinks.classList.remove("active");
            });
        });
    }

    [elements.searchInput, elements.categoryFilter, elements.badgeFilter, elements.sortFilter]
        .filter(Boolean)
        .forEach((node) => {
            node.addEventListener("input", renderDeals);
            node.addEventListener("change", renderDeals);
        });

    document.querySelectorAll(".category-card").forEach((card) => {
        card.addEventListener("click", () => {
            if (!elements.categoryFilter) return;
            elements.categoryFilter.value = card.dataset.category;
            renderDeals();
            document.querySelector("#best-deals")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    if (elements.dealsGrid) {
        elements.dealsGrid.addEventListener("click", (event) => {
            const button = event.target.closest("[data-action='open'][data-id]");
            if (!button) return;

            const product = state.products.find((item) => item.id === button.dataset.id);
            if (!product) return;

            if (!product.affiliateUrl) {
                showToast("Affiliate link will be added soon.", "info");
                return;
            }

            window.open(product.affiliateUrl, "_blank", "noopener,noreferrer");
        });
    }

    if (elements.inquiryForm) {
        elements.inquiryForm.addEventListener("submit", (event) => {
            event.preventDefault();
            elements.inquiryForm.reset();
            showToast("Inquiry received. Connect backend mail service for delivery.", "info");
        });
    }

    if (elements.devCloseBtn) {
        elements.devCloseBtn.addEventListener("click", closeDevModal);
    }

    if (elements.devBackdrop) {
        elements.devBackdrop.addEventListener("click", closeDevModal);
    }

    if (elements.ownerLoginForm) {
        elements.ownerLoginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!state.cloudReady || !cloud.auth) {
                showToast("Cloud auth is not configured yet.", "error");
                return;
            }

            const email = elements.ownerEmailLogin?.value.trim();
            const password = elements.ownerPasswordLogin?.value;
            if (!email || !password) {
                showToast("Enter owner email and password.", "error");
                return;
            }

            try {
                await cloud.signInWithEmailAndPassword(cloud.auth, email, password);
                if (elements.ownerPasswordLogin) elements.ownerPasswordLogin.value = "";
                showToast("Sign in successful.", "success");
            } catch (_error) {
                showToast("Invalid owner credentials or unauthorized account.", "error");
            }
        });
    }

    if (elements.ownerGoogleLoginBtn) {
        elements.ownerGoogleLoginBtn.addEventListener("click", async () => {
            if (!state.cloudReady || !cloud.auth || !cloud.signInWithPopup || !cloud.signInWithRedirect || !cloud.GoogleAuthProvider) {
                showToast("Cloud auth is not configured yet.", "error");
                return;
            }

            try {
                const provider = new cloud.GoogleAuthProvider();
                provider.setCustomParameters({ prompt: "select_account" });
                await cloud.signInWithPopup(cloud.auth, provider);
                showToast("Google sign in successful.", "success");
            } catch (error) {
                if (error?.code === "auth/popup-blocked") {
                    showToast(readableAuthError(error), "info");
                    const provider = new cloud.GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: "select_account" });
                    await cloud.signInWithRedirect(cloud.auth, provider);
                    return;
                }
                showToast(readableAuthError(error), "error");
            }
        });
    }

    if (elements.ownerLogoutBtn) {
        elements.ownerLogoutBtn.addEventListener("click", async () => {
            if (!state.cloudReady || !cloud.auth) return;
            try {
                await cloud.signOut(cloud.auth);
                showToast("Signed out.", "info");
            } catch (_error) {
                showToast("Could not sign out.", "error");
            }
        });
    }

    if (elements.adminTabs.length > 0) {
        elements.adminTabs.forEach((tabButton) => {
            tabButton.addEventListener("click", () => {
                if (!state.ownerUnlocked) return;
                setActiveTab(tabButton.dataset.tab);
            });
        });
    }

    if (elements.productForm) {
        elements.productForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!state.ownerUnlocked || !state.cloudReady) {
                showToast("Only authenticated owner can manage products.", "error");
                return;
            }

            const payload = {
                id: elements.productForm.querySelector("#productId").value || `p-${Date.now()}`,
                brand: elements.productForm.querySelector("#productBrand").value,
                title: elements.productForm.querySelector("#productTitle").value,
                category: elements.productForm.querySelector("#productCategory").value,
                badge: elements.productForm.querySelector("#productBadge").value,
                listPrice: elements.productForm.querySelector("#productListPrice").value,
                dealPrice: elements.productForm.querySelector("#productDealPrice").value,
                coupon: elements.productForm.querySelector("#productCoupon").value,
                expiresOn: elements.productForm.querySelector("#productExpires").value,
                affiliateUrl: elements.productForm.querySelector("#productAffiliateUrl").value,
                imageUrl: elements.productForm.querySelector("#productImageUrl").value,
                note: elements.productForm.querySelector("#productNote").value,
                featured: elements.productForm.querySelector("#productFeatured").checked,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            const normalized = normalizeProduct(payload);
            if (!normalized) {
                showToast("Please provide valid product details.", "error");
                return;
            }

            const existing = state.products.some((item) => item.id === normalized.id);

            try {
                await saveProductToCloud(normalized, existing);
                resetProductForm();
                showToast(existing ? "Product updated." : "Product created.", "success");
            } catch (_error) {
                showToast("Failed to save product to cloud.", "error");
            }
        });
    }

    if (elements.productCancelEditBtn) {
        elements.productCancelEditBtn.addEventListener("click", resetProductForm);
    }

    if (elements.resetDealsBtn) {
        elements.resetDealsBtn.addEventListener("click", async () => {
            if (!state.ownerUnlocked || !state.cloudReady) {
                showToast("Only authenticated owner can reset templates.", "error");
                return;
            }

            if (!window.confirm("Reset to default templates?")) return;

            try {
                await resetTemplatesInCloud();
                showToast("Templates reset successfully.", "success");
            } catch (_error) {
                showToast("Failed to reset templates.", "error");
            }
        });
    }

    if (elements.adminProductsTableBody) {
        elements.adminProductsTableBody.addEventListener("click", async (event) => {
            const target = event.target.closest("[data-action][data-id]");
            if (!target || !state.ownerUnlocked || !state.cloudReady) return;

            const productId = target.dataset.id;
            const product = state.products.find((item) => item.id === productId);
            if (!product) return;

            if (target.dataset.action === "edit-product") {
                fillProductForm(product);
                setActiveTab("products");
                elements.productForm?.scrollIntoView({ behavior: "smooth", block: "center" });
            }

            if (target.dataset.action === "delete-product") {
                if (!window.confirm("Delete this product?")) return;
                try {
                    await deleteProductFromCloud(productId);
                    showToast("Product deleted.", "success");
                } catch (_error) {
                    showToast("Failed to delete product.", "error");
                }
            }
        });
    }

    if (elements.promotionForm) {
        elements.promotionForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!state.ownerUnlocked || !state.cloudReady) {
                showToast("Only authenticated owner can update promotion.", "error");
                return;
            }

            const promotion = {
                enabled: elements.promotionForm.querySelector("#promoEnabledInput").checked,
                label: elements.promotionForm.querySelector("#promoLabelInput").value.trim(),
                heading: elements.promotionForm.querySelector("#promoHeadingInput").value.trim(),
                text: elements.promotionForm.querySelector("#promoTextInput").value.trim(),
                ctaText: elements.promotionForm.querySelector("#promoCtaTextInput").value.trim(),
                ctaUrl: safeActionUrl(elements.promotionForm.querySelector("#promoCtaUrlInput").value.trim())
            };

            if (!promotion.label || !promotion.heading || !promotion.text || !promotion.ctaText || !promotion.ctaUrl) {
                showToast("Fill all promotion fields with valid values.", "error");
                return;
            }

            state.settings.promo = promotion;

            try {
                await saveSettingsToCloud();
                showToast("Promotion updated.", "success");
            } catch (_error) {
                showToast("Failed to update promotion.", "error");
            }
        });
    }

    if (elements.siteSettingsForm) {
        elements.siteSettingsForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!state.ownerUnlocked || !state.cloudReady) {
                showToast("Only authenticated owner can update site settings.", "error");
                return;
            }

            const siteTitle = elements.siteSettingsForm.querySelector("#siteTitleInput").value.trim();
            const heroTitle = elements.siteSettingsForm.querySelector("#heroTitleInput").value.trim();
            const heroSubtitle = elements.siteSettingsForm.querySelector("#heroSubtitleInput").value.trim();
            const privateEmail = elements.siteSettingsForm.querySelector("#privateEmailInput").value.trim();
            const whatsappRaw = elements.siteSettingsForm.querySelector("#whatsAppInput").value.trim();
            const whatsAppLink = whatsappRaw ? safeExternalUrl(whatsappRaw) : "";

            if (!siteTitle || !heroTitle || !heroSubtitle || !privateEmail) {
                showToast("Site title, hero content, and owner email are required.", "error");
                return;
            }

            if (whatsappRaw && !whatsAppLink) {
                showToast("Enter a valid WhatsApp URL.", "error");
                return;
            }

            state.settings.site = {
                siteTitle,
                heroTitle,
                heroSubtitle,
                privateEmail,
                whatsAppLink
            };

            try {
                await saveSettingsToCloud();
                showToast("Site settings updated.", "success");
            } catch (_error) {
                showToast("Failed to update site settings.", "error");
            }
        });
    }

    if (elements.adsSettingsForm) {
        elements.adsSettingsForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!state.ownerUnlocked || !state.cloudReady) {
                showToast("Only authenticated owner can update ads settings.", "error");
                return;
            }

            const ads = {
                enabled: elements.adsSettingsForm.querySelector("#adsEnabledInput").checked,
                heading: elements.adsSettingsForm.querySelector("#adsHeadingInput").value.trim(),
                client: elements.adsSettingsForm.querySelector("#adsClientInput").value.trim(),
                slot: elements.adsSettingsForm.querySelector("#adsSlotInput").value.trim(),
                disclaimer: elements.adsSettingsForm.querySelector("#adsDisclaimerInput").value.trim()
            };

            if (!ads.heading || !ads.client || !ads.slot || !ads.disclaimer) {
                showToast("All ads fields are required.", "error");
                return;
            }

            state.settings.ads = ads;
            state.adsInitialized = false;

            try {
                await saveSettingsToCloud();
                showToast("Ads settings updated.", "success");
            } catch (_error) {
                showToast("Failed to update ads settings.", "error");
            }
        });
    }

    if (elements.exportDataBtn) {
        elements.exportDataBtn.addEventListener("click", () => {
            if (!state.ownerUnlocked) {
                showToast("Only authenticated owner can export data.", "error");
                return;
            }

            const payload = {
                exportedAt: new Date().toISOString(),
                products: state.products,
                settings: state.settings
            };

            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "kasireddi-deals-backup.json";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            showToast("Backup exported.", "success");
        });
    }

    if (elements.importDataBtn) {
        elements.importDataBtn.addEventListener("click", async () => {
            if (!state.ownerUnlocked || !state.cloudReady) {
                showToast("Only authenticated owner can import backup.", "error");
                return;
            }

            const file = elements.importDataInput?.files?.[0];
            if (!file) {
                showToast("Select a backup JSON file.", "error");
                return;
            }

            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const parsed = JSON.parse(String(reader.result));
                    const products = Array.isArray(parsed.products)
                        ? parsed.products.map(normalizeProduct).filter(Boolean)
                        : [];
                    if (products.length === 0) {
                        showToast("Backup has no valid products.", "error");
                        return;
                    }

                    const backupPayload = {
                        products,
                        settings: normalizeSettings(parsed.settings || {})
                    };

                    await replaceCloudDataFromBackup(backupPayload);
                    showToast("Backup imported.", "success");
                } catch (_error) {
                    showToast("Invalid backup file.", "error");
                }
            };
            reader.readAsText(file);
        });
    }

    document.addEventListener("click", (event) => {
        const anchor = event.target.closest('a[href^="#"]');
        if (!anchor) return;
        const targetSelector = anchor.getAttribute("href");
        if (!targetSelector || targetSelector === "#") return;
        const target = document.querySelector(targetSelector);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    window.addEventListener("scroll", () => {
        if (!elements.navbar) return;
        elements.navbar.style.boxShadow = window.scrollY > 16 ? "0 8px 28px rgba(15, 28, 51, 0.14)" : "none";
    });

    bindSecretTriggers();
}

function loadInitialState() {
    loadLocalFallback();
    applyAllUI();
}

async function init() {
    bindEvents();
    setActiveTab("products");
    loadAdminFormsFromState();
    loadInitialState();

    const cloudOk = await initializeCloudSecurity();
    updateOwnerUI();
}

document.addEventListener("DOMContentLoaded", () => {
    init().catch(() => {
        showToast("App initialization failed.", "error");
    });
});