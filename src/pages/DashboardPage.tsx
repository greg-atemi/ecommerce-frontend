import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { orderApi, type OrderResponse } from "@/api/orderApi";
import { paymentApi, type PaymentResponse } from "@/api/paymentApi";
import { formatPrice } from "@/data/products";

// ─── Chart colors ─────────────────────────────────────────────────────────────
const COLORS = [
  "hsl(221.2 83.2% 53.3%)",
  "hsl(316.6 73.1% 52.5%)",
  "hsl(142.1 76.2% 36.3%)",
  "hsl(38 92% 50%)",
  "hsl(0 72.2% 50.6%)",
];

const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "var(--radius)",
    fontSize: "0.75rem",
    color: "hsl(var(--popover-foreground))",
  },
  cursor: { fill: "hsl(var(--muted))" },
};

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, up }: {
  label: string; value: string; sub: string; up?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {sub && (
          <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${
            up === undefined ? "text-muted-foreground" : up ? "text-green-600" : "text-destructive"
          }`}>
            {up !== undefined && (up
              ? <TrendingUp className="h-3 w-3" />
              : <TrendingDown className="h-3 w-3" />
            )}
            {sub}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Pie label ────────────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.08) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function groupByDay(payments: PaymentResponse[]) {
  const map: Record<string, number> = {};
  for (const p of payments) {
    if (!p.paidAt) continue;
    const day = new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short" })
      .format(new Date(p.paidAt));
    map[day] = (map[day] ?? 0) + p.amount;
  }
  return Object.entries(map)
    .map(([date, revenue]) => ({ date, revenue }))
    .slice(-14); // last 14 days
}

function topProducts(orders: OrderResponse[]) {
  const map: Record<string, { name: string; units: number; revenue: number; imageUrl: string }> = {};
  for (const order of orders) {
    for (const item of order.items) {
      const key = String(item.product.id);
      if (!map[key]) {
        map[key] = { name: item.product.name, units: 0, revenue: 0, imageUrl: item.product.imageUrl };
      }
      map[key].units   += item.quantity;
      map[key].revenue += item.subTotal;
    }
  }
  return Object.values(map).sort((a, b) => b.units - a.units).slice(0, 5);
}

function categoryRevenue(orders: OrderResponse[]) {
  const map: Record<string, number> = {};
  for (const order of orders) {
    for (const item of order.items) {
      const cat = (item.product as any).category?.name ?? "Other";
      map[cat] = (map[cat] ?? 0) + item.subTotal;
    }
  }
  return Object.entries(map).map(([category, revenue], i) => ({
    category, revenue, fill: COLORS[i % COLORS.length],
  }));
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const [orders, setOrders]     = useState<OrderResponse[]>([]);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      orderApi.getAll(),
      paymentApi.getAll(),
    ])
      .then(([ordersRes, paymentsRes]) => {
        setOrders(ordersRes.data);
        setPayments(paymentsRes.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalRevenue   = payments.reduce((s, p) => s + p.amount, 0);
  const totalOrders    = orders.length;
  const paidOrders     = orders.filter((o) => o.paymentStatus === "PAID").length;
  const pendingOrders  = orders.filter((o) => o.paymentStatus === "PENDING").length;
  const revenueByDay   = groupByDay(payments);
  const topProds       = topProducts(orders);
  const catRevenue     = categoryRevenue(orders);
  const recentOrders   = [...orders].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  if (isLoading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {new Intl.DateTimeFormat("en-KE", { month: "long", year: "numeric" }).format(new Date())}
            {" · "}All figures in KES
          </p>
        </div>
        <Badge variant="secondary">Live data</Badge>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total revenue"   value={formatPrice(totalRevenue)} sub={`${paidOrders} paid orders`} up={true} />
        <KpiCard label="Total orders"    value={String(totalOrders)}       sub="All time" />
        <KpiCard label="Paid orders"     value={String(paidOrders)}        sub={`${Math.round((paidOrders / (totalOrders || 1)) * 100)}% conversion`} up={true} />
        <KpiCard label="Pending payment" value={String(pendingOrders)}     sub="Awaiting payment" up={false} />
      </div>

      {/* Chart tabs */}
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="categories">By category</TabsTrigger>
        </TabsList>

        {/* ── Revenue area chart ── */}
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily revenue</CardTitle>
              <CardDescription>Based on confirmed M-Pesa payments</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueByDay.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No payment data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueByDay} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(v: unknown) => [formatPrice(v as number), "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(221.2 83.2% 53.3%)"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Category charts ── */}
        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue by category</CardTitle>
                <CardDescription>Share of total sales</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {catRevenue.length === 0 ? (
                  <p className="py-10 text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={catRevenue}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        labelLine={false}
                        label={PieLabel}
                      >
                        {catRevenue.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        {...tooltipStyle}
                        formatter={(v: unknown) => [formatPrice(v as number), "Revenue"]}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue by category</CardTitle>
                <CardDescription>Absolute values</CardDescription>
              </CardHeader>
              <CardContent>
                {catRevenue.length === 0 ? (
                  <p className="py-10 text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={catRevenue} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                      />
                      <Tooltip
                        {...tooltipStyle}
                        formatter={(v: unknown) => [formatPrice(v as number), "Revenue"]}
                      />
                      <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                        {catRevenue.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Top products + recent orders */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top products</CardTitle>
            <CardDescription>Ranked by units sold</CardDescription>
          </CardHeader>
          <CardContent>
            {topProds.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProds.map((row, idx) => (
                    <TableRow key={row.name}>
                      <TableCell className="text-muted-foreground font-medium w-8">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={row.imageUrl}
                            alt={row.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                          <span className="font-medium text-sm">{row.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{row.units}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPrice(row.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent orders</CardTitle>
            <CardDescription>Latest {recentOrders.length} orders</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {order.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={order.paymentStatus === "PAID" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPrice(order.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}