const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection URI
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb';

// Connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3210", // Allow requests from this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 204, // Status code for successful preflight requests
};

// Use CORS middleware
app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());

// Define a schema and model for the 'feedback' collection
const feedbackSchema = new mongoose.Schema({
  componentData: Array, // Array to hold feedback component data
  rightPanelData: Object, // Object to hold additional right panel data
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// Route to get all feedback data
app.get("/api/feedback", (req, res) => {
  Feedback.find({})
    .then((feedbacks) => {
      res.json(feedbacks); // Return all feedbacks in JSON format
    })
    .catch((err) => {
      console.error("Failed to retrieve feedback:", err);
      res.status(500).json({ error: "Failed to retrieve feedback" }); // Error response
    });
});

// Route to save feedback
app.post("/api/feedback", (req, res) => {
  console.log("Received data:", req.body); // Log the received data

  const newFeedback = new Feedback(req.body); // Create a new feedback entry
  newFeedback
    .save()
    .then(() => {
      console.log("Data saved to MongoDB:", req.body); // Log the data saved to MongoDB
      res.json({ message: "Feedback saved successfully" }); // Success response
    })
    .catch((err) => {
      console.error("Failed to save feedback:", err);
      res.status(500).json({ error: "Failed to save feedback" }); // Error response
    });
});

// Route to delete a feedback entry by _id
app.delete("/api/feedback/:id", (req, res) => {
  const { id } = req.params; // Get the feedback ID from the request parameters

  Feedback.findByIdAndDelete(id)
    .then((deletedFeedback) => {
      if (deletedFeedback) {
        console.log(`Deleted feedback with id: ${id}`); // Log the deletion
        res.json({ message: "Feedback deleted successfully" }); // Success response
      } else {
        res.status(404).json({ error: "Feedback not found" }); // Not found response
      }
    })
    .catch((err) => {
      console.error(`Failed to delete feedback with id: ${id}`, err);
      res.status(500).json({ error: "Failed to delete feedback" }); // Error response
    });
});

// Route to update feedback by _id
app.put("/api/feedback/:id", (req, res) => {
  const { id } = req.params; // Get the feedback ID from the request parameters
  const updateData = req.body; // The data to update

  Feedback.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .then((updatedFeedback) => {
      if (updatedFeedback) {
        console.log(`Updated feedback with id: ${id}`, updatedFeedback); // Log the updated feedback
        res.json({
          message: "Feedback updated successfully",
          data: updatedFeedback,
        }); // Success response
      } else {
        res.status(404).json({ error: "Feedback not found" }); // Not found response
      }
    })
    .catch((err) => {
      console.error(`Failed to update feedback with id: ${id}`, err);
      res.status(500).json({ error: "Failed to update feedback" }); // Error response
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`); // Log server start
});
