import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import moment from "moment";

import API from "../api";
import { formatNumber } from "../utils/global-constants";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const containerRef = useRef(null);
  const svgCategoryRef = useRef(null);
  const svgMonthlyRef = useRef(null);
  const tooltipRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const res = await API.get("/analytics");
        if (!cancelled)
          setData(res.data.data || { categorySummary: [], monthlySummary: [] });
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        if (!cancelled) setData({ categorySummary: [], monthlySummary: [] });
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // redraw both charts on data or resize
  useEffect(() => {
    if (!data) return;
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      drawCategoryChart();
      drawMonthlyChart();
    });
    resizeObserverRef.current = ro;
    ro.observe(container);

    // initial draw
    drawCategoryChart();
    drawMonthlyChart();

    return () => {
      ro.disconnect();
      d3.select(svgCategoryRef.current).selectAll("*").remove();
      d3.select(svgMonthlyRef.current).selectAll("*").remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* --------------------------
     Category chart function
     -------------------------- */
  function drawCategoryChart() {
    const dataset = data?.categorySummary || [];
    const svgEl = svgCategoryRef.current;
    const container = containerRef.current;
    const tooltipEl = tooltipRef.current;
    d3.select(svgEl).selectAll("*").remove();

    if (!dataset || dataset.length === 0) {
      d3.select(svgEl)
        .append("text")
        .attr("x", 20)
        .attr("y", 40)
        .text("No category data")
        .attr("fill", "#666")
        .style("font-size", "14px");
      return;
    }

    const bbox = container.getBoundingClientRect();
    const width = Math.max(600, bbox.width - 40);
    const height = 420;
    const margin = { top: 36, right: 20, bottom: 86, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgEl)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const color = (type) => (type === "income" ? "#16a34a" : "#ef4444");

    const x = d3
      .scaleBand()
      .domain(dataset.map((d) => d.categoryName))
      .range([0, innerWidth])
      .padding(0.25);

    const yMax = d3.max(dataset, (d) => d.totalAmount) || 0;
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([innerHeight, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // grid
    g.append("g")
      .attr("class", "grid-lines")
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(""))
      .selectAll("line")
      .attr("stroke", "#e6e6e6");

    // y axis
    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => formatNumber(d, { withCurrency: true }))
      )
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#444");

    // x axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));
    xAxis
      .selectAll("text")
      .style("font-size", "12px")
      .attr("transform", "rotate(-40)")
      .attr("text-anchor", "end")
      .attr("dx", "-0.35em")
      .attr("dy", "0.45em");

    // title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", 700)
      .text("Total Amount by Category");

    // legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 220}, ${8})`);
    const legendData = [
      { label: "Income", color: "#16a34a" },
      { label: "Expense", color: "#ef4444" },
    ];
    legend
      .selectAll("g.legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * 90},0)`)
      .call((sel) => {
        sel
          .append("rect")
          .attr("width", 14)
          .attr("height", 14)
          .attr("rx", 3)
          .attr("fill", (d) => d.color);
        sel
          .append("text")
          .attr("x", 18)
          .attr("y", 11)
          .text((d) => d.label)
          .style("font-size", "12px")
          .style("fill", "#333");
      });

    // bars
    const bars = g.append("g").attr("class", "bars");
    bars
      .selectAll("rect.bar")
      .data(dataset, (d) => d.categoryName)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.categoryName))
      .attr("y", innerHeight)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", (d) => color(d.type))
      .attr("rx", 3)
      .on("mouseenter", function (event, d) {
        const tt = d3.select(tooltipEl);
        tt.style("display", "block");
        tt.html(
          `<div style="font-weight:700">${d.categoryName}</div>
           <div style="font-size:13px">${
             d.type ? d.type.toUpperCase() : ""
           }</div>
           <div style="margin-top:6px">${formatNumber(d.totalAmount, {
             withCurrency: true,
           })}</div>`
        );
        d3.select(this).attr("opacity", 0.9);
      })
      .on("mousemove", function (event) {
        const tt = d3.select(tooltipEl);
        const rect = container.getBoundingClientRect();
        const left = Math.min(rect.width - 200, event.clientX - rect.left + 12);
        const top = Math.max(8, event.clientY - rect.top - 36);
        tt.style("transform", `translate(${left}px, ${top}px)`);
      })
      .on("mouseleave", function () {
        d3.select(tooltipEl).style("display", "none");
        d3.select(this).attr("opacity", 1);
      })
      .transition()
      .duration(700)
      .attr("y", (d) => y(d.totalAmount))
      .attr("height", (d) => Math.max(0, innerHeight - y(d.totalAmount)));

    // value labels
    bars
      .selectAll("text.bar-label")
      .data(dataset, (d) => d.categoryName)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => x(d.categoryName) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.totalAmount) + 16)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", (d) => (y(d.totalAmount) < 22 ? "#000" : "#fff"))
      .text((d) => formatNumber(d.totalAmount, { withCurrency: true }))
      .style("pointer-events", "none")
      .attr("opacity", 0)
      .transition()
      .delay(400)
      .duration(300)
      .attr("opacity", 1);
  }

  function drawMonthlyChart() {
    const monthlyRaw = data?.monthlySummary || [];
    const svgEl = svgMonthlyRef.current;
    const container = containerRef.current;
    const tooltipEl = tooltipRef.current;
    d3.select(svgEl).selectAll("*").remove();

    if (!monthlyRaw || monthlyRaw.length === 0) {
      d3.select(svgEl)
        .append("text")
        .attr("x", 20)
        .attr("y", 40)
        .text("No monthly data")
        .attr("fill", "#666")
        .style("font-size", "14px");
      return;
    }

    // Normalize input to a uniform format:
    // produce items like: { year, month (1-12), type, totalAmount }
    const normalized = monthlyRaw.map((r) => {
      if (r._id && typeof r._id === "object") {
        // Aggregation shape: { _id: { year, month, type }, totalAmount }
        return {
          year: r._id.year,
          month: r._id.month,
          type: r._id.type,
          totalAmount: Number(r.totalAmount || 0),
        };
      }
      // Flattened shape: { year, month, type, totalAmount }
      return {
        year: Number(r.year),
        month: Number(r.month),
        type: r.type,
        totalAmount: Number(r.totalAmount || 0),
      };
    });

    // Group by year-month and aggregate income/expense into fields
    const grouped = {};
    normalized.forEach((r) => {
      if (!r.year || !r.month) return;
      const key = `${r.year}-${String(r.month).padStart(2, "0")}`;
      if (!grouped[key]) {
        grouped[key] = {
          monthKey: key,
          year: r.year,
          monthNum: r.month,
          income: 0,
          expense: 0,
        };
      }
      const t = r.type || "expense";
      grouped[key][t] = (grouped[key][t] || 0) + (Number(r.totalAmount) || 0);
    });

    // Convert to array and sort ascending by year+month
    const dataset = Object.values(grouped)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthNum - b.monthNum;
      })
      .map((d) => ({
        ...d,
        label: moment(
          `${d.year}-${String(d.monthNum).padStart(2, "0")}`,
          "YYYY-MM"
        ).format("MMM YYYY"),
      }));

    // If after normalization dataset is empty -> show "No monthly data"
    if (!dataset.length) {
      d3.select(svgEl)
        .append("text")
        .attr("x", 20)
        .attr("y", 40)
        .text("No monthly data")
        .attr("fill", "#666")
        .style("font-size", "14px");
      return;
    }

    // drawing area
    const bbox = container.getBoundingClientRect();
    const width = Math.max(600, bbox.width - 40);
    const height = 320;
    const margin = { top: 36, right: 20, bottom: 64, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgEl)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // x: month groups
    const x0 = d3
      .scaleBand()
      .domain(dataset.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.2);
    // x1: within-group (income vs expense)
    const x1 = d3
      .scaleBand()
      .domain(["income", "expense"])
      .range([0, x0.bandwidth()])
      .padding(0.08);

    const yMax =
      d3.max(dataset, (d) => Math.max(d.income || 0, d.expense || 0)) || 0;
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([innerHeight, 0]);

    const colorMap = { income: "#16a34a", expense: "#ef4444" };

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // grid lines
    g.append("g")
      .attr("class", "grid-lines")
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerWidth).tickFormat(""))
      .selectAll("line")
      .attr("stroke", "#e6e6e6");

    // y axis numeric
    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickFormat((d) => formatNumber(d, { withCurrency: true }))
      )
      .selectAll("text")
      .style("font-size", "12px");

    // x axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0));
    xAxis
      .selectAll("text")
      .style("font-size", "12px")
      .attr("transform", "rotate(-35)")
      .attr("text-anchor", "end")
      .attr("dx", "-0.35em")
      .attr("dy", "0.45em");

    // title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", 700)
      .text("Monthly Income / Expense");

    // bars per month group
    const group = g
      .selectAll("g.month-group")
      .data(dataset)
      .enter()
      .append("g")
      .attr("class", "month-group")
      .attr("transform", (d) => `translate(${x0(d.label)},0)`);

    group
      .selectAll("rect")
      .data((d) =>
        ["income", "expense"].map((k) => ({
          key: k,
          value: d[k] || 0,
          meta: d,
        }))
      )
      .enter()
      .append("rect")
      .attr("x", (d) => x1(d.key))
      .attr("y", innerHeight)
      .attr("width", x1.bandwidth())
      .attr("height", 0)
      .attr("fill", (d) => colorMap[d.key])
      .attr("rx", 3)
      .on("mouseenter", function (event, d) {
        const tt = d3.select(tooltipEl);
        tt.style("display", "block");
        tt.html(
          `<div style="font-weight:700">${d.meta.label}</div>
         <div style="font-size:13px">${d.key.toUpperCase()}</div>
         <div style="margin-top:6px">${formatNumber(d.value, {
           withCurrency: true,
         })}</div>`
        );
        d3.select(this).attr("opacity", 0.9);
      })
      .on("mousemove", function (event) {
        const tt = d3.select(tooltipEl);
        const rect = container.getBoundingClientRect();
        const left = Math.min(rect.width - 200, event.clientX - rect.left + 12);
        const top = Math.max(8, event.clientY - rect.top - 36);
        tt.style("transform", `translate(${left}px, ${top}px)`);
      })
      .on("mouseleave", function () {
        d3.select(tooltipEl).style("display", "none");
        d3.select(this).attr("opacity", 1);
      })
      .transition()
      .duration(700)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => Math.max(0, innerHeight - y(d.value)));

    // labels inside bars (if space)
    group
      .selectAll("text.bar-label")
      .data((d) =>
        ["income", "expense"].map((k) => ({
          key: k,
          value: d[k] || 0,
          meta: d,
        }))
      )
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => x1(d.key) + x1.bandwidth() / 2)
      .attr("y", (d) => y(d.value) + 16)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", (d) => (y(d.value) < 18 ? "#000" : "#fff"))
      .text((d) =>
        d.value ? formatNumber(d.value, { withCurrency: true }) : ""
      )
      .style("pointer-events", "none")
      .attr("opacity", 0)
      .transition()
      .delay(400)
      .duration(300)
      .attr("opacity", 1);

    // legend for monthly chart
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 220}, ${8})`);
    const legendData = [
      { label: "Income", color: "#16a34a" },
      { label: "Expense", color: "#ef4444" },
    ];
    legend
      .selectAll("g.legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * 90},0)`)
      .call((sel) => {
        sel
          .append("rect")
          .attr("width", 14)
          .attr("height", 14)
          .attr("rx", 3)
          .attr("fill", (d) => d.color);
        sel
          .append("text")
          .attr("x", 18)
          .attr("y", 11)
          .text((d) => d.label)
          .style("font-size", "12px")
          .style("fill", "#333");
      });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Analytics Dashboard</h1>

      <div ref={containerRef} className="space-y-6">
        <div
          className="card p-6"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <svg
            ref={svgCategoryRef}
            style={{ width: "100%", height: 420, display: "block" }}
          />
          <div
            ref={tooltipRef}
            style={{
              position: "absolute",
              pointerEvents: "none",
              display: "none",
              minWidth: 160,
              background: "rgba(255,255,255,0.98)",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 6px 20px rgba(2,6,23,0.08)",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 13,
              color: "#111",
              transform: "translate(0,0)",
              zIndex: 30,
            }}
          />
        </div>

        <div
          className="card p-6"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <svg
            ref={svgMonthlyRef}
            style={{ width: "100%", height: 340, display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}
