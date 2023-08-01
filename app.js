import express from "express";

const app = express();

app.get("/", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "API is Working fine.",
  });
});

app.get("/users", (req, res, next) => {
  res.status(200).json({
    success: true,
    users: [
      { id: 1, name: "Mohsin shoaib" },
      { id: 2, name: "Shoaib Ahmad" },
    ],
  });
});

export default app;
