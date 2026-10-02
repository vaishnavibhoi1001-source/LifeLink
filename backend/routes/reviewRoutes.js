const express = require("express");
const Review = require("../models/Review");

const router = express.Router();

// Submit Review
router.post("/", async (req, res) => {
  try {
    const { name, rating, feedback } = req.body;

    if (!rating || !feedback) {
      return res.status(400).json({
        message: "Rating and feedback are required.",
      });
    }

    const review = new Review({
      name: name?.trim() || "Anonymous",
      rating: Number(rating),
      feedback: feedback.trim(),
    });

    await review.save();

    res.status(201).json({
      message: "Review submitted successfully!",
    });
  } catch (error) {
    console.error("Review Error:", error);

    res.status(500).json({
      message: "Failed to submit review.",
    });
  }
});

module.exports = router;