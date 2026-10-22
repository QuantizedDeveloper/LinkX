import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import ScrollToTop from "./ScrollToTop";
import App from "./App";
import "./utils/toast.css";
import "./index.css";
import ActivityTracker from "./ActivityTracker"
const queryClient = new QueryClient();
const persister = createSyncStoragePersister({
  storage: window.localStorage,
});
persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <ActivityTracker />
      <ScrollToTop />
      <App />
    </HashRouter>
  </QueryClientProvider>
);
