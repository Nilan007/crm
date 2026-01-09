const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const auth = require('../middleware/authMiddleware');

// GET /api/contacts - Retrieve all contacts from all leads
router.get('/', auth, async (req, res) => {
    try {
        const leads = await Lead.find({}); // Get all leads (Shared view)

        // Extract contacts from each lead and flatten into a single array
        const allContacts = leads.flatMap(lead => {
            if (!lead.contacts) return [];
            return lead.contacts.map((contact, index) => ({
                ...contact.toObject ? contact.toObject() : contact,
                sourceLeadId: lead._id,
                sourceLeadName: lead.name,
                originalIndex: index
            }));
        });

        res.json(allContacts);
    } catch (err) {
        console.error('Error fetching contacts:', err);
        res.status(500).json({ message: 'Server Error fetching contacts' });
    }
});

module.exports = router;
