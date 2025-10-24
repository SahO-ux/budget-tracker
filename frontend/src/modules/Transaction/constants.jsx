import moment from "moment";
import { Trash } from "lucide-react";

import { formatNumber } from "../../utils/global-constants";
import _ from "lodash";

const validateTransaction = (transactionDetails = {}) => {
  if (
    !transactionDetails?.amount ||
    isNaN(transactionDetails?.amount) ||
    Number(transactionDetails?.amount) <= 0
  )
    return [false, "Amount must be greater than 0"];

  if (!transactionDetails?.category) return [false, "Category is required"];
  if (!transactionDetails?.type) return [false, "Type is required"];

  return [true, null]; //everythings good
};

const validateMinMaxAmountParams = ({ maxAmount, minAmount }) => {
  if (
    minAmount !== "" &&
    maxAmount !== "" &&
    minAmount !== null &&
    maxAmount !== null &&
    !isNaN(minAmount) &&
    !isNaN(maxAmount) &&
    Number(maxAmount) < Number(minAmount)
  )
    return [
      false,
      "Maximum amount should be greater than or equal to minimum amount.",
    ];

  return [true, null]; // isValid:true, error:null
};

export const transactionColumns = ({ onDeleteClick, handleRowClick }) => [
  {
    key: "category",
    name: "Category",
    cellClass: "text-center text-gray-800 cursor-pointer",
    headerCellClass: "text-center",
    renderCell: ({ row }) => (
      <div className="items-center" onClick={() => handleRowClick(row)}>
        {row.category?.name || "—"}
      </div>
    ),
    resizable: true,
  },
  {
    key: "type",
    name: "Type",
    cellClass: "text-center cursor-pointer",
    headerCellClass: "text-center",
    sortable: true,
    renderCell: ({ row }) => (
      <div
        className={`font-semibold ${
          row.type === "expense" ? "text-red-600" : "text-green-600"
        }`}
        onClick={() => handleRowClick(row)}
      >
        {row.type ? _.capitalize(row.type) : "-"}
      </div>
    ),
    resizable: true,
    width: 110,
  },
  {
    key: "amount",
    name: "Amount",
    sortable: true,
    cellClass: "text-center cursor-pointer",
    headerCellClass: "text-center",
    renderCell: ({ row }) => (
      <div className="text-center" onClick={() => handleRowClick(row)}>
        <span
          className={`font-semibold ${
            row.type === "expense" ? "text-red-600" : "text-green-600"
          }`}
        >
          {formatNumber(row.amount, { withCurrency: true })}
        </span>
      </div>
    ),
    resizable: true,
    width: 140,
  },
  {
    key: "note",
    name: "Note",
    cellClass: "text-center text-gray-800 cursor-pointer text-truncate",
    headerCellClass: "text-center",
    renderCell: ({ row }) => (
      <div className="" onClick={() => handleRowClick(row)}>
        {row.note || "—"}
      </div>
    ),
    resizable: true,
  },
  {
    key: "createdAt",
    name: "Date",
    sortable: true,
    cellClass: "text-center text-gray-800 cursor-pointer",
    headerCellClass: "text-center",
    renderCell: ({ row }) => (
      <div onClick={() => handleRowClick(row)}>
        {row.createdAt
          ? moment(row.createdAt).format("DD MMM YYYY, h:mm A")
          : "—"}
      </div>
    ),
    resizable: true,
    width: 180,
  },
  {
    key: "actions",
    name: "",
    width: 60,
    renderCell: ({ row }) => (
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent row click
          onDeleteClick && onDeleteClick(row);
        }}
        className="p-1 hover:bg-red-50 rounded"
        title="Delete"
      >
        <Trash size={16} className="text-red-500" />
      </button>
    ),
  },
];

// For infinite scroll trigger
const isAtBottom = ({ currentTarget }) => {
  return !(
    currentTarget.scrollTop + 10 >=
    currentTarget.scrollHeight - currentTarget.clientHeight
  );
};

const initialFilterState = {
  category: "",
  type: "",
  startDate: "",
  endDate: "",
  minAmount: null,
  maxAmount: null,
};

export {
  validateTransaction,
  validateMinMaxAmountParams,
  isAtBottom,
  initialFilterState,
};
