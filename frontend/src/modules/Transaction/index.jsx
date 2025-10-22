import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DataGrid } from "react-data-grid";
import toast from "react-hot-toast";

import { getTransactions, deleteTransaction } from "./actions";
import TransactionModal from "./TransactionModal";
import TransactionDeleteModal from "./TransactionDeleteModal";
import TransactionFilters from "./TransactionFilters";
import {
  initialFilterState,
  isAtBottom,
  transactionColumns,
} from "./constants";

import "react-data-grid/lib/styles.css";
import LoaderBar from "../../components/LoaderBar";

/**
 * TransactionsPage
 * - DataGrid with virtualization
 * - infinite auto-loading via onScroll
 * - sorting (server-side): sortColumn
 * - reset pagination when filters or sort change
 */

export default function TransactionsPage() {
  const LIMIT = 20;
  const firstRenderRef = useRef(true);

  // rows & pagination
  const [rows, setRows] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [skip, setSkip] = useState(0);
  // const [hasMore, setHasMore] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // for add/edit/view
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // filters & sorting
  const [filters, setFilters] = useState(initialFilterState);

  // react-data-grid sorting uses "ASC"|"DESC"|"NONE"
  // const [sortColumn, setSortColumn] = useState("");
  const [sortColumn, setSortColumn] = useState([]);

  const columns = useMemo(
    () =>
      transactionColumns({
        onDeleteClick: (row) => {
          setDeleteTarget(row);
        },

        handleRowClick: (row) => {
          setSelectedTransaction(row);
          setShowModal(true);
        },
      }),
    []
  );

  // build params for API call
  const buildParams = useCallback(
    (overrideSkip = null) => {
      const p = {
        // skip: overrideSkip !== null ? overrideSkip : skip,
        skip,
        limit: LIMIT,
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.minAmount != null && filters.minAmount !== ""
          ? { minAmount: filters.minAmount }
          : {}),
        ...(filters.maxAmount != null && filters.maxAmount !== ""
          ? { maxAmount: filters.maxAmount }
          : {}),
        ...(filters.startDate ? { startDate: filters.startDate } : {}),
        ...(filters.endDate ? { endDate: filters.endDate } : {}),
      };

      // if sortColumns has an item, use its values for server params
      const descriptor =
        Array.isArray(sortColumn) && sortColumn.length > 0
          ? sortColumn[sortColumn.length - 1] // last sort descriptor (or use [0] if single-sort)
          : null;

      if (
        descriptor &&
        descriptor.direction &&
        descriptor.direction !== "NONE"
      ) {
        p.sortBy = descriptor.columnKey;
        p.sortDir = descriptor.direction.toLowerCase();
      }

      return p;
    },
    [filters, skip, sortColumn]
  );

  const _getTransactions = useCallback(
    async ({ reset = false } = {}) => {
      // If already loading, don't fire another
      if (isLoading) return;

      setIsLoading(true);
      try {
        const params = buildParams(reset ? 0 : null);
        // When reset we must request skip=0
        if (reset) params.skip = 0;

        const data = await getTransactions(params); // { results, count, total }
        const results = data?.results || [];
        const totalTransactions = data?.total;

        setTotalTransactions(totalTransactions);

        if (reset) {
          setRows(results);
        } else {
          setRows((prev) => [...prev, ...results]);
        }
      } catch (err) {
        console.error("Failed to fetch transactions", err);
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch transactions"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, buildParams, skip]
  );

  // Reset pagination when filters or sorting change
  useEffect(() => {
    setRows([]);
    setSkip(0);
    _getTransactions({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortColumn]);

  useEffect(() => {
    if (firstRenderRef.current) {
      // first render — skip this effect once
      firstRenderRef.current = false;
      return;
    }
    _getTransactions();
  }, [skip]);

  // Called by DataGrid's onScroll
  const handleScroll = async (e) => {
    if (isLoading || isAtBottom(e)) return;

    if (skip + LIMIT < totalTransactions) {
      setSkip(skip + LIMIT);
    }
  };

  // handle delete (soft-delete)
  const handleDeleteConfirm = async (id) => {
    try {
      await deleteTransaction(id);
      toast.success("Transaction deleted");
      // remove from UI
      setRows((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Failed to delete transaction", err);
      toast.error(
        err?.response?.data?.message || "Failed to delete transaction"
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  const onAddedOrEdited = (transaction) => {
    if (!transaction) {
      // simple approach: reset & reload first page
      setRows([]);
      setSkip(0);
      _getTransactions({ reset: true });
      return;
    }

    setRows((prev) => {
      const idx = prev.findIndex((r) => r._id === transaction._id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = transaction;
        return copy;
      }
      // prepend
      return [transaction, ...prev];
    });
  };

  const EmptyRowsRenderer = () => {
    return (
      <div style={{ textAlign: "start", gridColumn: "1/-1" }}>
        <div
          style={{
            padding: "20px 10px",
            backgroundColor: "white",
            fontSize: "12px",
          }}
        >
          No Transaction Found
        </div>
      </div>
    );
  };

  const rowKeyGetter = (row) => {
    return `${row._id}`;
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Transactions</h2>
          <button
            onClick={() => {
              setSelectedTransaction(null);
              setShowModal(true);
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Add
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <TransactionFilters filters={filters} setFilters={setFilters} />
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
            rowKeyGetter={rowKeyGetter}
            onScroll={(e) => handleScroll(e)}
            sortColumns={sortColumn}
            onSortColumnsChange={(newSortColumns) => {
              setSortColumn(newSortColumns || []);
            }}
            components={{
              noRowsFallback: <EmptyRowsRenderer />,
            }}
          />
        </div>
      </div>

      {/* Transaction add/edit/view modal */}
      {showModal && (
        <TransactionModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onAddedOrEdited={onAddedOrEdited}
          transaction={selectedTransaction}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <TransactionDeleteModal
          show={!!deleteTarget}
          onHide={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleteConfirm(deleteTarget._id)}
          transaction={deleteTarget}
        />
      )}
    </>
  );
}
