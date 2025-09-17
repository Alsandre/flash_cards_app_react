import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {ReduxProvider} from "./store/Provider";
import {AuthProvider} from "./auth/AuthProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReduxProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ReduxProvider>
  </StrictMode>
);
