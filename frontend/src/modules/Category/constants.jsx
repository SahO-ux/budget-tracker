import _ from "lodash";
import { Trash } from "lucide-react";
import moment from "moment";

export const categoryColumns = ({ onDeleteClick, handleRowClick }) => [
  {
    key: "name",
    name: "Category Name",
    cellClass: "text-left text-gray-800 cursor-pointer",
    headerCellClass: "text-left",
    sortable: true,
    renderCell: ({ row }) => (
      <div className="pl-2" onClick={() => handleRowClick(row)}>
        {row?.name || "—"}
      </div>
    ),
    resizable: true,
  },
  {
    key: "type",
    name: "Type",
    cellClass: "text-left cursor-pointer",
    headerCellClass: "text-left",
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

const validateCategoryPayload = (payload = {}) => {
  if (!payload?.name?.trim()) return [false, "Name is required"];
  if (!payload?.type?.trim()) return [false, "Type is required"];

  return [true, null]; //everythings good
};

export { validateCategoryPayload };
