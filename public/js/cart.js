// Cart functionality for Chitram Art Platform
// Client-side cart management using localStorage

class CartManager {
    constructor() {
        this.cartKey = 'chitram_cart';
        this.init();
    }

    init() {
        // Initialize cart and update count on page load
        this.updateCartCount();
    }

    // Get cart items from localStorage
    getCartItems() {
        const cartData = localStorage.getItem(this.cartKey);
        return cartData ? JSON.parse(cartData) : [];
    }

    // Save cart items to localStorage
    saveCartItems(items) {
        localStorage.setItem(this.cartKey, JSON.stringify(items));
        this.updateCartCount();
    }

    // Add item to cart
    addToCart(artworkData) {
        const cartItems = this.getCartItems();
        
        // Check if item already exists in cart
        const existingItemIndex = cartItems.findIndex(item => item.unique_id === artworkData.unique_id);
        
        if (existingItemIndex > -1) {
            // Item already in cart
            this.showNotification('This artwork is already in your cart!', 'info');
            return false;
        }

        // Add artwork data with timestamp
        const cartItem = {
            unique_id: artworkData.unique_id,
            art_name: artworkData.art_name,
            cost: artworkData.cost,
            art_image: artworkData.art_image,
            artist_unique_id: artworkData.artist_unique_id,
            artist_name: artworkData.artist_name || '',
            added_at: new Date().toISOString()
        };

        cartItems.push(cartItem);
        this.saveCartItems(cartItems);
        
        this.showNotification(`"${artworkData.art_name}" has been added to your cart!`, 'success');
        return true;
    }

    // Remove item from cart
    removeFromCart(artworkId) {
        const cartItems = this.getCartItems();
        const filteredItems = cartItems.filter(item => item.unique_id !== artworkId);
        this.saveCartItems(filteredItems);
        
        this.showNotification('Item removed from cart', 'info');
    }

    // Get cart count
    getCartCount() {
        return this.getCartItems().length;
    }

    // Update cart count in navbar
    updateCartCount() {
        const count = this.getCartCount();
        const cartCountElements = document.querySelectorAll('#cart-count, .cart-count');
        
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = count;
                element.style.display = count > 0 ? 'inline' : 'none';
            }
        });
    }

    // Get total cart amount
    getTotalAmount() {
        const cartItems = this.getCartItems();
        return cartItems.reduce((total, item) => total + parseFloat(item.cost), 0);
    }

    // Clear cart
    clearCart() {
        localStorage.removeItem(this.cartKey);
        this.updateCartCount();
        this.showNotification('Cart cleared', 'info');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `cart-notification cart-notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            min-width: 250px;
            animation: slideInRight 0.3s ease;
        `;

        // Add animation keyframes if not already added
        if (!document.querySelector('#cart-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'cart-notification-styles';
            styles.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Global function for add to cart (for backward compatibility)
function addToCart(artworkId, artworkName, cost, artImage, artistName, artistId) {
    // If called with just ID (from existing buttons), we need to fetch data
    if (typeof artworkId === 'string' && !artworkName) {
        // This means it's called from existing buttons with just ID
        // We'll need to extract data from the page context
        const artworkData = extractArtworkDataFromPage(artworkId);
        if (artworkData) {
            return cartManager.addToCart(artworkData);
        } else {
            console.error('Could not find artwork data for ID:', artworkId);
            cartManager.showNotification('Error adding item to cart', 'error');
            return false;
        }
    }
    
    // If called with all parameters
    const artworkData = {
        unique_id: artworkId,
        art_name: artworkName,
        cost: parseFloat(cost),
        art_image: artImage,
        artist_name: artistName,
        artist_unique_id: artistId
    };
    
    return cartManager.addToCart(artworkData);
}

// Function to extract artwork data from page context
function extractArtworkDataFromPage(artworkId) {
    // Try to find artwork data in page context
    // This will work for artwork-details page and artist-profile page
    
    // Check if we're on artwork details page
    const artworkNameEl = document.querySelector('h1.artwork-title, .artwork-title');
    const artworkCostEl = document.querySelector('.price, .cost, .artwork-price');
    const artworkImageEl = document.querySelector('.artwork-image img, .art-image img, .artwork-main-image img');
    const artistNameEl = document.querySelector('.artist-name, .artist-info h3, .artist-info h2');
    
    if (artworkNameEl && artworkCostEl && artworkImageEl) {
        return {
            unique_id: artworkId,
            art_name: artworkNameEl.textContent.trim(),
            cost: parseFloat(artworkCostEl.textContent.replace(/[^\d.]/g, '')),
            art_image: artworkImageEl.src,
            artist_name: artistNameEl ? artistNameEl.textContent.trim() : '',
            artist_unique_id: '' // We'll need to extract this from page context
        };
    }
    
    // Check if we're on artist profile page - look for artwork card data
    const artworkCard = document.querySelector(`[data-artwork-id="${artworkId}"]`);
    if (artworkCard) {
        const nameEl = artworkCard.querySelector('.artwork-title, .art-name, .artwork-name');
        const costEl = artworkCard.querySelector('.artwork-price, .cost, .price');
        const imageEl = artworkCard.querySelector('img');
        
        if (nameEl && costEl && imageEl) {
            return {
                unique_id: artworkId,
                art_name: nameEl.textContent.trim(),
                cost: parseFloat(costEl.textContent.replace(/[^\d.]/g, '')),
                art_image: imageEl.src,
                artist_name: document.querySelector('.artist-name, .artist-info h2, .artist-profile h1')?.textContent.trim() || '',
                artist_unique_id: '' // Extract from page URL or context
            };
        }
    }
    
    return null;
}

// Remove from cart function
function removeFromCart(artworkId) {
    cartManager.removeFromCart(artworkId);
}

// Get cart count function
function getCartCount() {
    return cartManager.getCartCount();
}

// Get cart items function
function getCartItems() {
    return cartManager.getCartItems();
}

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    cartManager.updateCartCount();
});
