import mongoose from "mongoose";
import { models } from "../../modules-loader.js";

/**
 * Safely normalize userId input and return an ObjectId
 */
const normalizeToObjectId = (maybeId) => {
  // unwrap MongoDB extended JSON formats like { $oid: "..." } or { _id: "..." }
  if (maybeId && typeof maybeId === "object") {
    if (maybeId.$oid) maybeId = maybeId.$oid;
    else if (maybeId._id) maybeId = maybeId._id;
  }

  if (maybeId == null) {
    throw new Error("No userId provided");
  }

  const str = String(maybeId).trim();

  // quick debug log — remove or lower log level in production
  console.log(
    "analytics-service: normalizeToObjectId received:",
    str,
    "typeof:",
    typeof maybeId
  );

  if (!mongoose.Types.ObjectId.isValid(str)) {
    throw new Error("Invalid userId supplied to analytics: " + str);
  }

  return new mongoose.mongo.ObjectId(str);
};

const getAnalytics = async (userIdInput) => {
  const TransactionModel = models.Transaction;

  // normalize/validate userId
  const userId = normalizeToObjectId(userIdInput);

  // categorySummary
  const categorySummary = await TransactionModel.aggregate([
    { $match: { user: userId, isDeleted: false } },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
        type: { $first: "$type" },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 0,
        categoryId: "$_id",
        categoryName: { $ifNull: ["$category.name", "Uncategorized"] },
        type: 1,
        totalAmount: 1,
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  // monthlySummary
  const monthlySummary = await TransactionModel.aggregate([
    { $match: { user: userId, isDeleted: false } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          type: "$type",
        },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        type: "$_id.type",
        totalAmount: 1,
        monthKey: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            {
              $cond: [
                { $lt: ["$_id.month", 10] },
                { $concat: ["0", { $toString: "$_id.month" }] },
                { $toString: "$_id.month" },
              ],
            },
          ],
        },
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  return { categorySummary, monthlySummary };
};

export default {
  serviceName: "AnalyticsService",
  getAnalytics,
};
