import { Switch, Route } from "wouter";
import { MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Portfolio from "@/pages/portfolio";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="cm-theme">
      <MotionConfig reducedMotion="user">
        <Toaster />
        <Switch>
          <Route path="/" component={Portfolio} />
          <Route component={NotFound} />
        </Switch>
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
