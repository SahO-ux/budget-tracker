import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import API from "../api";
import { formatNumber } from "../utils/global-constants";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // fetch analytics once
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

  // redraw on data or resize
  useEffect(() => {
    if (!data) return;

    const container = containerRef.current;
    if (!container) return;

    // redraw whenever container size changes
    const ro = new ResizeObserver(() => {
      drawChart();
    });
    resizeObserverRef.current = ro;
    ro.observe(container);

    // initial draw
    drawChart();

    return () => {
      ro.disconnect();
      // clear svg
      d3.select(svgRef.current).selectAll("*").remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function drawChart() {
    const dataset = data?.categorySummary || [];
    const svgEl = svgRef.current;
    const container = containerRef.current;
    const tooltipEl = tooltipRef.current;

    // clear previous
    d3.select(svgEl).selectAll("*").remove();
    if (!dataset || dataset.length === 0) {
      // optional: show "No data" text
      d3.select(svgEl)
        .append("text")
        .attr("x", 20)
        .attr("y", 40)
        .text("No data to display")
        .attr("fill", "#666")
        .style("font-size", "14px");
      return;
    }

    // compute sizes based on container width (responsive)
    const bbox = container.getBoundingClientRect();
    const width = Math.max(600, bbox.width - 40); // ensure minimum
    const height = 420;
    const margin = { top: 36, right: 20, bottom: 86, left: 80 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgEl)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // color mapping by type
    const color = (type) => (type === "income" ? "#16a34a" : "#ef4444"); // green / red

    // x scale
    const x = d3
      .scaleBand()
      .domain(dataset.map((d) => d.categoryName))
      .range([0, innerWidth])
      .padding(0.25);

    // y scale
    const yMax = d3.max(dataset, (d) => d.totalAmount) || 0;
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([innerHeight, 0]);

    // group container
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // y grid lines
    g.append("g")
      .attr("class", "grid-lines")
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(""))
      .selectAll("line")
      .attr("stroke", "#e6e6e6");

    // left axis with formatted ticks (₹)
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
      .call(d3.axisBottom(x).tickSizeOuter(0));

    xAxis
      .selectAll("text")
      .style("font-size", "12px")
      .attr("transform", "rotate(-40)")
      .attr("text-anchor", "end")
      .attr("dx", "-0.35em")
      .attr("dy", "0.45em");

    // Title
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
      .attr("transform", `translate(${width - 200}, ${8})`);
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

    // bars group
    const bars = g.append("g").attr("class", "bars");

    // create bars with transition
    bars
      .selectAll("rect.bar")
      .data(dataset, (d) => d.categoryName)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.categoryName))
      .attr("y", innerHeight) // start from bottom
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
        // position tooltip inside container, avoid overflow
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

    // value labels inside bars (if there's space)
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
      .style("fill", (d) => (y(d.totalAmount) < 22 ? "#000" : "#fff")) // if bar is small, draw outside maybe later
      .text((d) => formatNumber(d.totalAmount, { withCurrency: true }))
      .style("pointer-events", "none")
      .attr("opacity", 0)
      .transition()
      .delay(400)
      .duration(300)
      .attr("opacity", 1);

    // accessibility: add x/y axis labels optionally
    svg
      .append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", height - 6)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text("");

    // done
  } // end drawChart

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Analytics Dashboard</h1>

      <div
        ref={containerRef}
        className="card p-6"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <svg
          ref={svgRef}
          style={{ width: "100%", height: "420px", display: "block" }}
        />
        {/* tooltip */}
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
    </div>
  );
}
