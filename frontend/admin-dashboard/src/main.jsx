import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import { AdminAuthProvider } from "./features/auth/context/AdminAuthContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AdminAuthProvider>
      <App />
      <Toaster position="top-right" richColors closeButton />
    </AdminAuthProvider>
  </StrictMode>
);
