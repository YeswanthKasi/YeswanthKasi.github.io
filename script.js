const defaultDealsData = [
    {
        id: 1,
        brand: "TechGadgets",
        title: "Wireless Noise-Canceling Headphones",
        description: "Premium sound quality with 30-hour battery life",
        currentPrice: 149.99,
        originalPrice: 299.99,
        discount: "50% OFF",
        badge: "hot",
        category: "electronics",
        icon: "🎧",
        expires: "3 days left",
        affiliateUrl: "https://www.amazon.com/"
    },
    {
        id: 2,
        brand: "FashionHub",
        title: "Designer Summer Collection",
        description: "Trendy styles for the modern wardrobe",
        currentPrice: 79.99,
        originalPrice: 159.99,
        discount: "50% OFF",
        badge: "new",
        category: "fashion",
        icon: "👗",
        expires: "5 days left",
        affiliateUrl: "https://www.amazon.com/"
    },
    {
        id: 3,
        brand: "HomeEssentials",
        title: "Smart Home Starter Kit",
        description: "Transform your home with smart devices",
        currentPrice: 199.99,
        originalPrice: 399.99,
        discount: "50% OFF",
        badge: "hot",
        category: "home",
        icon: "🏠",
        expires: "2 days left",
        affiliateUrl: "https://www.amazon.com/"
    },
    {
        id: 4,
        brand: "FitLife",
        title: "Premium Fitness Tracker",
        description: "Track your health goals with precision",
        currentPrice: 89.99,
        originalPrice: 179.99,
        discount: "50% OFF",
        badge: "new",
        category: "health",
        icon: "⌚",
        expires: "7 days left",
        affiliateUrl: "https://www.amazon.com/"
    },
    {
        id: 5,
        brand: "BeautyBox",
        title: "Luxury Skincare Bundle",
        description: "Complete skincare routine essentials",
        currentPrice: 129.99,
        originalPrice: 259.99,
        discount: "50% OFF",
        badge: "ending",
        category: "beauty",
        icon: "💆",
        expires: "1 day left",
        affiliateUrl: "https://www.amazon.com/"
    },
    {
        id: 6,
        brand: "TravelMore",
        title: "Exclusive Hotel Deals",
        description: "5-star accommodations at budget prices",
        currentPrice: 299.99,
        originalPrice: 599.99,
        discount: "50% OFF",
        badge: "hot",
        category: "travel",
        icon: "🏨",
        expires: "4 days left",
        affiliateUrl: "https://www.amazon.com/"
    }
];

const defaultSiteSettings = {
    promoHeading: "Today’s Featured Promotion",
    promoText: "Discover special affiliate offers handpicked by Kasireddi Deals.",
    promoCtaText: "View Promotion",
    promoCtaUrl: "#deals",
    promoEnabled: true,
    adsClient: "ca-pub-XXXXXXXXXXXXXXXX",
    adsSlot: "1234567890",
    adsEnabled: true
};

const storageKeys = {
    deals: "kasireddiManagedDeals",
    ownerHash: "kasireddiOwnerHash",
    settings: "kasireddiSiteSettings",
    ownerSession: "kasireddiOwnerUnlocked"
};

let dealsData = JSON.parse(JSON.stringify(defaultDealsData));
let siteSettings = { ...defaultSiteSettings };
let ownerUnlocked = false;
let adsInitialized = false;

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");
const navbar = document.getElementById("navbar");
const dealsGrid = document.getElementById("dealsGrid");
const filterBtns = document.querySelectorAll(".filter-btn");
const newsletterForm = document.getElementById("newsletterForm");
const contactForm = document.getElementById("contactForm");
const productForm = document.getElementById("productForm");
const productSubmitBtn = document.getElementById("productSubmitBtn");
const productCancelEditBtn = document.getElementById("productCancelEditBtn");
const resetDealsBtn = document.getElementById("resetDealsBtn");

const ownerSetupForm = document.getElementById("ownerSetupForm");
const ownerLoginForm = document.getElementById("ownerLoginForm");
const ownerLogoutBtn = document.getElementById("ownerLogoutBtn");
const ownerAccessStatus = document.getElementById("ownerAccessStatus");
const productManager = document.getElementById("productManager");
const siteSettingsPanel = document.getElementById("siteSettings");

const siteSettingsForm = document.getElementById("siteSettingsForm");
const promoBanner = document.getElementById("promoBanner");
const promoHeading = document.getElementById("promoHeading");
const promoText = document.getElementById("promoText");
const promoCta = document.getElementById("promoCta");
const adSlotSection = document.getElementById("ad-slot");
const adsDisplay = document.getElementById("adsDisplay");

