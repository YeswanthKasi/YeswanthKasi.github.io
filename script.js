// Sample deals data
const dealsData = [
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

const customDealsStorageKey = 'kasireddiCustomDeals';

// Toast notification system
function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
    `;

    // Add to document
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function safeURL(url) {
    try {
        const parsed = new URL(url);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return parsed.toString();
        }
    } catch (error) {
        return null;
    }
    return null;
}

function saveCustomDeals() {
    const customDeals = dealsData.filter(deal => deal.isCustom);
    localStorage.setItem(customDealsStorageKey, JSON.stringify(customDeals));
}

function loadCustomDeals() {
    try {
        const saved = localStorage.getItem(customDealsStorageKey);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return;

        parsed.forEach(deal => {
            if (
                deal &&
                typeof deal.id === 'number' &&
                typeof deal.brand === 'string' &&
                typeof deal.title === 'string' &&
                typeof deal.description === 'string' &&
                typeof deal.discount === 'string' &&
                typeof deal.badge === 'string' &&
                typeof deal.category === 'string' &&
                typeof deal.icon === 'string' &&
                typeof deal.expires === 'string' &&
                typeof deal.currentPrice === 'number' &&
                typeof deal.originalPrice === 'number' &&
                typeof deal.affiliateUrl === 'string'
            ) {
                dealsData.push(deal);
            }
        });
    } catch (error) {
        showToast('Could not load saved custom products.', 'info');
    }
}

// Generate deal card HTML (reusable function)
function generateDealCardHTML(deal) {
    return `
        <div class="deal-card" data-category="${deal.category}">
            <div class="deal-image">
                ${escapeHtml(deal.icon)}
                <span class="deal-badge ${deal.badge}">${deal.discount}</span>
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
            </div>
        </div>
    `;
}

// DOM Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const navbar = document.getElementById('navbar');
const dealsGrid = document.getElementById('dealsGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const newsletterForm = document.getElementById('newsletterForm');
const contactForm = document.getElementById('contactForm');
const productForm = document.getElementById('productForm');

// Mobile Menu Toggle
if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });
}

// Navbar scroll effect
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }
    lastScrollY = window.scrollY;
});

// Render Deals
function renderDeals(filter = 'all') {
    if (!dealsGrid) return;

    let filteredDeals = dealsData;
    
    if (filter !== 'all') {
        filteredDeals = dealsData.filter(deal => deal.badge === filter);
    }

    dealsGrid.innerHTML = filteredDeals.map(generateDealCardHTML).join('');
}

// Filter deals
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDeals(btn.dataset.filter);
    });
});

// Handle deal click
function handleDealClick(dealId) {
    const deal = dealsData.find(d => d.id === dealId);
    if (deal) {
        const redirectUrl = safeURL(deal.affiliateUrl);
        if (!redirectUrl) {
            showToast('This deal does not have a valid affiliate link yet.', 'info');
            return;
        }
        showToast(`Redirecting you to ${deal.brand} for the "${deal.title}" deal!`, 'success');
        window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    }
}

// Newsletter form submission
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        if (email) {
            showToast('Thank you for subscribing! You\'ll receive our best deals in your inbox.', 'success');
            newsletterForm.reset();
        }
    });
}

// Contact form submission
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Thank you for your message! We\'ll get back to you soon.', 'success');
        contactForm.reset();
    });
}

if (productForm) {
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const brand = productForm.querySelector('#productBrand').value.trim();
        const title = productForm.querySelector('#productTitle').value.trim();
        const description = productForm.querySelector('#productDescription').value.trim();
        const category = productForm.querySelector('#productCategory').value;
        const badge = productForm.querySelector('#productBadge').value;
        const icon = productForm.querySelector('#productIcon').value.trim();
        const expires = productForm.querySelector('#productExpires').value.trim();
        const affiliateUrl = productForm.querySelector('#productAffiliateUrl').value.trim();
        const currentPrice = Number(productForm.querySelector('#productCurrentPrice').value);
        const originalPrice = Number(productForm.querySelector('#productOriginalPrice').value);

        const cleanAffiliateUrl = safeURL(affiliateUrl);
        if (!cleanAffiliateUrl) {
            showToast('Please enter a valid http(s) affiliate URL.', 'info');
            return;
        }

        if (!brand || !title || !description || !category || !badge || !icon || !expires) {
            showToast('Please fill in all required product details.', 'info');
            return;
        }

        if (currentPrice <= 0 || originalPrice <= 0 || currentPrice >= originalPrice) {
            showToast('Enter valid prices. Current price must be less than original price.', 'info');
            return;
        }

        const nextId = dealsData.reduce((max, deal) => Math.max(max, deal.id), 0) + 1;
        const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

        dealsData.unshift({
            id: nextId,
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
            affiliateUrl: cleanAffiliateUrl,
            isCustom: true
        });

        saveCustomDeals();
        renderDeals('all');
        filterBtns.forEach(btn => btn.classList.remove('active'));
        if (filterBtns[0]) {
            filterBtns[0].classList.add('active');
        }
        productForm.reset();
        showToast('Affiliate product added and published successfully!', 'success');
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Category card click handlers
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.dataset.category;
        // Scroll to deals section
        document.getElementById('deals').scrollIntoView({ behavior: 'smooth' });
        
        // Filter deals by category
        const filteredDeals = dealsData.filter(deal => deal.category === category);
        if (filteredDeals.length > 0) {
            dealsGrid.innerHTML = filteredDeals.map(generateDealCardHTML).join('');
        }
        
        // Reset filter buttons
        filterBtns.forEach(btn => btn.classList.remove('active'));
        filterBtns[0].classList.add('active');
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe sections for animation
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCustomDeals();
    renderDeals();
});

// Expose handleDealClick to global scope for onclick handlers
window.handleDealClick = handleDealClick;
