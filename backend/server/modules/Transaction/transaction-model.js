import mongoose from "mongoose";

import { TransactionAndCategoryTypeEnums } from "../../lib/global-constants.js";

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, default: 0 },
    type: {
      type: String,
      enum: Object.values(TransactionAndCategoryTypeEnums),
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    note: { type: String, default: "", trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TransactionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Transaction", TransactionSchema);