function showToast(message, type = "success") {
    const existingToast = document.querySelector(".toast-notification");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === "success" ? "✓" : "ℹ"}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function safeURL(url) {
    if (typeof url !== "string") return null;
    if (url.startsWith("#")) return url;
    try {
        const parsed = new URL(url);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return parsed.toString();
        }
    } catch (_error) {
        return null;
    }
    return null;
}

async function hashPassword(password) {
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
        const encoded = new TextEncoder().encode(password);
        const digest = await window.crypto.subtle.digest("SHA-256", encoded);
        return Array.from(new Uint8Array(digest))
            .map((value) => value.toString(16).padStart(2, "0"))
            .join("");
    }
    return btoa(password);
}

function normalizeDeal(raw) {
    if (!raw || typeof raw !== "object") return null;
    if (
        typeof raw.id !== "number" ||
        typeof raw.brand !== "string" ||
        typeof raw.title !== "string" ||
        typeof raw.description !== "string" ||
        typeof raw.discount !== "string" ||
        typeof raw.badge !== "string" ||
        typeof raw.category !== "string" ||
        typeof raw.icon !== "string" ||
        typeof raw.expires !== "string" ||
        typeof raw.currentPrice !== "number" ||
        typeof raw.originalPrice !== "number" ||
        typeof raw.affiliateUrl !== "string"
    ) {
        return null;
    }

    if (raw.currentPrice <= 0 || raw.originalPrice <= 0 || raw.currentPrice >= raw.originalPrice) return null;
    if (!safeURL(raw.affiliateUrl)) return null;

    return {
        id: raw.id,
        brand: raw.brand,
        title: raw.title,
        description: raw.description,
        currentPrice: raw.currentPrice,
        originalPrice: raw.originalPrice,
        discount: raw.discount,
        badge: raw.badge,
        category: raw.category,
        icon: raw.icon,
        expires: raw.expires,
        affiliateUrl: raw.affiliateUrl
    };
}

function saveManagedDeals() {
    localStorage.setItem(storageKeys.deals, JSON.stringify(dealsData));
}

function loadManagedDeals() {
    try {
        const saved = localStorage.getItem(storageKeys.deals);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return;
        const normalized = parsed.map(normalizeDeal).filter(Boolean);
        if (normalized.length > 0) dealsData = normalized;
    } catch (_error) {
        showToast("Could not load saved deals. Using defaults.", "info");
    }
}

function saveSiteSettings() {
    localStorage.setItem(storageKeys.settings, JSON.stringify(siteSettings));
}

function loadSiteSettings() {
    try {
        const saved = localStorage.getItem(storageKeys.settings);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        siteSettings = { ...defaultSiteSettings, ...parsed };
    } catch (_error) {
        showToast("Could not load saved site settings. Using defaults.", "info");
    }
}

function updateSettingsForm() {
    if (!siteSettingsForm) return;
    siteSettingsForm.querySelector("#promoHeadingInput").value = siteSettings.promoHeading;
    siteSettingsForm.querySelector("#promoTextInput").value = siteSettings.promoText;
    siteSettingsForm.querySelector("#promoCtaTextInput").value = siteSettings.promoCtaText;
    siteSettingsForm.querySelector("#promoCtaUrlInput").value = siteSettings.promoCtaUrl;
    siteSettingsForm.querySelector("#promoEnabledInput").checked = Boolean(siteSettings.promoEnabled);
    siteSettingsForm.querySelector("#adsClientInput").value = siteSettings.adsClient;
    siteSettingsForm.querySelector("#adsSlotInput").value = siteSettings.adsSlot;
    siteSettingsForm.querySelector("#adsEnabledInput").checked = Boolean(siteSettings.adsEnabled);
}

function applySiteSettings() {
    if (promoBanner) {
        promoBanner.classList.toggle("hidden", !siteSettings.promoEnabled);
    }
    if (promoHeading) promoHeading.textContent = siteSettings.promoHeading;
    if (promoText) promoText.textContent = siteSettings.promoText;
    if (promoCta) {
        promoCta.textContent = siteSettings.promoCtaText;
        promoCta.setAttribute("href", siteSettings.promoCtaUrl);
    }

    if (adSlotSection) {
        adSlotSection.classList.toggle("hidden", !siteSettings.adsEnabled);
    }
    if (adsDisplay) {
        adsDisplay.setAttribute("data-ad-client", siteSettings.adsClient);
        adsDisplay.setAttribute("data-ad-slot", siteSettings.adsSlot);
    }

    if (siteSettings.adsEnabled && !adsInitialized && window.adsbygoogle) {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            adsInitialized = true;
        } catch (_error) {
            showToast("Ad slot is configured but could not initialize in this environment.", "info");
        }
    }
}

