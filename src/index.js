import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ScrollToTop from "./ScrollToTop";
import App from "./App";
import "./utils/toast.css";
import "./index.css"

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(
<QueryClientProvider client={queryClient}>
  <HashRouter>
    <ScrollToTop />
    <App />
  </HashRouter>
</QueryClientProvider>
)

