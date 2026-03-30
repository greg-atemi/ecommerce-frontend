import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  monthlyRevenue, categoryRevenue, weeklyTraffic, topProducts, kpiCards,
} from "@/data/analytics";
import { formatPrice } from "@/data/products";

// ─── Shared tooltip style ─────────────────────────────────────────────────────
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
function KpiCard({
  label,
  value,
  delta,
  up,
}: {
  label: string;
  value: string;
  delta: string;
  up: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        <div
          className={`mt-1 flex items-center gap-1 text-xs font-medium ${
            up ? "text-green-600" : "text-destructive"
          }`}
        >
          {up ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {delta} vs last month
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Custom Pie label ─────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
function PieLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number;
  percent: number; name: string;
}) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.08) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────
export function DashboardPage() {
  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales dashboard</h1>
          <p className="text-sm text-muted-foreground">March 2026 · All figures in KES</p>
        </div>
        <Badge variant="secondary">Demo data</Badge>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Chart tabs */}
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="categories">By category</TabsTrigger>
        </TabsList>

        {/* ── Revenue area chart ── */}
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly revenue & orders</CardTitle>
              <CardDescription>Apr 2025 – Mar 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v: unknown) => [formatPrice((v as number) * 100), "Revenue"]}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Traffic line chart ── */}
        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly visitors & conversions</CardTitle>
              <CardDescription>Current week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyTraffic} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="hsl(221.2 83.2% 53.3%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    stroke="hsl(316.6 73.1% 52.5%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Category pie + bar ── */}
        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue by category</CardTitle>
                <CardDescription>Share of total sales</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryRevenue}
                      dataKey="revenue"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      labelLine={false}
                      label={PieLabel as never}
                    >
                      {categoryRevenue.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(v: unknown) => [formatPrice((v as number) * 100), "Revenue"]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12 }}
                      formatter={(value) => value}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue by category</CardTitle>
                <CardDescription>Absolute values</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={categoryRevenue}
                    margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
                  >
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
                      formatter={(v: unknown) => [formatPrice((v as number) * 100), "Revenue"]}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {categoryRevenue.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Top products table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top products this month</CardTitle>
          <CardDescription>Ranked by units sold</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Units sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((row, idx) => (
                <TableRow key={row.name}>
                  <TableCell className="text-muted-foreground font-medium w-8">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.units}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(row.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
