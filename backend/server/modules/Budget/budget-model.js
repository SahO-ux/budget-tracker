import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, default: 0 },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

BudgetSchema.index({ user: 1, month: -1 });

export default mongoose.model("Budget", BudgetSchema);