import moment from "moment";

import { models } from "../../modules-loader.js";
import { TransactionAndCategoryTypeEnums } from "../../lib/global-constants.js";
import { normalizeToObjectId } from "../../lib/app-utility.js";

const setBudget = async ({ userId, month, amount }) => {
  const updatedBudget = await models.Budget.findOneAndUpdate(
    { user: userId, month },
    { $set: { amount }, $setOnInsert: { user: userId, month } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return updatedBudget;
};

const getBudgetForMonth = async ({ userId, month }) => {
  if (!userId) throw new Error("userId is required");

  // month format: "YYYY-MM"
  const _month = moment(month, "YYYY-MM", true);
  if (!_month.isValid())
    throw new Error("Invalid month format (expected YYYY-MM)");

  const start = _month.clone().startOf("month").toDate(); // inclusive
  const end = _month.clone().endOf("month").toDate(); // inclusive boundary for <=

  const _userId = normalizeToObjectId(userId);

  // Get budget doc (if any)
  const budgetDoc = await models.Budget.findOne({
    user: _userId,
    month,
    isDeleted: false,
  }).lean();

  // Aggregate totals grouped by type (income / expense)
  const agg = await models.Transaction.aggregate([
    {
      $match: {
        user: _userId,
        isDeleted: false,
        createdAt: { $gte: start, $lte: end }, // include the whole month
      },
    },
    {
      $group: {
        _id: "$type",
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  // normalize to numbers
  let totalIncome = 0;
  let totalExpense = 0;
  (agg || []).forEach((g) => {
    if (g._id === TransactionAndCategoryTypeEnums.INCOME) {
      totalIncome = g.totalAmount || 0;
    } else if (g._id === TransactionAndCategoryTypeEnums.EXPENSE) {
      totalExpense = g.totalAmount || 0;
    }
  });

  return {
    budget: budgetDoc ? budgetDoc.amount : 0,
    spent: totalExpense,
    income: totalIncome,
    month,
  };
};

const getBudgets = async ({ userId, skip = 0, limit = 20 }) => {
  const BudgetModel = models.Budget;

  const query = { user: userId, isDeleted: false };
  const docs = await BudgetModel.find(query)
    .sort({ month: -1 })
    .skip(Number(skip))
    .limit(Number(limit))
    .lean();
  const total = await BudgetModel.countDocuments(query);
  return { results: docs, total };
};

export default {
  serviceName: "BudgetService",
  setBudget,
  getBudgetForMonth,
  getBudgets,
};
