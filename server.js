import app from "./app.js";
import { config } from "dotenv";

// Dotenv Configuration
config({
  path: "./config/config.env",
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on the PORT: ${port}`);
});
