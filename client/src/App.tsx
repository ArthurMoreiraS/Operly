import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Schedule from "@/pages/Schedule";
import Customers from "@/pages/Customers";
import Services from "@/pages/Services";
import Finance from "@/pages/Finance";
import Settings from "@/pages/Settings";
import PublicBooking from "@/pages/PublicBooking";
import { Layout } from "@/components/layout/Layout";

function Router() {
  return (
    <Switch>
      <Route path="/agendar" component={PublicBooking} />
      <Route path="/agendar/:slug" component={PublicBooking} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/schedule" component={Schedule} />
            <Route path="/customers" component={Customers} />
            <Route path="/services" component={Services} />
            <Route path="/finance" component={Finance} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
