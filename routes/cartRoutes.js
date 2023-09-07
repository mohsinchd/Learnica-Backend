import express from "express";

import { isAuthenticated } from "../middlewares/auth.js";
import {
  addToCart,
  getCartItems,
  removeFromCart,
} from "../controllers/cartControllers.js";

const router = express.Router();

router
  .route("/")
  .put(isAuthenticated, addToCart)
  .get(isAuthenticated, getCartItems);

router.route("/:id").delete(isAuthenticated, removeFromCart);

export default router;
