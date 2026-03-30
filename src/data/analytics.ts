/** Monthly revenue in KES (cents) for the last 12 months */
export const monthlyRevenue = [
  { month: "Apr", revenue: 124000, orders: 14 },
  { month: "May", revenue: 198000, orders: 22 },
  { month: "Jun", revenue: 176000, orders: 19 },
  { month: "Jul", revenue: 231000, orders: 28 },
  { month: "Aug", revenue: 189000, orders: 21 },
  { month: "Sep", revenue: 268000, orders: 31 },
  { month: "Oct", revenue: 302000, orders: 35 },
  { month: "Nov", revenue: 389000, orders: 44 },
  { month: "Dec", revenue: 512000, orders: 58 },
  { month: "Jan", revenue: 271000, orders: 30 },
  { month: "Feb", revenue: 318000, orders: 37 },
  { month: "Mar", revenue: 406000, orders: 46 },
];

/** Revenue by category */
export const categoryRevenue = [
  { category: "Footwear", revenue: 312000, fill: "hsl(221.2 83.2% 53.3%)" },
  { category: "Tops",     revenue: 198000, fill: "hsl(262.1 83.3% 57.8%)" },
  { category: "Bags",     revenue: 143000, fill: "hsl(316.6 73.1% 52.5%)" },
  { category: "Bottoms",  revenue: 87000,  fill: "hsl(24.6 95% 53.1%)" },
];

/** Weekly visitor and conversion data */
export const weeklyTraffic = [
  { day: "Mon", visitors: 420, conversions: 34 },
  { day: "Tue", visitors: 380, conversions: 28 },
  { day: "Wed", visitors: 510, conversions: 41 },
  { day: "Thu", visitors: 467, conversions: 36 },
  { day: "Fri", visitors: 640, conversions: 58 },
  { day: "Sat", visitors: 720, conversions: 72 },
  { day: "Sun", visitors: 590, conversions: 49 },
];

/** Top 5 products by units sold */
export const topProducts = [
  { name: "Classic Leather Sneaker", units: 48, revenue: 623952 },
  { name: "Merino Wool Crew-Neck",   units: 36, revenue: 323964 },
  { name: "Slim-Fit Chino Trousers", units: 29, revenue: 217471 },
  { name: "Structured Canvas Tote",  units: 24, revenue: 143976 },
];

export const kpiCards = [
  { label: "Total revenue",    value: "KSh 406,000", delta: "+28%",  up: true },
  { label: "Orders this month", value: "46",          delta: "+24%",  up: true },
  { label: "Avg. order value",  value: "KSh 8,826",  delta: "+3%",   up: true },
  { label: "Return rate",       value: "2.1%",        delta: "-0.4%", up: true },
];
