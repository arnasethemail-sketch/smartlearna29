import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import {
  AccountControl,
  LearningProgressProvider,
} from "./features/progress";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LearningProgressProvider>
      <AccountControl />
      <App />
    </LearningProgressProvider>
  </StrictMode>,
);
