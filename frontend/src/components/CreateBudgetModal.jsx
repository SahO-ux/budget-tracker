import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import toast from "react-hot-toast";

import { setBudget } from "../modules/Budget/actions";
import moment from "moment";

/**
 * Minimal modal using framer-motion + tailwind.
 * Props: show (bool), onClose (fn), defaultMonth (YYYY-MM), onSaved (fn)
 */
export default function CreateBudgetModal({
  show,
  onClose,
  defaultMonth,
  onSaved,
}) {
  const [amount, setAmount] = useState("0");
  const [saving, setSaving] = useState(false);

  if (!show) return null;

  async function save() {
    if (!defaultMonth) return toast.error("Invalid month");
    const n = Number(amount);
    if (isNaN(n) || n < 0) return toast.error("Enter valid amount");
    setSaving(true);
    try {
      await setBudget({ month: defaultMonth, amount: n });
      toast.success("Budget saved");
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save budget");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <Motion.div
        initial={{ y: 12, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-10"
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-lg font-semibold mb-2">
          Set budget for {moment(defaultMonth, "YYYY-MM").format("MMMM, YYYY")}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Enter the monthly budget amount for this month.
        </p>

        <div className="mb-4">
          <label className="text-sm text-gray-700 block mb-1">Amount</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="0"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-3 py-2 rounded bg-white border"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-400"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </Motion.div>
    </div>
  );
}
