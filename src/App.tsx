import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "./components/AppShell";
import { ThemeProvider } from "./components/ThemeProvider";
import {
  AboutPage,
  AuthBootstrap,
  FollowedPage,
  StreamsPage,
  WatchingPage,
} from "./pages/BrowsePages";
import {
  ChannelPage,
  GameStreamsPage,
  GamesPage,
  SearchPage,
  TeamPage,
} from "./pages/BrowseExtraPages";
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
        <AuthBootstrap>
          <BrowserRouter>
            <AppShell>
              <Routes>
                <Route path="/" element={<FollowedPage />} />
                <Route path="/streams" element={<StreamsPage />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/games/:gameId" element={<GameStreamsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/channel/:login" element={<ChannelPage />} />
                <Route path="/team/:teamName" element={<TeamPage />} />
                <Route path="/watching" element={<WatchingPage />} />
                <Route path="/settings/*" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </BrowserRouter>
        </AuthBootstrap>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
