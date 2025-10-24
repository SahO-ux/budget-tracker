import moment from "moment/moment.js";

import { models } from "../../modules-loader.js";
import { validateMinMaxAmountParams } from "../../lib/app-utility.js";

const createTransaction = async ({
  userId,
  amount,
  type,
  category,
  note = "",
}) => {
  const TransactionModel = models.Transaction;

  const payload = { user: userId, amount, type, category, note };

  const transaction = await TransactionModel.create(payload);

  return await TransactionModel.findById(transaction._id).populate(
    "category",
    "name type"
  );
};

const getTransactions = async ({
  userId,
  skip = 0,
  limit = 20,
  category,
  type,
  minAmount,
  maxAmount,
  startDate,
  endDate,
  sortBy,
  sortDir,
}) => {
  const TransactionModel = models.Transaction;

  const [isValid, error] = validateMinMaxAmountParams({
    minAmount,
    maxAmount,
  });

  if (!isValid) throw new Error(error);

  // --- Build amount range filter ---
  const amountFilter = {};
  if (minAmount != null && minAmount !== "") {
    amountFilter.$gte = Number(minAmount);
  }
  if (maxAmount != null && maxAmount !== "") {
    amountFilter.$lte = Number(maxAmount);
  }

  // --- Build date range filter ---
  const dateFilter = {};
  if (startDate) {
    dateFilter.$gte = moment(startDate).startOf("day").toDate();
  }
  if (endDate) {
    dateFilter.$lte = moment(endDate).endOf("day").toDate();
  }

  // --- Construct query ---
  const query = {
    user: userId,
    isDeleted: false,
    ...(category && { category }),
    ...(type && { type }),
    ...(Object.keys(amountFilter).length > 0 && { amount: amountFilter }),
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
  };

  // --- Sorting ---
  let sortOptions = { createdAt: -1 }; // default (newest first)
  if (sortBy) {
    const order = sortDir === "asc" ? 1 : sortDir === "desc" ? -1 : -1;
    sortOptions = { [sortBy]: order };
  }

  // --- Fetch transactions ---
  const transactions = await TransactionModel.find(query)
    .sort(sortOptions)
    .skip(Number(skip))
    .limit(Number(limit))
    .populate("category", "name type")
    .lean();

  const total = await TransactionModel.countDocuments(query);

  return {
    results: transactions,
    count: transactions.length,
    total,
  };
};

const getTransactionById = async ({ id, userId }) => {
  return await models.Transaction.findOne({
    _id: id,
    user: userId,
    isDeleted: false,
  }).populate("category", "name type");
};

const updateTransaction = async ({ id, userId, payload }) => {
  return await models.Transaction.findOneAndUpdate(
    { _id: id, user: userId, isDeleted: false },
    payload,
    { new: true }
  ).populate("category", "name type");
};

const deleteTransaction = async ({ id, userId }) => {
  return await models.Transaction.findOneAndUpdate(
    { _id: id, user: userId, isDeleted: false },
    { isDeleted: true }
  );
};

export default {
  serviceName: "TransactionService",
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
