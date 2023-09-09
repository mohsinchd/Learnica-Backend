import express from "express";
import {
  checkout,
  getKey,
  paymentVerfication,
} from "../controllers/paymentControllers.js";

const router = express.Router();

router.route("/").post(checkout).get(getKey);
router.route("/paymentVerification").post(paymentVerfication);

export default router;