function generateDealCardHTML(deal) {
    const ownerActions = ownerUnlocked
        ? `
            <div class="deal-admin-actions">
                <button class="deal-btn deal-admin-btn" data-action="edit" data-id="${deal.id}">Edit</button>
                <button class="deal-btn deal-admin-btn deal-delete-btn" data-action="delete" data-id="${deal.id}">Delete</button>
            </div>
        `
        : "";

    return `
        <div class="deal-card" data-category="${deal.category}">
            <div class="deal-image">
                ${escapeHtml(deal.icon)}
                <span class="deal-badge ${deal.badge}">${escapeHtml(deal.discount)}</span>
            </div>
            <div class="deal-content">
                <span class="deal-brand">${escapeHtml(deal.brand)}</span>
                <h3>${escapeHtml(deal.title)}</h3>
                <p>${escapeHtml(deal.description)}</p>
                <div class="deal-price">
                    <span class="price-current">$${deal.currentPrice.toFixed(2)}</span>
                    <span class="price-original">$${deal.originalPrice.toFixed(2)}</span>
                </div>
                <div class="deal-footer">
                    <button class="deal-btn" onclick="handleDealClick(${deal.id})">Get Deal</button>
                    <span class="deal-expires">⏰ ${escapeHtml(deal.expires)}</span>
                </div>
                ${ownerActions}
            </div>
        </div>
    `;
}

function renderDeals(filter = "all") {
    if (!dealsGrid) return;
    const filteredDeals = filter === "all" ? dealsData : dealsData.filter((deal) => deal.badge === filter);
    dealsGrid.innerHTML = filteredDeals.map(generateDealCardHTML).join("");
}

function handleDealClick(dealId) {
    const deal = dealsData.find((item) => item.id === dealId);
    if (!deal) return;
    const redirectUrl = safeURL(deal.affiliateUrl);
    if (!redirectUrl) {
        showToast("This deal does not have a valid affiliate link yet.", "info");
        return;
    }
    showToast(`Redirecting you to ${deal.brand} for the "${deal.title}" deal!`, "success");
    window.open(redirectUrl, "_blank", "noopener,noreferrer");
}

function resetProductForm() {
    if (!productForm) return;
    productForm.reset();
    productForm.querySelector("#productId").value = "";
    if (productSubmitBtn) productSubmitBtn.textContent = "Save Product";
}

function fillProductForm(deal) {
    if (!productForm || !deal) return;
    productForm.querySelector("#productId").value = String(deal.id);
    productForm.querySelector("#productBrand").value = deal.brand;
    productForm.querySelector("#productTitle").value = deal.title;
    productForm.querySelector("#productDescription").value = deal.description;
    productForm.querySelector("#productCategory").value = deal.category;
    productForm.querySelector("#productBadge").value = deal.badge;
    productForm.querySelector("#productIcon").value = deal.icon;
    productForm.querySelector("#productCurrentPrice").value = String(deal.currentPrice);
    productForm.querySelector("#productOriginalPrice").value = String(deal.originalPrice);
    productForm.querySelector("#productAffiliateUrl").value = deal.affiliateUrl;
    productForm.querySelector("#productExpires").value = deal.expires;
    if (productSubmitBtn) productSubmitBtn.textContent = "Update Product";
}

function updateOwnerUI() {
    const ownerHashExists = Boolean(localStorage.getItem(storageKeys.ownerHash));
    if (ownerSetupForm) ownerSetupForm.classList.toggle("hidden", ownerHashExists);
    if (ownerLoginForm) ownerLoginForm.classList.toggle("hidden", !ownerHashExists || ownerUnlocked);
    if (ownerLogoutBtn) ownerLogoutBtn.classList.toggle("hidden", !ownerUnlocked);
    if (productManager) productManager.classList.toggle("hidden", !ownerUnlocked);
    if (siteSettingsPanel) siteSettingsPanel.classList.toggle("hidden", !ownerUnlocked);

    if (!ownerAccessStatus) return;
    if (!ownerHashExists) {
        ownerAccessStatus.textContent = "Create an owner password first. Management will be locked for others.";
    } else if (ownerUnlocked) {
        ownerAccessStatus.textContent = "Owner mode unlocked. You can now manage products, promotions, and ads.";
    } else {
        ownerAccessStatus.textContent = "Management is locked. Enter owner password to continue.";
    }
}

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        mobileMenuBtn.classList.toggle("active");
    });
    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            mobileMenuBtn.classList.remove("active");
        });
    });
}

