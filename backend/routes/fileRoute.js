const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// GET /api/files/:filename - Retrieve file from GridFS
router.get('/:filename', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

        // Find the file
        const files = await bucket.find({ filename: req.params.filename }).toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = files[0];

        // Set appropriate headers
        res.set('Content-Type', file.metadata?.mimetype || 'application/octet-stream');
        res.set('Content-Disposition', `inline; filename="${file.metadata?.originalName || file.filename}"`);

        // Stream the file
        const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
        downloadStream.pipe(res);

        downloadStream.on('error', (error) => {
            console.error('Download stream error:', error);
            res.status(500).json({ error: 'Error streaming file' });
        });

    } catch (error) {
        console.error('File retrieval error:', error);
        res.status(500).json({ error: 'Server error retrieving file' });
    }
});

// DELETE /api/files/:filename - Delete file from GridFS
router.delete('/:filename', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

        // Find the file
        const files = await bucket.find({ filename: req.params.filename }).toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete the file
        await bucket.delete(files[0]._id);
        res.json({ message: 'File deleted successfully' });

    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({ error: 'Server error deleting file' });
    }
});

module.exports = router;
