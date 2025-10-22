import moment from "moment";

import API from "../../api";

const getTransactions = async ({
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
} = {}) => {
  const params = { skip, limit };
  if (category) params.category = category;
  if (type) params.type = type;
  if (minAmount != null) params.minAmount = minAmount;
  if (maxAmount != null) params.maxAmount = maxAmount;
  if (startDate) params.startDate = moment(startDate).toISOString();
  if (endDate) params.endDate = moment(endDate).toISOString();
  if (sortBy) params.sortBy = sortBy;
  if (sortDir) params.sortDir = sortDir;

  const res = await API.get("/transaction", { params });
  return res.data; // { results, count, total }
};

const createTransaction = async (payload) => {
  // payload: { amount, type, category, note }
  const res = await API.post("/transaction", payload);
  return res.data; // { _id }
};

const updateTransaction = async (id, payload) => {
  const res = await API.patch(`/transaction/${id}`, payload);
  return res.data;
};

const deleteTransaction = async (id) => {
  const res = await API.delete(`/transaction/${id}`);
  return res.data;
};

export {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
