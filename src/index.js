import "dotenv/config";
import express from "express";
import cors from "cors";

let port = process.env.PROD_PORT || 80;
if (process.env.NODE_ENV !== "production") {
  port = process.env.DEV_PORT || 8080;
}

console.log("process.env.NODE_ENV:", process.env.NODE_ENV);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

router.post("/webhook", (req, res) => {
  // Handle webhook POST request
  const { event, payload, message } = req.body;
  console.log("Event:", event);
  console.log("Payload:", payload);
  console.log("Message:", message);

  res.status(200).json({ message: "Webhook received" });
});

app.use("/api/v1", router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
