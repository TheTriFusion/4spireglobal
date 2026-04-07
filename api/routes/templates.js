const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = file.fieldname === 'thumbnail' ? 'uploads/thumbnails' : 'uploads/files';
        cb(null, path.join(__dirname, '..', dest));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Templates
 *   description: Template management APIs
 */

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get all approved templates
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: List of approved templates
 */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM templates WHERE status = $1 ORDER BY created_at DESC', ['approved']);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/templates/my:
 *   get:
 *     summary: Get templates uploaded by the logged-in user
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's templates
 */
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM templates WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: Upload a new template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Template uploaded successfully
 */
router.post('/', authenticateToken, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
    const { title, price } = req.body;
    const thumbnail = `uploads/thumbnails/${req.files['thumbnail'][0].filename}`;
    const file_url = `uploads/files/${req.files['file'][0].filename}`;

    try {
        const result = await pool.query(
            'INSERT INTO templates (user_id, title, price, thumbnail, file_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, title, price, thumbnail, file_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/templates/{id}:
 *   put:
 *     summary: Update template title and price
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Template updated
 */
router.put('/:id', authenticateToken, async (req, res) => {
    const { title, price } = req.body;
    try {
        const result = await pool.query(
            'UPDATE templates SET title = $1, price = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [title, price, req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Template not found or unauthorized" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/templates/{id}:
 *   delete:
 *     summary: Delete a template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Template deleted
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        let result;
        if (req.user.role === 'admin') {
            result = await pool.query('DELETE FROM templates WHERE id = $1 RETURNING *', [req.params.id]);
        } else {
            result = await pool.query('DELETE FROM templates WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
        }
        
        if (result.rows.length === 0) return res.status(404).json({ message: "Template not found" });
        res.json({ message: "Template deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/templates/admin/all:
 *   get:
 *     summary: Get all templates (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all templates
 */
router.get('/admin/all', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/templates/admin/pending:
 *   get:
 *     summary: Get all pending templates (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending templates
 */
router.get('/admin/pending', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM templates WHERE status = $1 ORDER BY created_at DESC', ['pending']);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/templates/admin/approve/{id}:
 *   patch:
 *     summary: Approve a template (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Template approved
 */
router.patch('/admin/approve/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const result = await pool.query('UPDATE templates SET status = $1 WHERE id = $2 RETURNING *', ['approved', req.params.id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/templates/admin/reject/{id}:
 *   patch:
 *     summary: Reject a template (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Template rejected
 */
router.patch('/admin/reject/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const result = await pool.query('UPDATE templates SET status = $1 WHERE id = $2 RETURNING *', ['rejected', req.params.id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

