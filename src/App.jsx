import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { RequestProvider } from "./context/RequestContext";
import { ToastProvider } from "./context/ToastContext";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RequestProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </RequestProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
