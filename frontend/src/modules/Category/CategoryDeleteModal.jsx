import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

import _ from "lodash";

export default function CategoryDeleteModal({
  show,
  onHide,
  onConfirm,
  category,
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

  return (
    <Modal show={!!show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Delete category</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-sm text-gray-700">
          Are you sure you want to delete this category?
        </p>

        {category && (
          <div className="mt-3 p-3 rounded border bg-gray-50 text-sm">
            <div className="flex justify-between mb-1">
              <div className="text-gray-600">Name</div>
              <div className="font-medium">{category?.name || "—"}</div>
            </div>
            <div className="flex justify-between mb-1">
              <div className="text-gray-600">Type</div>
              <div className="font-medium">
                {_.capitalize(category?.type) || "—"}
              </div>
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
