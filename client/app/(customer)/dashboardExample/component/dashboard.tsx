"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend,
} from "recharts";
import { addMonths, format, subMonths } from "date-fns";
import { DollarSign, ShoppingBag, Users, Wallet } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/shared/DateRangePicker";

// Sample data for the dashboard
const generateChartData = (
  startDate: Date | undefined,
  endDate: Date | undefined
) => {
  if (!startDate || !endDate) {
    return [];
  }
  const months = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const month = format(currentDate, "MMM");
    const revenue = Math.floor(Math.random() * 10000) + 5000;
    const orders = Math.floor(Math.random() * 200) + 50;
    const customers = Math.floor(Math.random() * 200) + 150;

    months.push({
      name: month,
      revenue,
      orders,
      customers,
    });

    currentDate = addMonths(currentDate, 1);
  }

  return months;
};

const generateOrders = (count: number) => {
  const customers = [
    "Eddy Tan",
    "Zach Galifianakis",
    "Willem Dafoe",
    "Viola Davis",
    "Uzo Aduba",
    "Tina Fey",
    "Scarlett Johansson",
    "Ryan Reynolds",
    "Priyanka Chopra",
    "Oscar Isaac",
  ];

  const orders = [];

  for (let i = 0; i < count; i++) {
    const id = `O-00${count - i}`;
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const items = Math.floor(Math.random() * 6) + 1;
    const total = (Math.floor(Math.random() * 100) + 10).toFixed(2);
    const date = "5/10/2025";

    orders.push({
      id,
      customer,
      items,
      total,
      date,
      status: "New Order",
    });
  }

  return orders;
};

export function Dashboard() {
  // Default date range: current month to 1 year ago
  const today = new Date();
  const defaultFrom = subMonths(today, 11);
  const defaultTo = today;

  const [dateRange, setDateRange] = useState<DateRange>({
    from: defaultFrom,
    to: defaultTo,
  });

  // Generate data based on the selected date range
  const chartData = generateChartData(dateRange.from, dateRange.to);
  const orders = generateOrders(10);

  // Calculate summary metrics
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
  const totalCustomers = chartData.reduce(
    (sum, item) => sum + item.customers,
    0
  );
  const totalProfit = Math.round(totalRevenue * 0.3 * 100) / 100;

  // Format date range for display
  const formattedDateRange = `${format(
    dateRange.from || new Date(),
    "dd MMM, yyyy"
  )} to ${format(dateRange.to || new Date(), "dd MMM, yyyy")}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-white px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold md:text-xl">
              Hi, Kandaliakiki
            </h1>
            <p className="text-sm text-gray-500 md:text-base">
              Here's what happening with your business
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-blue-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                OVERALL REVENUE
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                ${totalRevenue.toLocaleString()}
              </div>
              <div className="rounded-full bg-blue-400/20 p-3">
                <DollarSign className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">ORDERS</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{totalOrders}</div>
              <div className="rounded-full bg-red-400/20 p-3">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">CUSTOMERS</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{totalCustomers}</div>
              <div className="rounded-full bg-yellow-400/20 p-3">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">PROFIT</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                ${totalProfit.toLocaleString()}
              </div>
              <div className="rounded-full bg-green-400/20 p-3">
                <Wallet className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <Tabs defaultValue="6M">
                <TabsList className="grid w-[160px] grid-cols-2">
                  <TabsTrigger value="6M">6M</TabsTrigger>
                  <TabsTrigger value="1Y">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#82ca9d"
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      fill="#3b82f6"
                      name="Revenue"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="customers"
                      stroke="#8884d8"
                      name="Customers"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#ff7300"
                      name="Orders"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">7,585</div>
                  <div className="text-xs text-gray-500">Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">$22.89k</div>
                  <div className="text-xs text-gray-500">Revenue</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">367</div>
                  <div className="text-xs text-gray-500">Customers</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.items} items</TableCell>
                      <TableCell>${order.total}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
