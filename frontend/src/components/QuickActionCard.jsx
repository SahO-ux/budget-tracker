import React from "react";
import { motion as Motion } from "framer-motion";

/**
 * Simple clickable card used across Dashboard.
 * props:
 *  - title, subtitle, onClick, icon (optional), className
 */
export default function QuickActionCard({
  title,
  subtitle,
  onClick,
  icon,
  className = "",
}) {
  return (
    <Motion.button
      onClick={onClick}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.995 }}
      className={`card p-4 text-left w-full text-left ${className}`}
      style={{ cursor: "pointer", borderRadius: 12 }}
    >
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="w-10 h-10 rounded bg-primary-50 flex items-center justify-center text-primary-600">
            {icon}
          </div>
        ) : null}
        <div className="flex-1">
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-1 font-semibold">{subtitle}</div>
        </div>
      </div>
    </Motion.button>
  );
}
