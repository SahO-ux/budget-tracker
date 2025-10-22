import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataGrid } from "react-data-grid";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import Select from "react-select";
import _ from "lodash";

import CategoryModal from "./CategoryModal";
import CategoryDeleteModal from "./CategoryDeleteModal";
import { categoryColumns } from "./constants";
import EmptyRowsRenderer from "../../components/EmptyRowsRenderer";
import { deleteCategory, getCategories } from "./actions";
import {
  selectStyles,
  selectTheme,
  TransactionTypeEnums,
} from "../../utils/global-constants";
import { removeCategoryAction } from "../../store/actions/categoryActions";
import LoaderBar from "../../components/LoaderBar";

const CategoriesPage = () => {
  const LIMIT = 200;

  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const [sortColumns, setSortColumns] = useState([]);

  const typeOptions = useMemo(() => {
    return Object.values(TransactionTypeEnums).map((val) => ({
      label: _.capitalize(val),
      value: val,
    }));
  }, []);

  const columns = useMemo(
    () =>
      categoryColumns({
        onDeleteClick: (row) => {
          setDeleteTarget(row);
        },

        handleRowClick: (row) => {
          setSelectedCategory(row);
          setShowModal(true);
        },
      }),
    []
  );

  const debouncedSetName = useMemo(
    () =>
      _.debounce((value) => {
        setName(value);
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetName.cancel();
    };
  }, [debouncedSetName]);

  useEffect(() => {
    _getCategories();
  }, [name, type]);

  const handleNameChange = useCallback(
    (e) => {
      const raw = e?.target?.value?.trim();
      debouncedSetName(raw);
    },
    [debouncedSetName]
  );

  const _getCategories = () => {
    setIsLoading(true);
    const params = {
      skip: 0,
      limit: LIMIT,
      ...(name?.trim() && { name: name?.trim() }),
      ...(type?.trim() && { type: type?.trim() }),
    };
    getCategories(params)
      .then((res) => {
        // your API returns { results, total } per earlier messages
        const rows = res?.results || [];
        setRows(rows);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to auto-load categories on init:", err);
        setIsLoading(false);
      });
  };

  // handle delete (soft-delete)
  const handleDeleteConfirm = async (id) => {
    if (!id) return;
    try {
      await deleteCategory(id);
      dispatch(removeCategoryAction(id)); // Update in redux
      toast.success("Transaction deleted");
      // remove from UI
      setRows((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Failed to delete category", err);
      toast.error(
        err?.response?.data?.message || "Failed to delete transaction"
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAddedCategory = (category) => {
    if (!category) return;
    setRows((prev) => [category, ...prev]);
    setName("");
    setType("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleEditedCategory = (category = null) => {
    if (!category) return;

    setName("");
    setType("");

    setRows((prev) => {
      const idx = prev.findIndex((r) => r._id === category._id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = category;
        return copy;
      }
      // prepend
      return [category, ...prev];
    });
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Categories</h2>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setShowModal(true);
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            + Add
          </button>
        </div>

        {/* Filters */}
        {/* Filters */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search input - flexible width */}
            <div className="flex-1">
              <input
                ref={inputRef}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Search by name..."
                onChange={handleNameChange}
              />
            </div>

            {/* Type select - fixed width on larger screens */}
            <div className="w-full sm:w-56">
              <Select
                options={typeOptions}
                value={typeOptions.find((c) => c.value === type) || null}
                onChange={(opt) => setType(opt ? opt.value : "")}
                isClearable
                styles={selectStyles}
                theme={selectTheme}
                placeholder="Filter by type..."
                classNamePrefix="transaction-filter-select"
                menuPlacement="auto"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow relative">
          {isLoading && <LoaderBar />}
          <DataGrid
            columns={columns}
            rows={rows}
            className="rdg-light"
            style={{ height: "calc(100vh - 200px)" }}
            rowHeight={42}
            headerRowHeight={44}
            rowKeyGetter={(row) => row._id}
            sortColumns={sortColumns}
            onSortColumnsChange={setSortColumns}
            renderers={{
              noRowsFallback: <EmptyRowsRenderer />,
            }}
          />
        </div>
      </div>

      {/* Category add/edit modal */}
      {showModal && (
        <CategoryModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onAdd={handleEditedCategory}
          onEdit={handleAddedCategory}
          category={selectedCategory}
          typeOptions={typeOptions}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <CategoryDeleteModal
          show={!!deleteTarget}
          onHide={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleteConfirm(deleteTarget._id)}
          category={deleteTarget}
        />
      )}
    </>
  );
};

export default CategoriesPage;
