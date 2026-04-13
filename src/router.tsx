import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import { HomePage }          from "@/pages/HomePage";
import { ProductsPage }      from "@/pages/ProductsPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { CheckoutPage }      from "@/pages/CheckoutPage";
import { LoginPage }         from "@/pages/LoginPage";
import { RegisterPage }      from "@/pages/RegisterPage";
import { AccountPage }       from "@/pages/AccountPage";
import { AccountAddressesPage }     from "@/pages/AccountAddressesPage";
import { OrdersPage }        from "@/pages/OrdersPage";
import { OrderDetailPage }   from "@/pages/OrderDetailPage";
import { CollectionsPage }   from "@/pages/CollectionsPage";
import { SalePage }          from "@/pages/SalePage";
import { WishlistPage }      from "@/pages/WishlistPage";
import { DashboardPage }     from "@/pages/DashboardPage";
import { NotFoundPage }      from "@/pages/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // Public
      { index: true,              element: <HomePage /> },
      { path: "products",         element: <ProductsPage /> },
      { path: "products/:id",     element: <ProductDetailPage /> },
      { path: "collections",      element: <CollectionsPage /> },
      { path: "sale",             element: <SalePage /> },
      { path: "wishlist",         element: <WishlistPage /> },
      { path: "login",            element: <LoginPage /> },
      { path: "register",         element: <RegisterPage /> },

      // Protected
      { path: "account",          element: <ProtectedRoute><AccountPage /></ProtectedRoute> },
      { path: "account/orders",   element: <ProtectedRoute><OrdersPage /></ProtectedRoute> },
      { path: "account/address",   element: <ProtectedRoute><AccountAddressesPage /></ProtectedRoute> },
      { path: "account/orders/:orderId", element: <ProtectedRoute><OrderDetailPage /></ProtectedRoute> },
      { path: "checkout",         element: <ProtectedRoute><CheckoutPage /></ProtectedRoute> },
      { path: "dashboard",        element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },

      // 404
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
