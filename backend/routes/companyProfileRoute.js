const express = require('express');
const router = express.Router();
const CompanyProfile = require('../models/CompanyProfile');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

// Configure Multer for file uploads (Disk Storage - same as leadRoute)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Use a unique filename
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// NOTE: File retrieval is handled by express.static('/uploads') in server.js
// We don't need a specific route for serving files anymore if we return the direct URL.


/* ================= GET ALL PROFILES ================= */
router.get('/', auth, async (req, res) => {
    try {
        const profiles = await CompanyProfile.find().sort({ updatedAt: -1 });
        res.json(profiles);
    } catch (err) {
        console.error('Error fetching profiles:', err);
        res.status(500).json({ message: 'Failed to fetch company profiles' });
    }
});

/* ================= GET SINGLE PROFILE ================= */
router.get('/:id', auth, async (req, res) => {
    try {
        const profile = await CompanyProfile.findById(req.params.id);
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

/* ================= CREATE NEW PROFILE ================= */
router.post('/', auth, async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        console.log("Creating Profile - User:", req.user.id);
        console.log("Creating Profile - Body:", JSON.stringify(req.body, null, 2));

        // Sanitize body: Remove empty strings to prevent Mongoose Enum validation errors
        const sanitizedBody = { ...req.body };
        Object.keys(sanitizedBody).forEach(key => {
            if (sanitizedBody[key] === "") {
                sanitizedBody[key] = undefined;
            }
        });

        const profile = await CompanyProfile.create({
            ...sanitizedBody,
            updatedBy: req.user.id
        });
        res.status(201).json(profile);
    } catch (err) {
        console.error('Error creating profile:', err);
        res.status(500).json({ message: 'Failed to create profile', error: err.toString() });
    }
});

/* ================= UPDATE PROFILE ================= */
router.put('/:id', auth, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // Remove immutable fields
        const updates = { ...req.body };
        delete updates._id;
        delete updates.__v;
        delete updates.createdAt;
        delete updates.updatedAt; // Managed by timestamps: true
        delete updates.createdBy;

        // Sanitize string fields
        Object.keys(updates).forEach(key => {
            if (updates[key] === "") {
                updates[key] = undefined;
            }
        });

        const profile = await CompanyProfile.findByIdAndUpdate(
            req.params.id,
            { ...updates, updatedBy: req.user.id },
            { new: true, runValidators: true }
        );

        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        req.app.get('io').emit('company-profile:updated');
        res.json(profile);
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: 'Failed to update profile', error: err.toString() });
    }
});

/* ================= DELETE PROFILE ================= */
router.delete('/:id', auth, async (req, res) => {
    try {
        await CompanyProfile.findByIdAndDelete(req.params.id);
        res.json({ message: 'Profile deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete profile' });
    }
});

/* ================= UPLOAD ATTACHMENT ================= */
router.post('/upload', auth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Return the URL for static serving
    res.json({
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        uploadedAt: new Date()
    });
});

/* ================= CERTIFICATION ATTACHMENTS ================= */
router.post('/:id/certifications', auth, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        const attachment = {
            name: req.file.originalname,
            url: `/uploads/${req.file.filename}`,
            uploadedAt: new Date()
        };

        const profile = await CompanyProfile.findByIdAndUpdate(
            req.params.id,
            { $push: { certificationAttachments: attachment } },
            { new: true }
        );

        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile.certificationAttachments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// Delete a certification file
router.delete('/:id/certifications/:fileId', auth, async (req, res) => {
    try {
        const profile = await CompanyProfile.findByIdAndUpdate(
            req.params.id,
            { $pull: { certificationAttachments: { _id: req.params.fileId } } },
            { new: true }
        );

        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        // Note: Actual file in GridFS is NOT deleted here to keep it simple, 
        // but removing reference from profile is done.

        res.json(profile.certificationAttachments);
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

module.exports = router;
