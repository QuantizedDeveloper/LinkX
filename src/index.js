import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 🔥 ADD THESE
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

import ScrollToTop from "./ScrollToTop";
import App from "./App";
import "./utils/toast.css";
import "./index.css";

// 🔥 keep your client
const queryClient = new QueryClient();

// 🔥 create persister
const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

// 🔥 enable persistence
persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <ScrollToTop />
      <App />
    </HashRouter>
  </QueryClientProvider>
);
