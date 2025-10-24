import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import ManagerProducts from "./pages/ManagerProducts";
import Delivery from "./pages/Delivery";
import Reports from "./pages/Reports";
import AdminUsers from "./pages/AdminUsers";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/order-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
              <Route 
                path="/manager/products" 
                element={<ProtectedRoute requiredRole="gerente"><ManagerProducts /></ProtectedRoute>} 
              />
              <Route 
                path="/reports" 
                element={<ProtectedRoute requiredRole="gerente"><Reports /></ProtectedRoute>} 
              />
              <Route 
                path="/delivery" 
                element={<ProtectedRoute requiredRole="entregador"><Delivery /></ProtectedRoute>} 
              />
              <Route 
                path="/admin/users" 
                element={<ProtectedRoute requiredRole="administrador"><AdminUsers /></ProtectedRoute>} 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
