const TransactionTypeEnums = {
  INCOME: "income",
  EXPENSE: "expense",
};

const indianNumberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

/**
 * Format a number into Indian-style digits (e.g., 1,23,456)
 * Optionally prefix it with a currency symbol (like ₹)
 */
const formatNumber = (value, options = { withCurrency: false }) => {
  if (value === null || value === undefined || value === "") return "";

  const numericValue = Number(String(value).replace(/[^0-9]/g, ""));
  if (isNaN(numericValue)) return "";

  const formatted = indianNumberFormatter.format(numericValue);
  return options.withCurrency ? `₹ ${formatted}` : formatted;
};

// react-select custom styles (elegant compact look)
const primaryColor = "#2563eb"; // use your tailwind primary or change
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "42px",
    height: "42px",
    borderRadius: 8,
    borderColor: state.isFocused ? primaryColor : "#d1d5db",
    boxShadow: state.isFocused ? `0 0 0 3px ${primaryColor}22` : "none", // subtle focus ring
    "&:hover": { borderColor: state.isFocused ? primaryColor : "#cbd5e1" },
    paddingLeft: 6,
    paddingRight: 6,
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "2px 6px",
  }),
  input: (provided) => ({ ...provided, margin: 0, padding: 0 }),
  placeholder: (provided) => ({ ...provided, color: "#94a3b8" }),
  singleValue: (provided) => ({
    ...provided,
    color: "#0f172a",
    fontWeight: 500,
  }),
  menu: (provided) => ({ ...provided, borderRadius: 8, overflow: "hidden" }),
  option: (provided, state) => ({
    ...provided,
    background: state.isFocused ? "#f8fafc" : "#fff",
    color: "#0f172a",
    padding: "8px 12px",
  }),
};

const selectTheme = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary25: "#eef2ff",
    primary: primaryColor,
  },
});

export { TransactionTypeEnums, selectStyles, selectTheme, formatNumber };
