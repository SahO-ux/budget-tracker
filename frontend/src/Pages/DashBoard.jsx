import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import * as d3 from "d3";
import { motion as Motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { getBudgetForMonth } from "../modules/Budget/actions";
import QuickActionCard from "../components/QuickActionCard";
import CreateBudgetModal from "../components/CreateBudgetModal";
import { formatNumber } from "../utils/global-constants";

/* Utility small skeleton */
function Skeleton({ className = "h-6 bg-gray-100 rounded" }) {
  return <div className={`${className} animate-pulse`} />;
}

/* Reusable stat/card */
function StatCard({ title, value, accent, className = "", children }) {
  return (
    <div className={`card ${className} p-4 flex flex-col justify-between`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className={`text-2xl font-bold mt-1 ${accent || ""}`}>
            {value}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const chartRef = useRef(null);
  const navigate = useNavigate();

  const [month, setMonth] = useState(moment().format("YYYY-MM"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  useEffect(() => {
    fetchBudget(month);
  }, [month]);

  useEffect(() => {
    if (data) drawDonut();
    // cleanup on unmount
    return () => {
      if (chartRef.current) d3.select(chartRef.current).selectAll("*").remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  async function fetchBudget(selectedMonth) {
    setLoading(true);
    setError(null);
    try {
      const res = await getBudgetForMonth(selectedMonth);
      setData(res);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message || err.message || "Failed to load budget";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function prevMonth() {
    const m = moment(month, "YYYY-MM").subtract(1, "month").format("YYYY-MM");
    setMonth(m);
  }
  function nextMonth() {
    const m = moment(month, "YYYY-MM").add(1, "month").format("YYYY-MM");
    setMonth(m);
  }
  function pickMonth(e) {
    setMonth(e.target.value);
  }

  function drawDonut() {
    const node = chartRef.current;
    if (!node || !data) return;
    d3.select(node).selectAll("*").remove();

    const width = 260;
    const height = 260;
    const radius = Math.min(width, height) / 2;

    const spent = Number(data.spent || 0);
    const budget = Number(data.budget || 0);
    const remaining = Math.max(0, budget - spent);

    const pieData =
      budget > 0
        ? [
            { key: "Spent", value: spent },
            { key: "Remaining", value: remaining },
          ]
        : [
            { key: "Spent", value: spent },
            { key: "None", value: 1 },
          ];

    const colors = d3
      .scaleOrdinal()
      .domain(pieData.map((d) => d.key))
      .range(["#ef4444", "#2563eb"]); // red / blue (danger / primary)

    const svg = d3
      .select(node)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "100%");

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const arc = d3
      .arc()
      .innerRadius(radius * 0.62)
      .outerRadius(radius * 0.95)
      .cornerRadius(8);

    const pie = d3
      .pie()
      .sort(null)
      .value((d) => d.value);

    const arcs = g
      .selectAll("g.arc")
      .data(pie(pieData))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("fill", (d) => colors(d.data.key))
      .attr("opacity", (d) => (d.data.key === "None" ? 0.08 : 1))
      .transition()
      .duration(700)
      .attrTween("d", function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => arc(i(t));
      });

    // center label
    const center = g.append("g").attr("class", "center");
    center
      .append("text")
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", 600)
      .text(budget ? `${formatNumber(budget, { withCurrency: true })}` : "₹0");

    center
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.4em")
      .style("fill", "#666")
      .style("font-size", "12px")
      .text("Budget");

    const percent =
      budget > 0
        ? Math.min(100, Math.round((spent / budget) * 100))
        : spent > 0
        ? 100
        : 0;
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 6)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text(
        `Spent: ${formatNumber(spent, { withCurrency: true })} (${percent}%)`
      );
  }

  const totalIncome = data ? Number(data.income || 0) : 0;
  const spentPercent =
    data && data.budget
      ? Math.min(100, Math.round((data.spent / data.budget) * 100))
      : data && data.spent
      ? 100
      : 0;
  const remaining = data
    ? Math.max(0, (data.budget || 0) - (data.spent || 0))
    : 0;
  const balance = totalIncome - (data ? Number(data.spent || 0) : 0);

  /* framer-motion variants */
  const enterUp = {
    hidden: { y: 8, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="px-3 py-2 rounded bg-white soft-shadow hover:translate-y-[-1px] transition-transform"
              aria-label="Previous month"
            >
              Prev
            </button>

            <input
              type="month"
              value={month}
              onChange={pickMonth}
              className="px-3 py-2 rounded border border-gray-300"
              aria-label="Select month"
            />

            <button
              onClick={nextMonth}
              className="px-3 py-2 rounded bg-white soft-shadow hover:translate-y-[-1px] transition-transform"
              aria-label="Next month"
            >
              Next
            </button>
          </div>
        </div>

        {/* top area: hero + donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Motion.div
            className="lg:col-span-2 card p-6"
            initial="hidden"
            animate="visible"
            variants={enterUp}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {loading ? (
              <>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-12 w-40" />
                </div>
                <div className="mt-6">
                  <Skeleton className="h-3 w-full" />
                  <div className="mt-3 flex justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </>
            ) : error ? (
              <div className="text-red-700">{error}</div>
            ) : data ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">
                      Budget ({data.month})
                    </div>
                    <div className="text-3xl font-bold mt-1">
                      {formatNumber(data.budget ?? 0, { withCurrency: true })}
                    </div>
                  </div>

                  {/* Right side: show Income, Spent and Balance */}
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-sm text-gray-500">Income</div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatNumber(totalIncome, { withCurrency: true })}
                    </div>

                    <div className="text-sm text-gray-500 mt-2">Spent</div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatNumber(data.spent ?? 0, { withCurrency: true })}
                    </div>

                    <div className="text-sm text-gray-500 mt-2">Balance</div>
                    <div
                      className={`text-lg font-semibold ${
                        balance < 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {formatNumber(balance, { withCurrency: true })}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-red-400 to-red-600 transition-all"
                      style={{ width: `${spentPercent}%` }}
                      aria-hidden
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <div>Spent ({spentPercent}%)</div>
                    <div>{`Remaining: ${formatNumber(remaining, {
                      withCurrency: true,
                    })}`}</div>
                  </div>
                </div>
              </>
            ) : (
              <div>No data for this month.</div>
            )}
          </Motion.div>

          <Motion.div
            className="card p-6 flex items-center justify-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div
              style={{ width: 260, height: 260 }}
              ref={chartRef}
              aria-hidden
            />
          </Motion.div>
        </div>

        {/* quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <QuickActionCard
            title="Analytics"
            subtitle="Visualize income & expenses"
            onClick={() => navigate("/analytics")}
            icon="A"
            className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
          />
          <QuickActionCard
            title="Transactions"
            subtitle="View recent transactions"
            onClick={() => navigate("/transactions")}
            icon="TX"
          />
          <QuickActionCard
            title="Categories"
            subtitle="Manage your categories"
            onClick={() => navigate("/categories")}
            icon="C"
          />
          <QuickActionCard
            title="Budgets"
            subtitle="Set or edit monthly budget"
            onClick={() => setBudgetModalOpen(true)}
            icon="B"
          />
        </div>

        <div className="text-sm text-gray-500">
          Tip: use the month picker to jump between months.
        </div>
      </div>
      <CreateBudgetModal
        show={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        defaultMonth={month}
        onSaved={() => {
          // refresh budget after saving
          fetchBudget(month);
        }}
      />
    </>
  );
}
