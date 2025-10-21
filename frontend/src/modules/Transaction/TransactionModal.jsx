import { useEffect, useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import Select from "react-select";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import { createTransaction, updateTransaction } from "./actions";
import {
  formatNumber,
  selectStyles,
  selectTheme,
  TransactionTypeEnums,
} from "../../utils/global-constants";
import { validateTransaction } from "./constants";
import PillToggle from "./PillToggle";

/**
 * TransactionModal
 *
 * Props:
 * - show: boolean
 * - onHide: fn
 * - onAddedOrEdited: fn(transaction) called after create OR update (pass returned/updated transaction)
 * - transaction: optional transaction object for view/edit
 */
export default function TransactionModal({
  show,
  onHide,
  onAddedOrEdited,
  transaction,
}) {
  const expenseCategories = useSelector(
    (state) => state.categoriesReducer.expenseCategories || []
  );
  const incomeCategories = useSelector(
    (state) => state.categoriesReducer.incomeCategories || []
  );

  const amountRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // We store amountRaw as digits-only string internally, display formatted via formatNumber
  const [transactionDetails, setTransactionDetails] = useState({
    amount: "", // raw digits string, e.g. "12345"
    type: TransactionTypeEnums.EXPENSE,
    category: null, // category id
    note: "",
  });

  // Populate when transaction prop changes (view/edit)
  useEffect(() => {
    if (!transaction) {
      // reset when no transaction provided
      setTransactionDetails({
        amount: "",
        type: TransactionTypeEnums.EXPENSE,
        category: null,
        note: "",
      });
      return;
    }

    // Prefill fields from provided transaction object
    setTransactionDetails({
      amount:
        transaction.amount !== undefined && transaction.amount !== null
          ? String(transaction.amount)
          : "",
      type: transaction.type || TransactionTypeEnums.EXPENSE,
      category: transaction.category
        ? transaction.category._id || transaction.category
        : null,
      note: transaction.note || "",
    });
  }, [transaction]);

  useEffect(() => {
    if (!show) return;
    // focus amount with a small delay so the modal animation completes
    setTimeout(() => amountRef.current?.focus(), 120);
  }, [show]);

  const selectedCategories =
    transactionDetails.type === TransactionTypeEnums.EXPENSE
      ? expenseCategories
      : incomeCategories;

  const categoriesOptions = selectedCategories.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  const handleAmountChange = (e) => {
    // allow pasting formatted values — keep digits only
    const raw = String(e.target.value).replace(/[^0-9]/g, "");
    setTransactionDetails((prev) => ({ ...prev, amount: raw }));
  };

  const handleKeyDown = (e) => {
    // prevent e, E, +, - and dot (we only accept integers)
    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
  };

  const _save = async () => {
    // Validate client side (validateTransaction expects the internal shape)
    // Build payload object to validate
    const payloadForValidation = {
      ...transactionDetails,
      amount: transactionDetails.amount,
      category: transactionDetails.category,
    };

    const [isValid, errMsg] = validateTransaction(payloadForValidation);
    if (!isValid) return toast.error(errMsg);

    setLoading(true);

    try {
      const payload = {
        amount: Number(transactionDetails.amount),
        type: transactionDetails.type,
        category: transactionDetails.category,
        ...(transactionDetails.note?.trim() && {
          note: transactionDetails.note.trim(),
        }),
      };

      let resultTransaction = null;

      if (transaction && transaction._id) {
        // Update existing transaction
        resultTransaction = await updateTransaction(transaction._id, payload);
        onAddedOrEdited && onAddedOrEdited(resultTransaction);
      } else {
        // Create new transaction
        resultTransaction = await createTransaction(payload);
        onAddedOrEdited && onAddedOrEdited();
      }

      onHide && onHide();
    } catch (err) {
      console.error("Transaction save error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to save transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={!!show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {`${transaction ? "Edit" : "Add"} Transaction`}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="grid grid-cols-1 gap-3">
          {/* Amount */}
          <input
            ref={amountRef}
            className="w-full p-2 border rounded-lg"
            placeholder="Amount"
            value={
              transactionDetails.amount
                ? formatNumber(transactionDetails.amount, {
                    withCurrency: true,
                  })
                : ""
            }
            onChange={handleAmountChange}
            onKeyDown={handleKeyDown}
            inputMode="numeric"
          />

          {/* Type + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            <div className="flex items-center">
              <PillToggle
                value={transactionDetails.type}
                onChange={(val) =>
                  setTransactionDetails((prev) => ({ ...prev, type: val }))
                }
              />
            </div>

            <div>
              <Select
                placeholder="Category"
                options={categoriesOptions}
                value={
                  categoriesOptions.find(
                    (val) => val.value === transactionDetails.category
                  ) || null
                }
                onChange={(opt) =>
                  setTransactionDetails((prev) => ({
                    ...prev,
                    category: opt ? opt.value : null,
                  }))
                }
                styles={selectStyles}
                theme={selectTheme}
                classNamePrefix="transaction-select"
                isClearable
              />
            </div>
          </div>

          {/* Note */}
          <textarea
            className="w-full mt-1 p-2 border rounded-lg"
            value={transactionDetails.note}
            placeholder="Add optional note"
            onChange={(e) =>
              setTransactionDetails((prev) => ({
                ...prev,
                note: e.target.value,
              }))
            }
            rows={3}
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>

        <Button onClick={_save} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
