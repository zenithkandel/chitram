const { db } = require('../config/database');

// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.execute(`
            SELECT 
                unique_id,
                order_id,
                customer_name,
                customer_phone,
                customer_email,
                shipping_address,
                customer_message,
                total_amount,
                item_count,
                item_list,
                creation_date_time,
                received_date_time,
                delivered_date_time,
                status
            FROM orders 
            ORDER BY creation_date_time DESC
        `);

        // Parse JSON item_list for each order
        const ordersWithParsedItems = orders.map(order => {
            try {
                order.item_list = JSON.parse(order.item_list);
            } catch (e) {
                order.item_list = [];
            }
            return order;
        });

        res.render('admin/orders', { 
            orders: ordersWithParsedItems,
            error: null,
            success: null 
        });
    } catch (error) {
        console.error('Orders fetch error:', error);
        res.render('admin/orders', { 
            orders: [],
            error: 'Error loading orders data',
            success: null 
        });
    }
};

// Get single order for viewing
const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const [order] = await db.execute(
            'SELECT * FROM orders WHERE unique_id = ?',
            [id]
        );

        if (order.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Parse JSON item_list
        try {
            order[0].item_list = JSON.parse(order[0].item_list);
        } catch (e) {
            order[0].item_list = [];
        }

        res.json({ order: order[0] });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Error fetching order data' });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['placed', 'seen', 'contacted', 'sold', 'delivered', 'canceled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Check if order exists
        const [existingOrder] = await db.execute(
            'SELECT unique_id, order_id, status FROM orders WHERE unique_id = ?',
            [id]
        );

        if (existingOrder.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update timestamps based on status
        let updateQuery = 'UPDATE orders SET status = ?';
        let updateParams = [status];

        if (status === 'seen' && existingOrder[0].status === 'placed') {
            updateQuery += ', received_date_time = NOW()';
        } else if (status === 'delivered') {
            updateQuery += ', delivered_date_time = NOW()';
        }

        updateQuery += ' WHERE unique_id = ?';
        updateParams.push(id);

        await db.execute(updateQuery, updateParams);

        res.json({ 
            success: `Order ${existingOrder[0].order_id} status updated to ${status}`,
            status: status 
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Error updating order status' });
    }
};

// Delete order
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if order exists
        const [existingOrder] = await db.execute(
            'SELECT unique_id, order_id FROM orders WHERE unique_id = ?',
            [id]
        );

        if (existingOrder.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Delete the order
        await db.execute(
            'DELETE FROM orders WHERE unique_id = ?',
            [id]
        );

        res.json({ success: `Order ${existingOrder[0].order_id} has been deleted successfully` });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: 'Error deleting order' });
    }
};

// Create a new order (for customer checkout)
const createOrder = async (req, res) => {
    try {
        const {
            order_id,
            customer_name,
            customer_phone,
            customer_email,
            shipping_address,
            customer_message,
            total_amount,
            item_count,
            item_list
        } = req.body;

        // Validate required fields
        if (!order_id || !customer_name || !customer_phone || !customer_email || 
            !shipping_address || !total_amount || !item_count || !item_list) {
            return res.status(400).json({ 
                error: 'Missing required fields for order creation' 
            });
        }

        // Validate item_list is an array
        if (!Array.isArray(item_list) || item_list.length === 0) {
            return res.status(400).json({ 
                error: 'Item list must be a non-empty array' 
            });
        }

        // Check if order_id already exists
        const [existingOrder] = await db.execute(
            'SELECT order_id FROM orders WHERE order_id = ?',
            [order_id]
        );

        if (existingOrder.length > 0) {
            return res.status(400).json({ 
                error: 'Order ID already exists' 
            });
        }

        // Insert the new order
        const [result] = await db.execute(`
            INSERT INTO orders (
                order_id,
                customer_name,
                customer_phone,
                customer_email,
                shipping_address,
                customer_message,
                total_amount,
                item_count,
                item_list,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'placed')
        `, [
            order_id,
            customer_name,
            customer_phone,
            customer_email,
            shipping_address,
            customer_message || '',
            total_amount,
            item_count,
            JSON.stringify(item_list)
        ]);

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order_id: order_id,
            order_unique_id: result.insertId
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ 
            error: 'Error placing order. Please try again.' 
        });
    }
};

module.exports = {
    getAllOrders,
    getOrder,
    updateOrderStatus,
    deleteOrder,
    createOrder
};
