const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const CompanyProfile = require("../models/CompanyProfile");
const Partner = require("../models/Partner");
const User = require("../models/User");
const StateOrg = require("../models/StateOrg");
const Proposal = require("../models/Proposal");

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

        // 2. Seed Leads (Forecast & Pipeline) with CONTACTS
        // VALID STAGES: "opp sourced", "opp Nurturing", "opp qualified", "opp in-progress", "Win", "lost"
        const leads = [
            // --- FEDERAL ---
            {
                name: "DoD Cloud Migration", dealType: "Pipeline", sector: "Federal", value: 5000000, stage: "opp in-progress", winProbability: 60, location: "Arlington VA",
                contacts: [{ name: "Gen. Mark", surname: "Milley", role: "Decision Maker", email: "mark.milley@dod.gov", phone: "703-555-0101", state: "VA" }]
            },
            {
                name: "NASA IT Support Services", dealType: "Forecast", sector: "Federal", value: 12000000, forecastStage: "High Priority", stage: "opp qualified", winProbability: 40, location: "Houston TX",
                contacts: [{ name: "Sarah", surname: "Johnson", role: "Procurement Officer", email: "s.johnson@nasa.gov", phone: "281-555-0199", state: "TX", department: "IT Procurement" }]
            },
            {
                name: "DHS Cyber Incident Response", dealType: "Pipeline", sector: "Federal", value: 8500000, stage: "opp Nurturing", winProbability: 25, location: "Washington DC",
                contacts: [{ name: "Agent Smith", surname: "Doe", role: "Technical Lead", email: "smith.doe@dhs.gov", phone: "202-555-0123", state: "DC" }]
            },
            {
                name: "VA Hospital Records Digitization", dealType: "Pipeline", sector: "Federal", value: 3000000, stage: "Win", winProbability: 100, location: "Bethesda MD",
                contacts: [{ name: "Dr. Emily", surname: "Blunt", role: "Chief Medical Officer", email: "emily.blunt@va.gov", phone: "301-555-0888", state: "MD" }]
            },
            {
                name: "Dept of Energy Solar Research", dealType: "Forecast", sector: "Federal", value: 4200000, forecastStage: "Low Priority", stage: "opp sourced", winProbability: 10, location: "Golden CO",
                contacts: [{ name: "Robert", surname: "Oppenheimer", role: "Project Director", email: "robert.o@energy.gov", phone: "303-555-0144", state: "CO" }]
            },
            {
                name: "FBI Biometric Database Upgrade", dealType: "Pipeline", sector: "Federal", value: 15000000, stage: "opp in-progress", winProbability: 75, location: "Quantico VA",
                contacts: [{ name: "Dir. Christopher", surname: "Wray", role: "Stakeholder", email: "c.wray@fbi.gov", state: "VA" }]
            },
            { name: "USPS Fleet Electrification", dealType: "Pipeline", sector: "Federal", value: 55000000, stage: "lost", winProbability: 0, location: "Washington DC" },

            // --- STATE (Varied Locations) ---
            {
                name: "Texas DMV Modernization", dealType: "Pipeline", sector: "State", value: 2500000, stage: "opp in-progress", winProbability: 80, location: "Austin TX",
                contacts: [
                    { name: "Greg", surname: "Abbott", role: "Gov Sponsor", email: "greg@texas.gov", state: "TX" },
                    { name: "Sheila", surname: "Jackson", role: "CTO", email: "sheila.j@dmv.tx.gov", phone: "512-555-0122", state: "TX", agency: "TX DMV" }
                ]
            },
            {
                name: "California Wildfire AI Detection", dealType: "Forecast", sector: "State", value: 8000000, forecastStage: "High Priority", stage: "opp Nurturing", winProbability: 30, location: "Sacramento CA",
                contacts: [{ name: "Gavin", surname: "Newsom", role: "Project Lead", email: "gavin@ca.gov", state: "CA" }]
            },
            {
                name: "New York Smart Traffic Lights", dealType: "Pipeline", sector: "State", value: 6000000, stage: "opp qualified", winProbability: 55, location: "Albany NY",
                contacts: [{ name: "Eric", surname: "Adams", role: "Mayor's Office", email: "eric.adams@nyc.gov", state: "NY" }]
            },
            {
                name: "Florida Hurricane Response Comms", dealType: "Forecast", sector: "State", value: 3500000, forecastStage: "High Priority", stage: "Win", winProbability: 100, location: "Tallahassee FL",
                contacts: [{ name: "Ron", surname: "DeSantis", role: "Governor", email: "ron.d@fl.gov", state: "FL" }]
            },
            {
                name: "Georgia Education Licensing Portal", dealType: "Pipeline", sector: "State", value: 1200000, stage: "opp sourced", winProbability: 15, location: "Atlanta GA",
                contacts: [{ name: "Stacey", surname: "Abrams", role: "Education Board", email: "stacey@ga.gov", state: "GA" }]
            },
            {
                name: "Ohio Medicaid Claims System", dealType: "Pipeline", sector: "State", value: 9000000, stage: "opp in-progress", winProbability: 40, location: "Columbus OH",
                contacts: [{ name: "Mike", surname: "DeWine", role: "Health Director", email: "mike.d@ohio.gov", state: "OH" }]
            },
            {
                name: "Washington State Ferry Booking", dealType: "Forecast", sector: "State", value: 2800000, forecastStage: "Low Priority", stage: "opp Nurturing", winProbability: 25, location: "Olympia WA",
                contacts: [{ name: "Jay", surname: "Inslee", role: "Transport Sec", email: "jay.i@wa.gov", state: "WA" }]
            },

            // --- COMMERCIAL / OTHERS ---
            {
                name: "City of Miami Smart Grid", dealType: "Pipeline", sector: "Others", value: 1500000, stage: "opp sourced", winProbability: 20, location: "Miami FL",
                contacts: [{ name: "Francis", surname: "Suarez", role: "City Tech Lead", email: "francis@miami.gov", state: "FL" }]
            },
            {
                name: "Private Hospital Network Security", dealType: "Forecast", sector: "Others", value: 750000, forecastStage: "Low Priority", stage: "Win", winProbability: 90, location: "Chicago IL",
                contacts: [{ name: "House", surname: "MD", role: "Diagnostic Lead", email: "house@hospital.com", state: "IL" }]
            },
            {
                name: "Bank of America Cloud Audit", dealType: "Pipeline", sector: "Others", value: 12000000, stage: "opp qualified", winProbability: 70, location: "Charlotte NC",
                contacts: [{ name: "Brian", surname: "Moynihan", role: "CEO Office", email: "brian@bofa.com", state: "NC" }]
            },
            {
                name: "Tesla Factory Automation v2", dealType: "Pipeline", sector: "Others", value: 25000000, stage: "opp in-progress", winProbability: 50, location: "Austin TX",
                contacts: [{ name: "Elon", surname: "Musk", role: "Technoking", email: "elon@tesla.com", state: "TX" }]
            },
            {
                name: "Walmart Supply Chain AI", dealType: "Forecast", sector: "Others", value: 5000000, forecastStage: "High Priority", stage: "opp Nurturing", winProbability: 35, location: "Bentonville AR",
                contacts: [{ name: "Doug", surname: "McMillon", role: "Supply VP", email: "doug@walmart.com", state: "AR" }]
            },
            {
                name: "University Tech Refresh 2026", dealType: "Pipeline", sector: "Others", value: 800000, stage: "opp sourced", winProbability: 25, location: "Boston MA",
                contacts: [{ name: "Dean", surname: "Pelton", role: "Dean", email: "dean@community.edu", state: "MA" }]
            }
        ];

        let createdLeads = 0;
        for (const lead of leads) {
            const exists = await Lead.findOne({ name: lead.name });
            if (!exists) {
                await Lead.create({
                    ...lead,
                    user: defaultUser._id, // Assign to valid user
                    description: `Auto-generated lead for ${lead.name}`,
                    contactPerson: lead.contacts?.[0]?.name || "Auto Contact",
                    email: lead.contacts?.[0]?.email || "auto@example.com",
                    phone: lead.contacts?.[0]?.phone || "555-9999"
                });
                createdLeads++;
            }
        }

        // 3. Seed Partners (15+ entries)
        const partners = [
            // PRITES
            { name: "Raytheon Technologies", type: "Prime", status: "Active", email: "partnerships@rtx.com", performanceRating: 95, sector: "Federal", capabilities: "Missile Defense, Aerospace, AI", state: "VA" },
            { name: "Lockheed Martin", type: "Prime", status: "Active", email: "teaming@lockheedmartin.com", performanceRating: 98, sector: "Federal", capabilities: "Aircraft, Space, Security", state: "MD" },
            { name: "Northrop Grumman", type: "Prime", status: "Active", email: "contact@ngc.com", performanceRating: 92, sector: "Federal", capabilities: "Cyber, Logistics, C4ISR", state: "VA" },
            { name: "General Dynamics IT", type: "Prime", status: "Active", email: "partners@gdit.com", performanceRating: 88, sector: "Federal", capabilities: "Information Tech, Cloud", state: "VA" },
            { name: "Deloitte Government", type: "Prime", status: "Active", email: "gov_practice@deloitte.com", performanceRating: 90, sector: "State", capabilities: "Consulting, Digital Transformation", state: "NY" },
            { name: "Accenture Federal", type: "Prime", status: "Active", email: "afs.teaming@accenturefederal.com", performanceRating: 89, sector: "Federal", capabilities: "Digital, Cloud, Cyber", state: "VA" },

            // SUBS
            { name: "CyberDefenders LLC", type: "Sub", status: "Vetted", email: "info@cyberdefenders.com", performanceRating: 85, sector: "Federal", capabilities: "Cybersecurity, Penetration Testing", state: "TX" },
            { name: "DataAnalytics Pro", type: "Sub", status: "Active", email: "sales@datapro.com", performanceRating: 78, sector: "Others", capabilities: "Big Data, AI/ML Modeling", state: "CA" },
            { name: "GreenEnergy Solutions", type: "Sub", status: "Prospective", email: "hello@greenenergy.com", performanceRating: 60, sector: "State", capabilities: "Renewable Energy Consulting", state: "CO" },
            { name: "VetTech Services", type: "Sub", status: "Active", email: "partners@vettech.com", performanceRating: 99, sector: "Federal", capabilities: "IT Support, Helpdesk (SDVOSB)", state: "FL" },
            { name: "Alpha Construction", type: "Sub", status: "Active", email: "bids@alphaconstruction.com", performanceRating: 82, sector: "State", capabilities: "Infrastructure, Roadworks", state: "TX" },
            { name: "CloudNative Ops", type: "Sub", status: "Vetted", email: "contact@cloudnative.io", performanceRating: 91, sector: "Others", capabilities: "DevOps, Kubernetes", state: "WA" },
            { name: "SecureSupply Chain Example", type: "Sub", status: "Prospective", email: "supply@securechain.com", performanceRating: 50, sector: "Federal", capabilities: "Logistics, Supply Chain Security", state: "AL" },
            { name: "EduTech Innovators", type: "Sub", status: "Prospective", email: "info@edutech.org", performanceRating: 45, sector: "State", capabilities: "LMS Implementation, Training", state: "MA" },
            { name: "MedHealth Systems", type: "Sub", status: "Active", email: "partners@medhealth.com", performanceRating: 88, sector: "Others", capabilities: "Healthcare IT, EHR Integration", state: "IL" }
        ];

        let createdPartners = 0;
        for (const partner of partners) {
            const exists = await Partner.findOne({ name: partner.name });
            if (!exists) {
                await Partner.create(partner);
                createdPartners++;
            }
        }

        // 4. Seed State/Federal Orgs
        const orgs = [
            // FEDERAL (10 entries)
            { name: "Department of Defense (DoD)", sector: "Federal", state: "Federal" },
            { name: "NASA", sector: "Federal", state: "Federal" },
            { name: "Department of Homeland Security (DHS)", sector: "Federal", state: "Federal" },
            { name: "Federal Emergency Management Agency (FEMA)", sector: "Federal", state: "Federal" },
            { name: "Department of Energy (DoE)", sector: "Federal", state: "Federal" },
            { name: "Veterans Affairs (VA)", sector: "Federal", state: "Federal" },
            { name: "Department of Transportation (DOT)", sector: "Federal", state: "Federal" },
            { name: "Health and Human Services (HHS)", sector: "Federal", state: "Federal" },
            { name: "General Services Administration (GSA)", sector: "Federal", state: "Federal" },
            { name: "Environmental Protection Agency (EPA)", sector: "Federal", state: "Federal" },

            // STATE (10 entries)
            { name: "California Dept of Technology", sector: "State", state: "California" },
            { name: "Texas Department of Transportation", sector: "State", state: "Texas" },
            { name: "New York State Health Department", sector: "State", state: "New York" },
            { name: "Florida Dept of Education", sector: "State", state: "Florida" },
            { name: "Georgia Bureau of Investigation", sector: "State", state: "Georgia" },
            { name: "Ohio Dept of Administrative Services", sector: "State", state: "Ohio" },
            { name: "Washington State Ferries", sector: "State", state: "Washington" },
            { name: "Illinois State Police", sector: "State", state: "Illinois" },
            { name: "Virginia Dept of Health", sector: "State", state: "Virginia" },
            { name: "Maryland Transit Administration", sector: "State", state: "Maryland" }
        ];

        let createdOrgs = 0;
        for (const org of orgs) {
            const exists = await StateOrg.findOne({ name: org.name });
            if (!exists) {
                await StateOrg.create({ ...org, files: [] });
                createdOrgs++;
            }
        }

        // 5. Seed Proposals (Linked to Leads)
        const allLeads = await Lead.find({});
        let createdProposals = 0;

        for (const lead of allLeads) {
            const exists = await Proposal.findOne({ lead: lead._id });
            if (!exists) {
                // Determine status based on lead stage or random
                const statuses = ['Draft', 'Submitted', 'Under Evaluation', 'Awarded', 'Lost'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

                // Value logic: use lead value or slightly different
                const propValue = lead.value ? Math.floor(lead.value * (0.9 + Math.random() * 0.2)) : 100000;

                await Proposal.create({
                    lead: lead._id,
                    solicitationNumber: `SOL-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`,
                    agency: lead.agency || "Unknown Agency",
                    state: lead.state || lead.location?.split(' ').pop() || "NA",
                    sector: lead.sector || "State",
                    status: randomStatus,
                    submittedDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Random past date
                    submittedValue: propValue,
                    winProbability: lead.winProbability || 50,
                    role: "Prime",
                    documents: [],
                    history: [{
                        action: "Created via Seeder",
                        timestamp: new Date(),
                        user: defaultUser._id
                    }]
                });
                createdProposals++;
            }
        }

        res.json({
            message: "Seeding Complete ✅",
            stats: {
                companiesAdded: createdCompanies,
                leadsAdded: createdLeads,
                partnersAdded: createdPartners,
                orgsAdded: createdOrgs,
                proposalsAdded: createdProposals
            }
        });
    } catch (err) {
        console.error("Seeding Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
