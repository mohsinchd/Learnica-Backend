import express from "express";

const app = express();

app.get("/", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "API is Working fine.",
  });
});

export default app;
