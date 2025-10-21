import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import moment from "moment";

import { formatNumber } from "../../utils/global-constants";
import _ from "lodash";

export default function TransactionDeleteModal({
  show,
  onHide,
  onConfirm,
  transaction,
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) {
      onHide?.();
      return;
    }

    try {
      setLoading(true);
      // allow onConfirm to be sync or return a promise
      await Promise.resolve(onConfirm());
      // close after success (caller may also re-fetch/update UI)
      onHide?.();
    } catch (err) {
      // Let caller handle toast/errors; but still log here
      console.error("Delete transaction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const amountLabel = transaction
    ? formatNumber(transaction.amount, { withCurrency: true })
    : "";

  const whenLabel = transaction?.createdAt
    ? moment(transaction.createdAt).format("DD MMM YYYY, h:mm A")
    : "";

  return (
    <Modal show={!!show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Delete transaction</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-sm text-gray-700">
          Are you sure you want to delete this transaction?
        </p>

        {transaction && (
          <div className="mt-3 p-3 rounded border bg-gray-50 text-sm">
            <div className="flex justify-between mb-1">
              <div className="text-gray-600">Category</div>
              <div className="font-medium">
                {transaction.category?.name || "—"}
              </div>
            </div>
            <div className="flex justify-between mb-1">
              <div className="text-gray-600">Category</div>
              <div className="font-medium">
                {_.capitalize(transaction.category?.type) || "—"}
              </div>
            </div>
            <div className="flex justify-between mb-1">
              <div className="text-gray-600">Amount</div>
              <div className="font-medium">{amountLabel || "—"}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-gray-600">When</div>
              <div className="font-medium">{whenLabel || "—"}</div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={loading}>
          {loading ? "Deleting..." : "Yes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
