const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const CompanyProfile = require("../models/CompanyProfile");
const Partner = require("../models/Partner");
const User = require("../models/User");

// WARNING: This route deletes/adds data. In production, protect this!
router.get("/", async (req, res) => {
    try {
        console.log("🌱 Starting Seeding Process via API...");

        // 0. Fetch a Default User for Leads (REQUIRED)
        const defaultUser = await User.findOne({});
        if (!defaultUser) {
            return res.status(400).json({ error: "No users found in DB. Please register at least one user first." });
        }
        console.log(`👤 Assigning leads to user: ${defaultUser.username || defaultUser.email}`);

        // 1. Seed Company Profiles
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

        let createdCompanies = 0;
        for (const company of companies) {
            const exists = await CompanyProfile.findOne({ legalName: company.legalName });
            if (!exists) {
                await CompanyProfile.create(company);
                createdCompanies++;
            }
        }

        // 2. Seed Leads (Forecast & Pipeline)
        // VALID STAGES: "opp sourced", "opp Nurturing", "opp qualified", "opp in-progress", "Win", "lost"
        const leads = [
            // FEDERAL
            { name: "DoD Cloud Migration", dealType: "Pipeline", sector: "Federal", value: 5000000, stage: "opp in-progress", winProbability: 60, location: "Washington DC" },
            { name: "NASA IT Support Services", dealType: "Forecast", sector: "Federal", value: 12000000, forecastStage: "High Priority", stage: "opp qualified", winProbability: 40, location: "Houston TX" },

            // STATE
            { name: "Texas DMV Modernization", dealType: "Pipeline", sector: "State", value: 2500000, stage: "opp in-progress", winProbability: 80, location: "Austin TX" },
            { name: "California Wildfire AI Detection", dealType: "Forecast", sector: "State", value: 8000000, forecastStage: "High Priority", stage: "opp Nurturing", winProbability: 30, location: "Sacramento CA" },

            // OTHER
            { name: "City of Miami Smart Grid", dealType: "Pipeline", sector: "Others", value: 1500000, stage: "opp sourced", winProbability: 20, location: "Miami FL" },
            { name: "Private Hospital Network Security", dealType: "Forecast", sector: "Others", value: 750000, forecastStage: "Low Priority", stage: "Win", winProbability: 90, location: "Chicago IL" }
        ];

        let createdLeads = 0;
        for (const lead of leads) {
            const exists = await Lead.findOne({ name: lead.name });
            if (!exists) {
                await Lead.create({
                    ...lead,
                    user: defaultUser._id, // Assign to valid user
                    description: `Auto-generated lead for ${lead.name}`,
                    contactPerson: "Jane Doe",
                    email: "jane@example.com",
                    phone: "555-0123"
                });
                createdLeads++;
            }
        }

        // 3. Seed Partners
        const partners = [
            { name: "Raytheon Technologies", type: "Prime", status: "Active", email: "contact@raytheon.com" },
            { name: "Booz Allen Hamilton", type: "Sub", status: "Active", email: "partners@bah.com" },
            { name: "Local IT Services LLC", type: "Sub", status: "Pending", email: "info@localit.com" }
        ];

        let createdPartners = 0;
        for (const partner of partners) {
            const exists = await Partner.findOne({ name: partner.name });
            if (!exists) {
                await Partner.create(partner);
                createdPartners++;
            }
        }

        res.json({
            message: "Seeding Complete ✅",
            stats: {
                companiesAdded: createdCompanies,
                leadsAdded: createdLeads,
                partnersAdded: createdPartners
            }
        });
    } catch (err) {
        console.error("Seeding Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