window.addEventListener("scroll", () => {
    if (!navbar) return;
    navbar.style.boxShadow =
        window.scrollY > 100
            ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            : "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
});

filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterBtns.forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");
        renderDeals(btn.dataset.filter);
    });
});

if (newsletterForm) {
    newsletterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        showToast("Thank you for subscribing! You'll receive our best deals in your inbox.", "success");
        newsletterForm.reset();
    });
}

if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
        showToast("Thank you for your message! We'll get back to you soon.", "success");
        contactForm.reset();
    });
}

if (productForm) {
    productForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!ownerUnlocked) {
            showToast("Only owner can manage products.", "info");
            return;
        }

        const productId = Number(productForm.querySelector("#productId").value || "0");
        const brand = productForm.querySelector("#productBrand").value.trim();
        const title = productForm.querySelector("#productTitle").value.trim();
        const description = productForm.querySelector("#productDescription").value.trim();
        const category = productForm.querySelector("#productCategory").value;
        const badge = productForm.querySelector("#productBadge").value;
        const icon = productForm.querySelector("#productIcon").value.trim();
        const expires = productForm.querySelector("#productExpires").value.trim();
        const affiliateUrl = productForm.querySelector("#productAffiliateUrl").value.trim();
        const currentPrice = Number(productForm.querySelector("#productCurrentPrice").value);
        const originalPrice = Number(productForm.querySelector("#productOriginalPrice").value);

        const cleanAffiliateUrl = safeURL(affiliateUrl);
        if (!cleanAffiliateUrl || cleanAffiliateUrl.startsWith("#")) {
            showToast("Please enter a valid http(s) affiliate URL.", "info");
            return;
        }
        if (!brand || !title || !description || !category || !badge || !icon || !expires) {
            showToast("Please fill in all required product details.", "info");
            return;
        }
        if (currentPrice <= 0 || originalPrice <= 0 || currentPrice >= originalPrice) {
            showToast("Enter valid prices. Current price must be less than original price.", "info");
            return;
        }

        const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        const newDeal = {
            id: productId || dealsData.reduce((max, item) => Math.max(max, item.id), 0) + 1,
            brand,
            title,
            description,
            currentPrice,
            originalPrice,
            discount: `${discountPercent}% OFF`,
            badge,
            category,
            icon,
            expires,
            affiliateUrl: cleanAffiliateUrl
        };

        if (productId) {
            dealsData = dealsData.map((item) => (item.id === productId ? newDeal : item));
            showToast("Product updated successfully.", "success");
        } else {
            dealsData.unshift(newDeal);
            showToast("Product added and published successfully.", "success");
        }

        saveManagedDeals();
        renderDeals("all");
        filterBtns.forEach((item) => item.classList.remove("active"));
        if (filterBtns[0]) filterBtns[0].classList.add("active");
        resetProductForm();
    });
}

if (productCancelEditBtn) {
    productCancelEditBtn.addEventListener("click", () => resetProductForm());
}

if (resetDealsBtn) {
    resetDealsBtn.addEventListener("click", () => {
        if (!ownerUnlocked) {
            showToast("Only owner can reset deals.", "info");
            return;
        }
        dealsData = JSON.parse(JSON.stringify(defaultDealsData));
        saveManagedDeals();
        renderDeals("all");
        resetProductForm();
        showToast("Deals reset to defaults.", "success");
    });
}

if (dealsGrid) {
    dealsGrid.addEventListener("click", (event) => {
        const target = event.target.closest("[data-action][data-id]");
        if (!target || !ownerUnlocked) return;
        const action = target.getAttribute("data-action");
        const dealId = Number(target.getAttribute("data-id"));
        const deal = dealsData.find((item) => item.id === dealId);
        if (!deal) return;

        if (action === "edit") {
            fillProductForm(deal);
            document.getElementById("productManager")?.scrollIntoView({ behavior: "smooth" });
        }
        if (action === "delete") {
            dealsData = dealsData.filter((item) => item.id !== dealId);
            saveManagedDeals();
            renderDeals("all");
            showToast("Product deleted.", "success");
        }
    });
}

