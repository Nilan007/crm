const express = require('express');
const router = express.Router();
const Partner = require('../models/Partner');
const auth = require('../middleware/authMiddleware');
const pdf = require('pdf-parse');
const { analyzeCapabilityText } = require('../services/capabilityService');
const upload = require('../config/gridfs');

// GET all partners
router.get('/', auth, async (req, res) => {
    try {
        const partners = await Partner.find().sort({ createdAt: -1 });
        console.log(`📋 Fetching ${partners.length} partners`);
        if (partners.length > 0) {
            console.log('First partner state:', partners[0].state);
        }
        res.json(partners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE a new partner
router.post('/', auth, async (req, res) => {
    try {
        console.log('Create Partner Request Body:', req.body);
        console.log('State field value:', req.body.state);
        const newPartner = new Partner(req.body);
        const savedPartner = await newPartner.save();
        console.log('✅ Saved Partner:', JSON.stringify(savedPartner, null, 2));
        res.status(201).json(savedPartner);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPLOAD Capability Statement
router.post('/:id/upload', auth, upload.single('file'), async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id);
        if (!partner) return res.status(404).json({ msg: 'Partner not found' });

        const fileData = {
            name: req.file.originalname,
            url: `/api/files/${req.file.filename}`
        };

        partner.files.push(fileData);
        await partner.save();

        res.json(fileData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ANALYZE Capability Statement (DISABLED - requires GridFS stream implementation)
router.post('/:id/analyze', auth, async (req, res) => {
    res.status(501).json({
        msg: 'PDF analysis temporarily disabled during GridFS migration. Feature will be restored soon.'
    });
});

// UPDATE a partner
router.put('/:id', auth, async (req, res) => {
    try {
        console.log('Update Partner Request Body:', req.body);
        console.log('State field value:', req.body.state);
        const updatedPartner = await Partner.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        console.log('✅ Updated Partner:', JSON.stringify(updatedPartner, null, 2));
        res.json(updatedPartner);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE a partner
router.delete('/:id', auth, async (req, res) => {
    try {
        await Partner.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Partner deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
