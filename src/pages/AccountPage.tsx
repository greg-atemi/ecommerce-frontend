import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Package, Settings, TrendingUp, ChevronRight, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { OrderStatusBadge } from "@/components/ecommerce/OrderStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { mockOrders } from "@/data/orders";
import { formatPrice } from "@/data/products";

// ─── Profile form schema ──────────────────────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

// ─── Stats derived from orders ─────────────────────────────────────────────
function useAccountStats() {
  const totalSpend = mockOrders.reduce((s, o) => s + o.total, 0);
  const deliveredCount = mockOrders.filter((o) => o.status === "delivered").length;
  const activeCount = mockOrders.filter(
    (o) => o.status === "processing" || o.status === "shipped"
  ).length;
  return { totalSpend, deliveredCount, activeCount, orderCount: mockOrders.length };
}

export function AccountPage() {
  const { user, logout } = useAuth();
  const stats = useAccountStats();
  const [savedProfile, setSavedProfile] = useState(false);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newArrivals: true,
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: "",
    },
  });

  function onProfileSubmit(_data: ProfileForm) {
    // In production: PATCH /api/me
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 3000);
  }

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const recentOrders = mockOrders.slice(0, 3);

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">Welcome back, {user?.name.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: "Total orders", value: stats.orderCount },
          { label: "Delivered", value: stats.deliveredCount },
          { label: "Active", value: stats.activeCount },
          { label: "Total spent", value: formatPrice(stats.totalSpend) },
        ].map(({ label, value }) => (
          <Card key={label} className="text-center">
            <CardContent className="pt-5 pb-4">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-1.5">
            <TrendingUp className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5">
            <Package className="h-4 w-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent orders</CardTitle>
              <CardDescription>Your last {recentOrders.length} orders at a glance</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 2).map(({ product }) => (
                        <img
                          key={product.id}
                          src={product.images[0]}
                          alt={product.name}
                          className="h-9 w-9 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <Link to={`/account/orders/${order.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Address card */}
          {user?.addresses[0] && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Default shipping address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">{user.name}</p>
                <p>{user.addresses[0].line1}</p>
                <p>
                  {user.addresses[0].city}, {user.addresses[0].state}
                </p>
                <p>{user.addresses[0].country}</p>
                <Button variant="link" className="h-auto p-0 text-xs mt-1">
                  Edit address
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Orders ── */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {mockOrders.length} orders
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/account/orders">View all orders</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {mockOrders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map(({ product }) => (
                      <img
                        key={product.id}
                        src={product.images[0]}
                        alt=""
                        className="h-10 w-10 rounded-md border-2 border-background object-cover"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-KE", {
                        day: "numeric", month: "short", year: "numeric",
                      }).format(new Date(order.createdAt))}
                      {" · "}
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>

        {/* ── Profile ── */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal information</CardTitle>
              <CardDescription>Update your name, email and phone number.</CardDescription>
            </CardHeader>
            <CardContent>
              {savedProfile && (
                <Alert variant="success" className="mb-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Saved</AlertTitle>
                  <AlertDescription>Your profile has been updated successfully.</AlertDescription>
                </Alert>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number</FormLabel>
                        <FormControl>
                          <Input placeholder="+254 7XX XXX XXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator />
                  <Button type="submit">Save changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Settings ── */}
        <TabsContent value="settings" className="space-y-4">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>Choose what emails you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  {
                    key: "orderUpdates" as const,
                    label: "Order updates",
                    description: "Shipping confirmations, delivery notifications.",
                  },
                  {
                    key: "promotions" as const,
                    label: "Promotions & offers",
                    description: "Sale alerts, discount codes, and special offers.",
                  },
                  {
                    key: "newArrivals" as const,
                    label: "New arrivals",
                    description: "Be the first to know about new products.",
                  },
                ] as const
              ).map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor={key} className="cursor-pointer">
                      {label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    id={key}
                    checked={notifications[key]}
                    onCheckedChange={(v) =>
                      setNotifications((prev) => ({ ...prev, [key]: v }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
              <CardDescription>
                Irreversible actions — please proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={logout}>
                Sign out of all devices
              </Button>
              <Button variant="destructive" size="sm">
                Delete account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
