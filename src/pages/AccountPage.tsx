import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Package, Settings, TrendingUp, ChevronRight, CheckCircle2,
  MapPin, Plus, Loader2,
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { OrderStatusBadge } from "@/components/ecommerce/OrderStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { orderApi, type OrderResponse } from "@/api/orderApi";
import { addressApi, type AddressResponse } from "@/api/addressApi";
import { formatPrice } from "@/data/products";

const KE_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Thika", "Nyeri", "Machakos", "Kisii", "Kakamega",
];

const COUNTRIES = [
  "Kenya", "Uganda", "Tanzania", "Rwanda", "Burundi",
  "South Sudan", "Somalia", "Ethiopia", "Djibouti", "Sudan",
];

// ─── Profile form ─────────────────────────────────────────────────────────────
const profileSchema = z.object({
  name:  z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

// ─── Address form ─────────────────────────────────────────────────────────────
const addressSchema = z.object({
  localityArea: z.string().min(2, "Locality is required"),
  county:       z.string().min(1, "County is required"),
  country:      z.string().default("Kenya"),
  mapsPin:      z.string().optional(),
});
type AddressForm = z.infer<typeof addressSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(iso));
}

export function AccountPage() {
  const { user, logout } = useAuth();

  // ── Orders state ──────────────────────────────────────────────────────────
  const [orders, setOrders]           = useState<OrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // ── Addresses state ───────────────────────────────────────────────────────
  const [addresses, setAddresses]         = useState<AddressResponse[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [addressError, setAddressError]   = useState<string | null>(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [savedProfile, setSavedProfile] = useState(false);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions:   false,
    newArrivals:  true,
  });

  // ── Fetch orders ──────────────────────────────────────────────────────────
  useEffect(() => {
    orderApi.getMyOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, []);

  // ── Fetch addresses ───────────────────────────────────────────────────────
  useEffect(() => {
    addressApi.getMyAddresses()
      .then(({ data }) => setAddresses(data))
      .catch(() => setAddresses([]))
      .finally(() => setAddressesLoading(false));
  }, []);

  // ── Stats derived from live orders ────────────────────────────────────────
  const stats = {
    orderCount:     orders.length,
    deliveredCount: orders.filter((o) => o.orderStatus === "DELIVERED").length,
    activeCount:    orders.filter((o) =>
      o.orderStatus === "PROCESSING" || o.orderStatus === "SHIPPED"
    ).length,
    totalSpend:     orders.reduce((s, o) => s + o.totalAmount, 0),
  };

  // ── Profile form ──────────────────────────────────────────────────────────
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:  user?.name  ?? "",
      email: user?.email ?? "",
      phone: "",
    },
  });

  function onProfileSubmit(_data: ProfileForm) {
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 3000);
  }

  // ── Address form ──────────────────────────────────────────────────────────
  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { localityArea: "", county: "", country: "Kenya", mapsPin: "" },
  });

  async function onAddAddress(data: AddressForm) {
    setAddressError(null);
    try {
      const { data: created } = await addressApi.createAndAssign(data);
      setAddresses((prev) => [...prev, created]);
      setShowAddressDialog(false);
      addressForm.reset();
    } catch (err: any) {
      setAddressError(err.response?.data?.message ?? "Failed to save address.");
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const recentOrders = orders.slice(0, 3);

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
            <h1 className="text-xl font-bold">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
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
          { label: "Total orders",  value: ordersLoading ? "—" : stats.orderCount },
          { label: "Delivered",     value: ordersLoading ? "—" : stats.deliveredCount },
          { label: "Active",        value: ordersLoading ? "—" : stats.activeCount },
          { label: "Total spent",   value: ordersLoading ? "—" : formatPrice(stats.totalSpend) },
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
          <TabsTrigger value="addresses" className="gap-1.5">
            <MapPin className="h-4 w-4" /> Addresses
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
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : recentOrders.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 2).map((item) => (
                          <img
                            key={item.id}
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="h-9 w-9 rounded-full border-2 border-background object-cover"
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Order #{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.orderStatus} />
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link to={`/account/orders/${order.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* First address preview */}
          {!addressesLoading && addresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Default shipping address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">{user?.name}</p>
                <p>{addresses[0].localityArea}</p>
                <p>{addresses[0].county}, {addresses[0].country}</p>
                {addresses[0].mapsPin && (
                  <a
                    href={addresses[0].mapsPin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs"
                  >
                    View on Maps
                  </a>
                )}
                <Button variant="link" className="h-auto p-0 text-xs mt-1" asChild>
                  <Link to="/account/address">Manage addresses</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Orders ── */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {ordersLoading ? "Loading…" : `Showing ${orders.length} orders`}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/account/orders">View all orders</Link>
            </Button>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No orders yet.</p>
              <Button size="sm" className="mt-4" asChild>
                <Link to="/products">Start shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/account/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item) => (
                        <img
                          key={item.id}
                          src={item.product.imageUrl}
                          alt=""
                          className="h-10 w-10 rounded-md border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt ? formatDate(order.createdAt) : "—"}
                        {" · "}
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.orderStatus} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Addresses ── */}
        <TabsContent value="addresses" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {addressesLoading ? "Loading…" : `${addresses.length} saved address${addresses.length !== 1 ? "es" : ""}`}
            </p>
            <Button size="sm" className="gap-1.5" onClick={() => setShowAddressDialog(true)}>
              <Plus className="h-4 w-4" /> Add address
            </Button>
          </div>

          {addressesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center space-y-3">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No saved addresses.</p>
              <Button size="sm" className="gap-1.5" onClick={() => setShowAddressDialog(true)}>
                <Plus className="h-4 w-4" /> Add your first address
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <Card key={addr.id}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{addr.localityArea}</p>
                      <p className="text-sm text-muted-foreground">
                        {addr.cityTown && `${addr.cityTown}, `}{addr.county}, {addr.country}
                      </p>
                      {addr.mapsPin && (
                        <a
                          href={addr.mapsPin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-0.5 block"
                        >
                          View on Maps
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>Choose what emails you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  { key: "orderUpdates" as const, label: "Order updates",       description: "Shipping confirmations, delivery notifications." },
                  { key: "promotions"   as const, label: "Promotions & offers", description: "Sale alerts, discount codes, and special offers." },
                  { key: "newArrivals"  as const, label: "New arrivals",        description: "Be the first to know about new products." },
                ] as const
              ).map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor={key} className="cursor-pointer">{label}</Label>
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

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
              <CardDescription>Irreversible actions — please proceed with caution.</CardDescription>
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

      {/* ── Add Address Dialog ── */}
      <Dialog
        open={showAddressDialog}
        onOpenChange={(open) => {
          setShowAddressDialog(open);
          if (!open) { addressForm.reset(); setAddressError(null); }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add delivery address</DialogTitle>
          </DialogHeader>

          {addressError && (
            <Alert variant="destructive">
              <AlertDescription>{addressError}</AlertDescription>
            </Alert>
          )}

          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(onAddAddress)} className="space-y-4">
              <FormField
                control={addressForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>County</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KE_COUNTIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="localityArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locality / Area</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Westlands, Karen, Kilimani" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="mapsPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Google Maps link{" "}
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://maps.app.goo.gl/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowAddressDialog(false); addressForm.reset(); }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addressForm.formState.isSubmitting}>
                  {addressForm.formState.isSubmitting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                    : "Save address"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}