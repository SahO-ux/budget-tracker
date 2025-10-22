const EmptyRowsRenderer = () => {
  return (
    <div
      style={{ gridColumn: "1 / -1" }}
      className="flex justify-center items-center h-[42px] bg-white text-[13px] text-gray-500"
    >
      No Transactions Found
    </div>
  );
};

export default EmptyRowsRenderer;