if (ownerSetupForm) {
    ownerSetupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const password = ownerSetupForm.querySelector("#ownerPasswordSetup").value;
        const confirmPassword = ownerSetupForm.querySelector("#ownerPasswordSetupConfirm").value;
        if (password.length < 6) {
            showToast("Owner password must be at least 6 characters.", "info");
            return;
        }
        if (password !== confirmPassword) {
            showToast("Password confirmation does not match.", "info");
            return;
        }
        const hash = await hashPassword(password);
        localStorage.setItem(storageKeys.ownerHash, hash);
        ownerSetupForm.reset();
        showToast("Owner password created successfully.", "success");
        updateOwnerUI();
    });
}

if (ownerLoginForm) {
    ownerLoginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const password = ownerLoginForm.querySelector("#ownerPasswordLogin").value;
        const hash = await hashPassword(password);
        const savedHash = localStorage.getItem(storageKeys.ownerHash);
        if (!savedHash || hash !== savedHash) {
            showToast("Invalid owner password.", "info");
            return;
        }
        ownerUnlocked = true;
        sessionStorage.setItem(storageKeys.ownerSession, "1");
        ownerLoginForm.reset();
        updateOwnerUI();
        renderDeals("all");
        updateSettingsForm();
        showToast("Owner management unlocked.", "success");
    });
}

if (ownerLogoutBtn) {
    ownerLogoutBtn.addEventListener("click", () => {
        ownerUnlocked = false;
        sessionStorage.removeItem(storageKeys.ownerSession);
        updateOwnerUI();
        resetProductForm();
        renderDeals("all");
        showToast("Management locked.", "info");
    });
}

if (siteSettingsForm) {
    siteSettingsForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!ownerUnlocked) {
            showToast("Only owner can update site settings.", "info");
            return;
        }
        const promoHeadingInput = siteSettingsForm.querySelector("#promoHeadingInput").value.trim();
        const promoTextInput = siteSettingsForm.querySelector("#promoTextInput").value.trim();
        const promoCtaTextInput = siteSettingsForm.querySelector("#promoCtaTextInput").value.trim();
        const promoCtaUrlInput = siteSettingsForm.querySelector("#promoCtaUrlInput").value.trim();
        const promoEnabledInput = siteSettingsForm.querySelector("#promoEnabledInput").checked;
        const adsClientInput = siteSettingsForm.querySelector("#adsClientInput").value.trim();
        const adsSlotInput = siteSettingsForm.querySelector("#adsSlotInput").value.trim();
        const adsEnabledInput = siteSettingsForm.querySelector("#adsEnabledInput").checked;

        const cleanPromoUrl = safeURL(promoCtaUrlInput);
        if (!cleanPromoUrl) {
            showToast("Enter a valid promo URL (https://... or #section).", "info");
            return;
        }
        if (!promoHeadingInput || !promoTextInput || !promoCtaTextInput || !adsClientInput || !adsSlotInput) {
            showToast("Please fill in all settings fields.", "info");
            return;
        }

        siteSettings = {
            promoHeading: promoHeadingInput,
            promoText: promoTextInput,
            promoCtaText: promoCtaTextInput,
            promoCtaUrl: cleanPromoUrl,
            promoEnabled: promoEnabledInput,
            adsClient: adsClientInput,
            adsSlot: adsSlotInput,
            adsEnabled: adsEnabledInput
        };
        saveSiteSettings();
        applySiteSettings();
        showToast("Site settings saved successfully.", "success");
    });
}

document.addEventListener("click", (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
        const category = card.dataset.category;
        document.getElementById("deals")?.scrollIntoView({ behavior: "smooth" });
        const filteredDeals = dealsData.filter((deal) => deal.category === category);
        dealsGrid.innerHTML = filteredDeals.map(generateDealCardHTML).join("");
        filterBtns.forEach((btn) => btn.classList.remove("active"));
        if (filterBtns[0]) filterBtns[0].classList.add("active");
    });
});

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate-fade-in");
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
);

document.querySelectorAll("section").forEach((section) => observer.observe(section));

document.addEventListener("DOMContentLoaded", () => {
    loadManagedDeals();
    loadSiteSettings();
    ownerUnlocked = sessionStorage.getItem(storageKeys.ownerSession) === "1";
    updateOwnerUI();
    updateSettingsForm();
    applySiteSettings();
    renderDeals();
});

window.handleDealClick = handleDealClick;
