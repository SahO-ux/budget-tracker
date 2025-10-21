import { services } from "../../modules-loader.js";

const createTransaction = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const { amount, type, category, note } = req.body;
    if (!amount || !type || !category)
      return res
        .status(400)
        .json({ message: "Missing amount, type or category from params" });

    const txn = await services.TransactionService.createTransaction({
      userId,
      amount,
      type,
      category,
      note,
    });
    return res.status(201).json(txn);
  } catch (err) {
    console.error("createTransaction error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const {
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
    } = req.query;
    const data = await services.TransactionService.getTransactions({
      userId,
      skip,
      limit,
      category,
      type,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      sortBy,
      sortDir,
    });
    return res.json(data);
  } catch (err) {
    console.error("getTransactions error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getTransaction = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;

    const transactionId = req?.params?.id;

    if (!transactionId)
      return res.status(400).json({
        message: `Missing parameter: Transaction "id" is required in URL path`,
      });

    const txn = await services.TransactioService.getTransactionById({
      id: transactionId,
      userId,
    });

    if (!txn) return res.status(404).json({ message: "Transaction not found" });
    return res.json(txn);
  } catch (err) {
    console.error("getTransaction error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;

    const transactionId = req?.params?.id;

    if (!transactionId)
      return res.status(400).json({
        message: `Missing parameter: Transaction "id" is required in URL path`,
      });

    const updated = await services.TransactionService.updateTransaction({
      id: transactionId,
      userId,
      payload: req.body,
    });

    if (!updated)
      return res.status(404).json({ message: "Transaction not found" });
    return res.json(updated);
  } catch (err) {
    console.error("updateTransaction error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;

    const transactionId = req?.params?.id;

    if (!transactionId)
      return res.status(400).json({
        message: `Missing parameter: Transaction "id" is required in URL path`,
      });

    const deleted = await services.TransactionsService.deleteTransaction({
      id: transactionId,
      userId,
    });

    if (!deleted)
      return res.status(404).json({ message: "Transaction not found" });
    return res.json({ message: "deleted" });
  } catch (err) {
    console.error("deleteTransaction error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

export default {
  controllerName: "TransactionController",
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
