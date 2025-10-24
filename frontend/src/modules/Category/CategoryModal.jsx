import { useEffect, useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import Select from "react-select";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import { createCategory, updateCategory } from "./actions";
import { selectStyles, selectTheme } from "../../utils/global-constants";
import { validateCategoryPayload } from "./constants";
import {
  addCategoryAction,
  updateCategoryAction,
} from "../../store/actions/categoryActions";

export default function CategoryModal({
  show,
  onHide,
  onAdd,
  onEdit,
  category,
  typeOptions,
}) {
  const dispatch = useDispatch();
  const categoryRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const [categoryDetails, setCategoryDetails] = useState({
    type: "",
    name: "",
  });

  // Populate when transaction prop changes (view/edit)
  useEffect(() => {
    if (!category) return;
    console.log({ category });

    // Prefill fields from provided transaction object
    setCategoryDetails({
      type: category?.type,
      name: category?.name,
    });
  }, [category]);

  useEffect(() => {
    if (!show) return;
    // focus amount with a small delay so the modal animation completes
    setTimeout(() => categoryRef.current?.focus(), 120);
  }, [show]);

  const _save = async () => {
    // Validate client side (validateTransaction expects the internal shape)
    // Build payload object to validate
    const payload = {
      type: categoryDetails?.type?.trim(),
      name: categoryDetails?.name?.trim(),
    };

    const [isValid, errMsg] = validateCategoryPayload(payload);
    if (!isValid) return toast.error(errMsg);

    setLoading(true);

    try {
      let resultCategory = null;

      if (category && category._id) {
        // Update existing category
        resultCategory = await updateCategory(category._id, payload);
        dispatch(updateCategoryAction(resultCategory)); // update in redux
        onEdit && onEdit(resultCategory);
      } else {
        // Create new category
        resultCategory = await createCategory(payload);
        dispatch(addCategoryAction(resultCategory));
        onAdd && onAdd(resultCategory);
      }
      toast.success(
        `Category ${category?._id ? "edited" : "added"} successfully`
      );
      onHide && onHide();
    } catch (err) {
      console.error("Category save error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to save category"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={!!show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{`${category ? "Edit" : "Add"} Category`}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            {console.log({ categoryDetails })}
            <input
              ref={categoryRef}
              className="w-full p-2 border rounded-lg mb-3"
              placeholder="Name"
              type="text"
              value={categoryDetails.name || ""}
              onChange={(e) =>
                setCategoryDetails((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
            <div>
              <Select
                placeholder="Type"
                options={typeOptions}
                value={
                  typeOptions.find(
                    (val) => val.value === categoryDetails.type
                  ) || null
                }
                onChange={(opt) =>
                  setCategoryDetails((prev) => ({
                    ...prev,
                    type: opt ? opt.value : null,
                  }))
                }
                styles={selectStyles}
                theme={selectTheme}
                classNamePrefix="category-select"
                isClearable
              />
            </div>
          </div>
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
