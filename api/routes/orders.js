const express = require('express');
const router = express.Router();
const pool = require('../db/db');
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Guest checkout and order management APIs
 */

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: Guest checkout for a template
 *     tags: [Orders]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               template_id:
 *                 type: integer
 *               customer_name:
 *                 type: string
 *               customer_email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created and file path returned
 */
router.post('/checkout', async (req, res) => {
    const { template_id, customer_name, customer_email } = req.body;

    try {
        // Fetch template details to get price and file URL
        const templateRes = await pool.query('SELECT * FROM templates WHERE id = $1', [template_id]);
        if (templateRes.rows.length === 0) return res.status(404).json({ message: "Template not found" });

        const template = templateRes.rows[0];

        // Create order record
        const orderRes = await pool.query(
            'INSERT INTO orders (template_id, customer_name, customer_email, total_price) VALUES ($1, $2, $3, $4) RETURNING *',
            [template_id, customer_name, customer_email, template.price]
        );

        res.status(201).json({
            message: "Order placed successfully",
            order: orderRes.rows[0],
            file_url: template.file_url,
            template_title: template.title
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
