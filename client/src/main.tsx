import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import Layout from "./components/Layout.tsx";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={2000} />
        <Layout>
          <App />
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
