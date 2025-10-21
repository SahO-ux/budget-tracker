import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../AuthContext";
import { Form } from "react-bootstrap";

export default function Login() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const emailRef = useRef(null);
  const pwdRef = useRef(null);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const validate = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim())) {
      setErrMsg("Please enter a valid email address.");
      emailRef.current?.focus();
      return false;
    }
    if (!password?.trim() || password?.trim().length < 6) {
      setErrMsg("Password must be at least 6 characters.");
      pwdRef.current?.focus();
      return false;
    }
    setErrMsg("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrMsg("");
    try {
      const payload = {
        email: email.toLowerCase().trim(),
        password: password.trim(),
      };

      await login(payload);
      navigate("/"); // go to dashboard
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Login failed";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Branding card (simple) */}
        <div className="hidden md:flex flex-col justify-center p-8 rounded-xl bg-white soft-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
              BT
            </div>
            <div>
              <div className="text-xl font-semibold">Budget Tracker</div>
              <div className="text-sm text-gray-500">
                Track income, control spending, and reach your financial goals.
              </div>
            </div>
          </div>

          <ul className="mt-4 text-sm text-gray-600 space-y-2 list-disc ml-5">
            <li>Organize transactions with categories.</li>
            <li>Compare monthly budget vs actual spend.</li>
            <li>Your data stays private to your account.</li>
          </ul>
        </div>

        {/* Right: Login Form */}
        <div className="bg-white p-6 md:p-8 rounded-xl soft-shadow">
          <h2 className="text-2xl font-semibold mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-4">
            Sign in to access your budget dashboard
          </p>

          {errMsg && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded"
            >
              {errMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-4" controlId="email">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="text-sm text-blue-600 hover:underline focus:outline-none"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>

              <div className="flex">
                <input
                  ref={pwdRef}
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Enter password"
                  className="flex-1 rounded-l-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  required
                />
              </div>
            </Form.Group>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          {/* <p className="mt-6 text-sm text-gray-500">
            Demo credentials:{" "}
            <span className="font-medium text-gray-700">test@example.com</span>{" "}
            / <span className="font-medium">password</span>
          </p> */}
        </div>
      </div>
    </div>
  );
}
