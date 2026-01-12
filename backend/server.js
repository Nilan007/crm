require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoute");
const leadRoutes = require("./routes/leadRoute");
const userRoutes = require("./routes/userRoute");

const app = express();

/* ================= CONNECT DB ================= */
connectDB();

// Start Scheduler
const { startScheduler } = require("./services/scheduler");
startScheduler();

const path = require("path"); // Ensure path is required

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: true,
  credentials: true
}));

console.log("✅ CORS configured for: http://localhost:5173, http://localhost:5174");

app.use(express.json()); // parse JSON bodies

// GridFS File Serving (replaces static uploads directory)
// Files are now stored in MongoDB and served via /api/files/:filename

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", require("./routes/aiRoute"));
app.use("/api/portals", require("./routes/portalRoute"));
app.use("/api/events", require("./routes/eventRoute"));
app.use("/api/notifications", require("./routes/notificationRoute"));
app.use("/api/seed", require("./routes/seedRoute")); // Temporary Seeding Route
app.use("/api/partners", require("./routes/partnerRoute"));
app.use("/api/company-profile", require("./routes/companyProfileRoute"));
app.use("/api/proposals", require("./routes/proposalRoute"));
app.use("/api/state-org", require("./routes/stateOrgRoute"));
app.use("/api/credentials", require("./routes/credentialRoute"));
app.use("/api/state-cio", require("./routes/stateCIORoute"));
app.use("/api/contacts", require("./routes/contactRoute"));
app.use("/api/files", require("./routes/fileRoute")); // GridFS file retrieval


/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("CRM API is running 🚀");
});

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`
  });
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message // Return specific error message to client for debugging
  });
});

/* ================= START SERVER ================= */
/* ================= START SERVER ================= */
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Make io accessible to our router
app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;


connectDB(); // Start DB connection async

server.listen(PORT, () => {
  console.log(`✅ Server (Socket.io) running on http://localhost:${PORT}`);
});

// PREVENT CRASHES: Global Error Handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down gracefully...');
  console.error(err.name, err.message);
  console.error(err.stack);
  // process.exit(1); // Don't exit immediately on Render, try to keep alive or let it restart
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥');
  console.error(err.name, err.message);
  // server.close(() => process.exit(1)); 
});
