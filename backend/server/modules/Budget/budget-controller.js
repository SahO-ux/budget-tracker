import { services } from "../../modules-loader.js";

const setBudget = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const { month, amount } = req.body;
    if (!month || amount == null)
      return res.status(400).json({ message: "Missing param fields" });

    const budget = await services.BudgetService.setBudget({
      userId,
      month,
      amount,
    });
    return res.json(budget);
  } catch (err) {
    console.error("setBudget error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getBudget = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const month = req.params.month;
    if (!month) return res.status(400).json({ message: "Missing month param" });

    const budget = await services.BudgetService.getBudgetForMonth({
      userId,
      month,
    });
    return res.json(budget);
  } catch (err) {
    console.error("getBudget error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getBudgets = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const { skip = 0, limit = 20 } = req.query;

    const budgets = await services.BudgetService.getBudgets({
      userId,
      skip,
      limit,
    });
    return res.json(budgets);
  } catch (err) {
    console.error("getBudgets error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

export default {
  controllerName: "BudgetController",
  setBudget,
  getBudget,
  getBudgets,
};
