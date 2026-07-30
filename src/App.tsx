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
import { SettingsPage, SettingsBootstrap } from "./pages/SettingsPage";
import { TauriGuardBanner } from "./components/TauriGuardBanner";
import { DesktopChrome } from "./components/DesktopChrome";
import { HotkeyProvider } from "./components/HotkeyProvider";
import { DeepLinkBootstrap } from "./components/DeepLinkAndUpdaterBootstrap";
import { StreamingBootstrap } from "./components/StreamingBootstrap";
import { OnboardingWizard } from "./components/OnboardingWizard";
import { LaunchErrorBanner } from "./components/LaunchErrorBanner";
import { SentryBootstrap } from "./lib/sentry";
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
        <SettingsBootstrap>
          <SentryBootstrap>
            <AuthBootstrap>
              <BrowserRouter>
                <HotkeyProvider>
                  <DeepLinkBootstrap>
                    <StreamingBootstrap>
                      <OnboardingWizard />
                      <AppShell>
                        <DesktopChrome />
                        <TauriGuardBanner />
                        <LaunchErrorBanner />
                        <Routes>
                          <Route path="/" element={<FollowedPage />} />
                          <Route path="/streams" element={<StreamsPage />} />
                          <Route path="/games" element={<GamesPage />} />
                          <Route
                            path="/games/:gameId"
                            element={<GameStreamsPage />}
                          />
                          <Route path="/search" element={<SearchPage />} />
                          <Route
                            path="/channel/:login"
                            element={<ChannelPage />}
                          />
                          <Route path="/team/:teamName" element={<TeamPage />} />
                          <Route path="/watching" element={<WatchingPage />} />
                          <Route path="/settings/*" element={<SettingsPage />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </AppShell>
                    </StreamingBootstrap>
                  </DeepLinkBootstrap>
                </HotkeyProvider>
              </BrowserRouter>
            </AuthBootstrap>
          </SentryBootstrap>
        </SettingsBootstrap>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
