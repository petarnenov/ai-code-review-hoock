import "dotenv/config";
import express from "express";
import cors from "cors";

import {processCodeReview} from "./gitlab/gitlabService";

let port = +process.env.WEBHOOK_PORT;
if (isNaN(port) || port < 0 || port > 65535) {
  console.error(`Invalid port number: ${port}. Using default port 3000.`);
  port = 3000;
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

router.post("/webhook", (req, res) => {
  // Assuming the webhook payload is sent in the request body
  const mergeRequestData = req.body;

  // Process the code review
  processCodeReview(mergeRequestData);

  console.log("Body:", body);

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
