import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";

import { AuthProvider } from "./AuthContext";
import store from "./store";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <>
    {/* <StrictMode> */}
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
    {/* </StrictMode> */}
  </>
);
