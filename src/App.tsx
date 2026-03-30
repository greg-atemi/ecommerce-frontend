import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AppRouter } from "@/router";
import { Toaster } from "@/components/ui/toaster";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppRouter />
          <Toaster />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
