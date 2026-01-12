const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');

// MongoDB URI from environment
const mongoURI = process.env.MONGO_URI;

// Create GridFS storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads', // Collection name will be uploads.files and uploads.chunks
                    metadata: {
                        originalName: file.originalname,
                        uploadDate: new Date(),
                        mimetype: file.mimetype
                    }
                };
                resolve(fileInfo);
            });
        });
    }
});

// Create multer instance with GridFS storage
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;
