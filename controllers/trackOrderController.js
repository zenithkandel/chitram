const { db } = require('../config/database');

// Get track orders page
const getTrackOrdersPage = (req, res) => {
    res.render('track-orders', { 
        order: null,
        error: null,
        searched: false
    });
};

// Track order by order ID and email
const trackOrder = async (req, res) => {
    try {
        const { order_id, email } = req.body;

        // Validate required fields
        if (!order_id || !email) {
            return res.json({ 
                error: 'Both Order ID and Email address are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({ 
                error: 'Please enter a valid email address'
            });
        }

        // Search for order in database
        const [orders] = await db.execute(`
            SELECT 
                order_id,
                customer_name,
                customer_email,
                customer_phone,
                total_amount,
                item_count,
                item_list,
                status,
                creation_date_time,
                received_date_time,
                delivered_date_time
            FROM orders 
            WHERE order_id = ? AND customer_email = ?
        `, [order_id.trim(), email.trim().toLowerCase()]);

        if (orders.length === 0) {
            return res.json({ 
                error: 'No order found with the provided Order ID and Email address. Please check your details and try again.'
            });
        }

        const order = orders[0];
        
        // Format dates for display
        const formatDate = (dateString) => {
            if (!dateString) return null;
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        // Parse item list if it's JSON
        let itemList = [];
        try {
            itemList = typeof order.item_list === 'string' 
                ? JSON.parse(order.item_list) 
                : order.item_list;
        } catch (e) {
            itemList = [];
        }

        const orderDetails = {
            order_id: order.order_id,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            total_amount: parseFloat(order.total_amount),
            item_count: order.item_count,
            item_list: itemList,
            status: order.status,
            creation_date: formatDate(order.creation_date_time),
            received_date: formatDate(order.received_date_time),
            delivered_date: formatDate(order.delivered_date_time)
        };

        res.json({ 
            success: true,
            order: orderDetails
        });

    } catch (error) {
        console.error('Track order error:', error);
        res.status(500).json({ 
            error: 'Sorry, there was an error tracking your order. Please try again.'
        });
    }
};

module.exports = {
    getTrackOrdersPage,
    trackOrder
};
