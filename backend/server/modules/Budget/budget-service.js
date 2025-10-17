import moment from "moment";

import { models } from "../../modules-loader.js";
import { TransactionAndCategoryTypeEnums } from "../../lib/global-constants.js";

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
  // month format: "YYYY-MM"
  const _month = moment(month, "YYYY-MM");
  if (!_month.isValid())
    throw new Error("Invalid month format (expected YYYY-MM)");

  const start = _month.clone().startOf("month").toDate(); // inclusive
  const end = _month.clone().endOf("month").toDate(); // inclusive boundary for <=

  const budgetDoc = await models.Budget.findOne({
    user: userId,
    month,
    isDeleted: false,
  }).lean();

  const agg = await models.Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: TransactionAndCategoryTypeEnums.EXPENSE,
        isDeleted: false,
        createdAt: { $gte: start, $lt: end },
      },
    },
    { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
  ]);

  const spent = agg[0]?.totalSpent || 0;
  return { budget: budgetDoc ? budgetDoc.amount : 0, spent, month };
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
