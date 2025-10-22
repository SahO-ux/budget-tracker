import { useContext } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../AuthContext";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed top-0 left-0 w-full bg-white border-b border-gray-100 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* ---------- Left Section (Logo + Title) ---------- */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-md bg-blue-600 text-white font-semibold flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              BT
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold group-hover:text-blue-600 transition-colors">
                Budget Tracker
              </div>
              <div className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                Personal finance dashboard
              </div>
            </div>
          </div>

          {/* ---------- Right Section (User Info + Logout) ---------- */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex md:flex-col md:items-end">
                  <div className="text-sm text-gray-600 font-medium">
                    {user.name || user.email}
                  </div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>

                <Motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={logout}
                  className="px-3 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 text-sm hover:bg-red-100 transition-colors"
                >
                  Logout
                </Motion.button>
              </>
            ) : (
              <div className="text-sm text-gray-500">Not signed in</div>
            )}
          </div>
        </div>
      </div>
    </Motion.header>
  );
}
