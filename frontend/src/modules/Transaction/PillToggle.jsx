import _ from "lodash";

import { TransactionTypeEnums } from "../../utils/global-constants";

// pill toggle component (inline)
const PillToggle = ({ value, onChange }) => {
  const options = Object.values(TransactionTypeEnums).map((val) => {
    return { key: val, label: _.capitalize(val) };
  });

  return (
    <div
      className="inline-flex rounded-md bg-gray-100 p-1"
      role="tablist"
      aria-label="Transaction type"
    >
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-pressed={active}
            onClick={() => onChange(opt.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition ${
              active
                ? "bg-primary-500 text-white shadow"
                : "text-gray-700 hover:bg-white hover:shadow-sm"
            }`}
            style={{ minWidth: 100 }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default PillToggle;
