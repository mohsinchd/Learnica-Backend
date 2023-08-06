import express from "express";
import cookieParser from "cookie-parser";
import { errorMiddleware, notFound } from "./middlewares/errorMiddleware.js";

const app = express();

// Global Middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

// Routes Imports
import userRoutes from "./routes/userRoutes.js";

// "/" route

app.get("/", (req, res, next) => {
  res.send(`
  <h1>
  Application is working fine.
  <a href="${process.env.FRONTEND_URL}">
  Click here to use.
  </a>
  </h1>
  `);
});

app.use("/api/v1/user", userRoutes);

export default app;

// ErrorHandlers
app.use(notFound);
app.use(errorMiddleware);
