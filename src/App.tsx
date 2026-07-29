import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "./components/AppShell";
import { ThemeProvider } from "./components/ThemeProvider";
import {
  AboutPage,
  FollowedPage,
  GamesPage,
  SearchPage,
  StreamsPage,
  WatchingPage,
} from "./pages/BrowsePages";
import { SettingsPage } from "./pages/SettingsPage";
import "./styles/global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<FollowedPage />} />
              <Route path="/streams" element={<StreamsPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/watching" element={<WatchingPage />} />
              <Route path="/settings/*" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
