import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthContext } from "./AuthContext";
import Login from "./modules/User";
import Dashboard from "./Pages/DashBoard";
import TransactionsPage from "./modules/Transaction";
import Header from "./components/Header";
import CategoriesPage from "./modules/Category";
import AnalyticsPage from "./Pages/AnalyticsPage";

const Protected = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/analytics"
            element={
              <Protected>
                <AnalyticsPage />
              </Protected>
            }
          />
          <Route
            path="/transactions"
            element={
              <Protected>
                <TransactionsPage />
              </Protected>
            }
          />

          <Route
            path="/categories"
            element={
              <Protected>
                <CategoriesPage />
              </Protected>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
