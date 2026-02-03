import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NovelDetail from "./pages/NovelDetail";
import Reader from "./pages/Reader";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Bookmarks from "./pages/Bookmarks";
import SearchPage from "./pages/SearchPage";
import CatalogPage from "./pages/CatalogPage";
import OfficialReleasePage from "./pages/OfficialReleasePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/catalog/:letter" element={<CatalogPage />} />
            <Route path="/official-releases" element={<OfficialReleasePage />} />
            <Route path="/novel/:id" element={<NovelDetail />} />
            <Route path="/read/:id" element={<Reader />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
