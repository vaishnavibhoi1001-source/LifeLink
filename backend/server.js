const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const donorRoutes = require("./routes/donorRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// Port
const PORT = process.env.PORT || 5000;


// ===============================
// Middleware
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// Frontend
// ===============================

const frontendPath = path.join(__dirname, "..", "frontend");

app.use(express.static(frontendPath));


// ===============================
// API Routes
// ===============================

app.use("/api/donors", donorRoutes);
app.use("/api/reviews", reviewRoutes);


// ===============================
// Test Route
// ===============================

app.get("/api/test", (req, res) => {
    res.json({
        message: "LifeLink backend is working!"
    });
});


// ===============================
// Home Page
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});


// ===============================
// MongoDB
// ===============================

mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lifelink"
)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:");
        console.log(error.message);
    });


// ===============================
// Start Server
// ===============================

app.listen(PORT, () => {
    console.log(`LifeLink server running at http://localhost:${PORT}`);
});