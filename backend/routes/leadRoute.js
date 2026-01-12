console.log("✅ leadRoute.js loaded");

const express = require("express");
const Lead = require("../models/Lead");
const auth = require("../middleware/authMiddleware");

const router = express.Router();
const upload = require('../config/gridfs');

/* ================= UPLOAD ATTACHMENT ================= */
router.post("/upload", auth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  // Return GridFS file URL
  res.json({
    name: req.file.originalname,
    url: `/api/files/${req.file.filename}`
  });
});

/* ================= CREATE LEAD ================= */
/* ================= CREATE LEAD ================= */
router.post("/", auth, async (req, res) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      user: req.user.id
    });

    // Real-time Update
    req.app.get("io").emit("leads:updated");

    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: "Failed to create lead" });
  }
});

/* ================= GET ALL LEADS (SHARED) ================= */
router.get("/", auth, async (req, res) => {
  // REMOVED user filter to show ALL leads
  const leads = await Lead.find({}).populate("user", "name email");
  res.json(leads);
});

/* ================= UPDATE LEAD STAGE (KANBAN) ================= */
/* MUST BE ABOVE /:id */
/* ================= UPDATE LEAD STAGE (KANBAN) ================= */
/* MUST BE ABOVE /:id */
router.put("/:id/stage", auth, async (req, res) => {
  // REMOVED user filter
  const lead = await Lead.findOneAndUpdate(
    { _id: req.params.id },
    { stage: req.body.stage },
    { new: true }
  );

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  // Real-time Update
  req.app.get("io").emit("leads:updated");

  res.json(lead);
});

/* ================= GET SINGLE LEAD ================= */
/* ================= GET SINGLE LEAD ================= */
router.get("/:id", auth, async (req, res) => {
  // REMOVED user filter
  const lead = await Lead.findOne({
    _id: req.params.id
  });

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  res.json(lead);
});

/* ================= UPDATE LEAD ================= */
/* ================= UPDATE LEAD ================= */
router.put("/:id", auth, async (req, res) => {
  // REMOVED user filter
  const lead = await Lead.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true }
  );

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  // Real-time Update
  req.app.get("io").emit("leads:updated");

  res.json(lead);
});

/* ================= DELETE LEAD ================= */
/* ================= DELETE LEAD ================= */
router.delete("/:id", auth, async (req, res) => {
  // REMOVED user filter
  await Lead.findOneAndDelete({
    _id: req.params.id
  });

  // Real-time Update
  req.app.get("io").emit("leads:updated");

  res.json({ message: "Lead deleted" });
});

/* ================= ADD ACTIVITY ================= */
/* ================= ADD ACTIVITY ================= */
router.post("/:id/activities", auth, async (req, res) => {
  // REMOVED user filter
  const lead = await Lead.findOne({
    _id: req.params.id
  });

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  lead.activities.push({
    type: req.body.type,
    note: req.body.note,
    dueDate: req.body.dueDate,
    status: "Pending"
  });

  await lead.save();
  res.json(lead);
});

/* ================= UPDATE ACTIVITY ================= */
/* ================= UPDATE ACTIVITY ================= */
router.put("/:leadId/activities/:activityId", auth, async (req, res) => {
  // REMOVED user filter
  const lead = await Lead.findOne({
    _id: req.params.leadId
  });

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  const activity = lead.activities.id(req.params.activityId);
  if (!activity) {
    return res.status(404).json({ message: "Activity not found" });
  }

  activity.note = req.body.note;
  activity.dueDate = req.body.dueDate;

  await lead.save();
  res.json(lead);
});

/* ================= COMPLETE ACTIVITY ================= */
/* ================= COMPLETE ACTIVITY ================= */
router.put("/:leadId/activities/:activityId/status", auth, async (req, res) => {
  // REMOVED user filter
  const lead = await Lead.findOne({
    _id: req.params.leadId
  });

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  const activity = lead.activities.id(req.params.activityId);
  if (!activity) {
    return res.status(404).json({ message: "Activity not found" });
  }

  activity.status = "Done";
  await lead.save();
  res.json(lead);
});

/* ================= DELETE ACTIVITY ================= */
/* ================= DELETE ACTIVITY ================= */
router.delete("/:leadId/activities/:activityId", auth, async (req, res) => {
  // REMOVED user filter
  const lead = await Lead.findOne({
    _id: req.params.leadId
  });

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  lead.activities = lead.activities.filter(
    a => a._id.toString() !== req.params.activityId
  );

  await lead.save();
  res.json(lead);
});

module.exports = router;
