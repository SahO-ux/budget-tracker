import moment from "moment/moment.js";
import { models } from "../../modules-loader.js";

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
}) => {
  const TransactionModel = models.Transaction;

  const query = {
    user: userId,
    isDeleted: false,
    ...(category && { category }),
    ...(type && { type }),
    ...(minAmount != null && { amount: { $gte: Number(minAmount) } }),
    ...(maxAmount != null && { amount: { $lte: Number(maxAmount) } }),
    ...(startDate && { createdAt: { $gte: moment(startDate).toISOString() } }),
    ...(endDate && { createdAt: { $lte: moment(endDate).toISOString() } }),
  };

  const transactions = await TransactionModel.find(query)
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit))
    .populate("category", "name type")
    .lean();

  const total = await TransactionModel.countDocuments(query);
  return { results: transactions, count: transactions.length, total };
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
