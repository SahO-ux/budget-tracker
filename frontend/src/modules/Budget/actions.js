import API from "../../api";

import moment from "moment";

const setBudget = async ({ month, amount }) => {
  // month should be "YYYY-MM" — allow moment helper
  const m = typeof month === "string" ? month : moment(month).format("YYYY-MM");
  const res = await API.post("/budget", { month: m, amount });
  return res.data;
};

const getBudgetForMonth = async (month) => {
  const m = typeof month === "string" ? month : moment(month).format("YYYY-MM");
  const res = await API.get(`/budget/${m}`);
  return res.data; // { budget, spent, month }
};

const getBudgets = async ({ skip = 0, limit = 20 } = {}) => {
  const res = await API.get("/budget", { params: { skip, limit } });
  return res.data; // { results, total }
};

export { setBudget, getBudgetForMonth, getBudgets };
