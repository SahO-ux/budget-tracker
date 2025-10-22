import { services } from "../../modules-loader.js";

const getAnalyticsData = async (req, res) => {
  try {
    const userId = req?.userId || req?.user?._id;

    if (!userId) return res.status(400).json({ message: "userId is required" });

    const data = await services.AnalyticsService.getAnalytics(userId);
    res.json({ success: true, data });
  } catch (err) {
    console.error("getAnalytics error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

export default {
  controllerName: "AnalyticsController",
  getAnalyticsData,
};
