import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Generator from "./pages/Generator";
import History from "./pages/History";
import ImageGenerator from "./pages/ImageGenerator";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import WebsiteAnalyser from "./pages/WebsiteAnalyser";
import WebsiteCopyGenerator from "./pages/WebsiteCopyGenerator";
import CompetitorAnalyser from "./pages/CompetitorAnalyser";
import ViralPostGenerator from "./pages/ViralPostGenerator";
import { useAuth } from "./_core/hooks/useAuth";
import { trpc } from "./lib/trpc";
import { useEffect } from "react";

// Guard: redirect first-time users to onboarding
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [location, navigate] = useLocation();
  const { data: userProfile } = trpc.user.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (
      !loading &&
      isAuthenticated &&
      userProfile &&
      !userProfile.onboardingComplete &&
      location !== "/onboarding"
    ) {
      navigate("/onboarding");
    }
  }, [loading, isAuthenticated, userProfile, location, navigate]);

  return <>{children}</>;
}

function Router() {
  return (
    <OnboardingGuard>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/onboarding"} component={Onboarding} />
        <Route path={"/generate"} component={Generator} />
        <Route path={"/history"} component={History} />
        <Route path={"/images"} component={ImageGenerator} />
        <Route path={"/website-analyser"} component={WebsiteAnalyser} />
        <Route path={"/website-copy-generator"} component={WebsiteCopyGenerator} />
        <Route path={"/competitor-analyser"} component={CompetitorAnalyser} />
        <Route path={"/viral-post-generator"} component={ViralPostGenerator} />
        <Route path={"/settings"} component={Settings} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </OnboardingGuard>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "oklch(0.13 0.008 240)",
                border: "1px solid oklch(0.2 0.01 240)",
                color: "oklch(0.95 0.005 240)",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
