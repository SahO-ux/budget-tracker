import mongoose from "mongoose";

import { TransactionAndCategoryTypeEnums } from "../../lib/global-constants.js";

const CategorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(TransactionAndCategoryTypeEnums),
      required: true,
      trim: true,
    },
    color: { type: String, default: "", trim: true },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
