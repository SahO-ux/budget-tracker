import express from "express";

import authMiddleware from "../../middleware/auth.js";
import { controllers } from "../../modules-loader.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  controllers.AnalyticsController.getAnalyticsData
);

export default {
  indexRoute: "/analytics",
  router,
};
