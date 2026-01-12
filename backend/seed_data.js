const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lead = require('./models/Lead');
const CompanyProfile = require('./models/CompanyProfile');
const Partner = require('./models/Partner');

// Load env vars
dotenv.config();

const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const seedData = async () => {
    // Connect using the shared config
    await connectDB();

    try {
        // --- 1. Clear existing generic test data (optional, maybe keep user data?) ---
        // For safety, let's just ADD data, or maybe clear only if they strictly asked "fake data u implement string to the the mongo db for each... make sure it has fake data"
        // The user said "make sure it has fake data", implies population.
        // Let's create a prefix to easily identify and delete if needed, or just standard realistic names.

        console.log("🌱 Seeding Company Profiles...");
        const companies = [
            {
                legalName: "Acme Federal Solutions LLC",
                ueid: "F9B8C7D6E5",
                cageCode: "1A2B3",
                businessType: "LLC",
                samStatus: "Active",
                primaryAddress: { city: "Arlington", state: "VA" },
                docType: "CompanyProfile"
            },
            {
                legalName: "Global Tech Innovators Inc.",
                ueid: "X1Y2Z3A4B5",
                cageCode: "5C6D7",
                businessType: "Corporation",
                samStatus: "Active",
                primaryAddress: { city: "Seattle", state: "WA" },
                businessSize: "Large"
            },
            {
                legalName: "CyberGuard Systems",
                ueid: "L9K8J7H6G5",
                cageCode: "9E8F7",
                businessType: "S-Corp",
                samStatus: "Expired",
                primaryAddress: { city: "Huntsville", state: "AL" },
                businessSize: "Small"
            },
            {
                legalName: "Vertex Aerospace Partners",
                ueid: "M1N2O3P4Q5",
                cageCode: "3R4S5",
                businessType: "Partnership",
                samStatus: "Active",
                primaryAddress: { city: "Denver", state: "CO" }
            },
            {
                legalName: "Orion Data Analytics",
                ueid: "T6U7V8W9X0",
                cageCode: "1Z2A3",
                businessType: "Sole Proprietorship",
                samStatus: "Not Registered",
                primaryAddress: { city: "Austin", state: "TX" }
            }
        ];

        for (const company of companies) {
            // Check if exists to avoid dupes
            const exists = await CompanyProfile.findOne({ legalName: company.legalName });
            if (!exists) {
                await CompanyProfile.create({
                    ...company,
                    legalName: company.legalName,
                    uei: company.ueid,
                    // Add some defaults for required schema fields if any
                });
            }
        }

        console.log("🌱 Seeding Leads (Pipeline & Forecast)...");
        const leads = [
            // FEDERAL
            { name: "DoD Cloud Migration", dealType: "Pipeline", sector: "Federal", value: 5000000, stage: "Proposal", winProbability: 60, location: "Washington DC" },
            { name: "NASA IT Support Services", dealType: "Forecast", sector: "Federal", value: 12000000, forecastStage: "High Priority", winProbability: 40, location: "Houston TX" },

            // STATE
            { name: "Texas DMV Modernization", dealType: "Pipeline", sector: "State", value: 2500000, stage: "Negotiation", winProbability: 80, location: "Austin TX" },
            { name: "California Wildfire AI Detection", dealType: "Forecast", sector: "State", value: 8000000, forecastStage: "Best Case", winProbability: 30, location: "Sacramento CA" },

            // OTHER
            { name: "City of Miami Smart Grid", dealType: "Pipeline", sector: "Others", value: 1500000, stage: "Discovery", winProbability: 20, location: "Miami FL" },
            { name: "Private Hospital Network Security", dealType: "Forecast", sector: "Others", value: 750000, forecastStage: "Commit", winProbability: 90, location: "Chicago IL" }
        ];

        for (const lead of leads) {
            const exists = await Lead.findOne({ name: lead.name });
            if (!exists) {
                await Lead.create({
                    ...lead,
                    description: `Auto-generated lead for ${lead.name}`,
                    contactPerson: "Jane Doe",
                    email: "jane@example.com",
                    phone: "555-0123"
                });
            }
        }

        console.log("🌱 Seeding Partners...");
        const partners = [
            { name: "Raytheon Technologies", type: "Prime", status: "Active", email: "contact@raytheon.com" },
            { name: "Booz Allen Hamilton", type: "Sub", status: "Active", email: "partners@bah.com" },
            { name: "Local IT Services LLC", type: "Sub", status: "Pending", email: "info@localit.com" }
        ];

        for (const partner of partners) {
            const exists = await Partner.findOne({ name: partner.name });
            if (!exists) {
                await Partner.create(partner);
            }
        }

        console.log("✅ Seeding Complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedData();
