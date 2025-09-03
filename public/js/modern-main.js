// 
// चित्रम् - Modern JavaScript
// Ultra-Modern Interactive Features 2025
//

// Modern DOM Ready function
const ready = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
};

// Modern Mobile Navigation
class ModernNavigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.mobileToggle = document.getElementById('mobile-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.init();
    }

    init() {
        this.handleScroll();
        this.handleMobileMenu();
        this.handleNavLinks();
    }

    handleScroll() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Add scrolled class for styling
            if (currentScrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            
            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                this.navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });
    }

    handleMobileMenu() {
        if (this.mobileToggle && this.navMenu) {
            this.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.navbar.contains(e.target) && this.navMenu.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        this.mobileToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }

    closeMobileMenu() {
        this.mobileToggle.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
    }

    handleNavLinks() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMobileMenu();
                }
            });
        });
    }
}

// Modern Image Loading with Intersection Observer
class ModernImageLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.imageObserver = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver(this.onIntersection.bind(this));
            this.images.forEach(img => this.imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    }

    onIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.preloadImage(entry.target);
                this.imageObserver.unobserve(entry.target);
            }
        });
    }

    preloadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        img.src = src;
        img.classList.add('loading');
        
        img.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
        };
        
        img.onerror = () => {
            img.classList.remove('loading');
            img.classList.add('error');
            this.handleImageError(img);
        };
    }

    loadAllImages() {
        this.images.forEach(img => this.preloadImage(img));
    }

    handleImageError(img) {
        if (img.getAttribute('data-error-handled') === 'true') return;
        
        img.setAttribute('data-error-handled', 'true');
        img.src = '/images/placeholder-artwork.svg';
        img.alt = 'Image not available';
        img.classList.add('placeholder-image');
    }
}

// Modern Scroll Animations
class ModernScrollAnimations {
    constructor() {
        this.animatedElements = document.querySelectorAll('.animate-on-scroll');
        this.observer = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(this.onIntersection.bind(this), {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            this.animatedElements.forEach(el => this.observer.observe(el));
        }
    }

    onIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// Modern Cart Management
class ModernCart {
    constructor() {
        this.cartCount = document.getElementById('cart-count');
        this.cartItems = JSON.parse(localStorage.getItem('chitram_cart') || '[]');
        this.init();
    }

    init() {
        this.updateCartDisplay();
        this.bindCartEvents();
    }

    addToCart(artwork) {
        const existingItem = this.cartItems.find(item => item.id === artwork.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cartItems.push({...artwork, quantity: 1});
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showCartNotification('Item added to cart!');
    }

    removeFromCart(artworkId) {
        this.cartItems = this.cartItems.filter(item => item.id !== artworkId);
        this.saveCart();
        this.updateCartDisplay();
        this.showCartNotification('Item removed from cart!');
    }

    saveCart() {
        localStorage.setItem('chitram_cart', JSON.stringify(this.cartItems));
    }

    updateCartDisplay() {
        const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
        
        if (this.cartCount) {
            if (totalItems > 0) {
                this.cartCount.textContent = totalItems;
                this.cartCount.style.display = 'flex';
            } else {
                this.cartCount.style.display = 'none';
            }
        }
    }

    bindCartEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                const button = e.target.matches('.add-to-cart-btn') ? e.target : e.target.closest('.add-to-cart-btn');
                const artworkData = this.extractArtworkData(button);
                if (artworkData) {
                    this.addToCart(artworkData);
                }
            }
        });
    }

    extractArtworkData(button) {
        const card = button.closest('.artwork-card');
        if (!card) return null;

        return {
            id: card.dataset.artworkId || Date.now().toString(),
            name: card.querySelector('.artwork-title')?.textContent || 'Unknown Artwork',
            artist: card.querySelector('.artwork-artist')?.textContent || 'Unknown Artist',
            price: card.querySelector('.artwork-price')?.textContent || '0',
            image: card.querySelector('.artwork-image img')?.src || ''
        };
    }

    showCartNotification(message) {
        this.createNotification(message, 'success');
    }

    createNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Modern Theme Manager
class ModernThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('chitram_theme') || 'dark';
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindThemeEvents();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('chitram_theme', this.currentTheme);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
    }

    bindThemeEvents() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// Modern Smooth Scroll
class ModernSmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        // Handle anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }
}

// Modern Performance Monitor
class ModernPerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }
        });

        // Monitor largest contentful paint
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime, 'ms');
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // You could send this to an error tracking service
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

// Initialize all modern features when DOM is ready
ready(() => {
    // Initialize core features
    new ModernNavigation();
    new ModernImageLoader();
    new ModernScrollAnimations();
    new ModernCart();
    new ModernThemeManager();
    new ModernSmoothScroll();
    new ModernPerformanceMonitor();

    // Add loading states
    document.body.classList.add('js-enabled');
    
    // Remove loading class after everything is initialized
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 100);

    console.log('🎨 चित्रम् Modern JavaScript initialized successfully!');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ModernNavigation,
        ModernImageLoader,
        ModernScrollAnimations,
        ModernCart,
        ModernThemeManager,
        ModernSmoothScroll
    };
}
