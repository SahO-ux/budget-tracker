import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import moment from "moment";
import _ from "lodash";

import {
  TransactionTypeEnums,
  selectStyles,
  selectTheme,
  formatNumber,
} from "../../utils/global-constants";
import { initialFilterState } from "./constants";

/**
 * Auto-apply TransactionFilters
 * - props:
 *    filters: current parent filters
 *    setFilters: setter (updates parent's filters state)
 *
 * Behavior:
 * - Clear (small button) resets all filters immediately
 * - compact single-row layout, wraps on small screens
 */
export default function TransactionFilters({ filters, setFilters }) {
  const expenseCategories = useSelector(
    (state) => state.categoriesReducer.expenseCategories || []
  );
  const incomeCategories = useSelector(
    (state) => state.categoriesReducer.incomeCategories || []
  );

  // local state for inputs (kept as simple strings while editing)
  //  const local ={}

  // compute category list based on selected type (or both if "All")
  const categoryOptions = useMemo(() => {
    const list =
      filters.type === TransactionTypeEnums.INCOME
        ? incomeCategories
        : filters.type === TransactionTypeEnums.EXPENSE
        ? expenseCategories
        : [...expenseCategories, ...incomeCategories];

    const seen = new Set();
    return list
      .map((c) => ({ value: c._id, label: c.name, type: c.type }))
      .filter((c) => {
        if (seen.has(c.value)) return false;
        seen.add(c.value);
        return true;
      });
  }, [filters.type, expenseCategories, incomeCategories]);

  const clearAll = () => {
    setFilters(initialFilterState);
  };

  return (
    <div className="bg-white rounded shadow-sm px-4 py-3 mb-4">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Type */}
        <div className="flex-shrink-0 w-40">
          <label className="block text-xs text-gray-600 mb-1">Type</label>
          <select
            className="w-full p-2 border rounded text-sm"
            value={filters.type}
            onChange={
              (e) =>
                setFilters((s) => ({
                  ...s,
                  type: e.target.value,
                  category: "",
                }))
              // setLocal((s) => ({ ...s, type: e.target.value }))
            }
          >
            <option value="">All</option>
            <option value={TransactionTypeEnums.EXPENSE}>
              {_.capitalize(TransactionTypeEnums.EXPENSE)}
            </option>
            <option value={TransactionTypeEnums.INCOME}>
              {_.capitalize(TransactionTypeEnums.INCOME)}
            </option>
          </select>
        </div>

        {/* Category */}
        <div className="flex-shrink-0 w-72 min-w-[180px]">
          <label className="block text-xs text-gray-600 mb-1">Category</label>
          <Select
            options={categoryOptions}
            value={
              categoryOptions.find((c) => c.value === filters.category) || null
            }
            onChange={(opt) =>
              setFilters((s) => ({ ...s, category: opt ? opt.value : "" }))
            }
            isClearable
            styles={selectStyles}
            theme={selectTheme}
            placeholder="All categories"
            classNamePrefix="transaction-filter-select"
            menuPlacement="auto"
          />
        </div>

        {/* Min amount */}
        <div className="flex-shrink-0 w-40">
          <label className="block text-xs text-gray-600 mb-1">Min</label>
          <input
            className="w-full p-2 border rounded text-sm"
            placeholder="e.g. 1000"
            value={
              filters.minAmount
                ? formatNumber(filters.minAmount, {
                    withCurrency: true,
                  })
                : ""
            }
            onChange={(e) =>
              setFilters((s) => ({
                ...s,
                minAmount: e.target.value.replace(/[^0-9]/g, ""),
              }))
            }
            inputMode="numeric"
          />
        </div>

        {/* Max amount */}
        <div className="flex-shrink-0 w-40">
          <label className="block text-xs text-gray-600 mb-1">Max</label>
          <input
            className="w-full p-2 border rounded text-sm"
            placeholder="e.g. 5000"
            value={
              filters.maxAmount
                ? formatNumber(filters.maxAmount, {
                    withCurrency: true,
                  })
                : ""
            }
            onChange={(e) =>
              setFilters((s) => ({
                ...s,
                maxAmount: e.target.value.replace(/[^0-9]/g, ""),
              }))
            }
            inputMode="numeric"
          />
        </div>

        {/* Start date */}
        <div className="flex-shrink-0 w-44">
          <label className="block text-xs text-gray-600 mb-1">From</label>
          <input
            type="date"
            className="w-full p-2 border rounded text-sm"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((s) => ({ ...s, startDate: e.target.value }))
            }
          />
        </div>

        {/* End date */}
        <div className="flex-shrink-0 w-44">
          <label className="block text-xs text-gray-600 mb-1">To</label>
          <input
            type="date"
            className="w-full p-2 border rounded text-sm"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((s) => ({ ...s, endDate: e.target.value }))
            }
          />
        </div>

        {/* Spacer + Clear button */}
        <div className="flex-1 min-w-[80px] flex justify-end">
          <button
            onClick={clearAll}
            title="Clear filters"
            className="px-3 py-2 text-sm border rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
