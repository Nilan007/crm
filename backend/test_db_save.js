const mongoose = require('mongoose');
const CompanyProfile = require('./models/CompanyProfile');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");

        const sample = {
            legalName: "Test Company LLC",
            businessType: "LLC",
            yearEstablished: 2020,
            websiteUrl: "https://example.com",
            primaryAddress: {
                street: "123 Main St",
                city: "Test City",
                state: "TX",
                zip: "75001"
            },
            // updatedBy: "someObjectId" // Simulate user if needed, or leave out if not required in schema strictness (it is ref but not required unless validated?)
        };

        // Mock User ID if needed (Generate random ObjectId)
        const userId = new mongoose.Types.ObjectId();
        sample.updatedBy = userId;

        console.log("Creating Profile...");
        const res = await CompanyProfile.create(sample);
        console.log("Profile Created Successfully:", res._id);

    } catch (err) {
        console.error("SAVE FAILED:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
