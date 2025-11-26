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
        expires: "3 days left"
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
        expires: "5 days left"
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
        expires: "2 days left"
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
        expires: "7 days left"
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
        expires: "1 day left"
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
        expires: "4 days left"
    }
];

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

// Generate deal card HTML (reusable function)
function generateDealCardHTML(deal) {
    return `
        <div class="deal-card" data-category="${deal.category}">
            <div class="deal-image">
                ${deal.icon}
                <span class="deal-badge ${deal.badge}">${deal.discount}</span>
            </div>
            <div class="deal-content">
                <span class="deal-brand">${deal.brand}</span>
                <h3>${deal.title}</h3>
                <p>${deal.description}</p>
                <div class="deal-price">
                    <span class="price-current">$${deal.currentPrice.toFixed(2)}</span>
                    <span class="price-original">$${deal.originalPrice.toFixed(2)}</span>
                </div>
                <div class="deal-footer">
                    <button class="deal-btn" onclick="handleDealClick(${deal.id})">Get Deal</button>
                    <span class="deal-expires">⏰ ${deal.expires}</span>
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
        // In a real application, this would redirect to an affiliate link
        showToast(`Redirecting you to ${deal.brand} for the "${deal.title}" deal!`, 'success');
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
    renderDeals();
});

// Expose handleDealClick to global scope for onclick handlers
window.handleDealClick = handleDealClick;
