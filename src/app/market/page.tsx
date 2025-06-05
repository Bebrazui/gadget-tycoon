
import { ComingSoon } from "@/components/shared/ComingSoon";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, LineChart as LucideLineChart, TrendingDown, TrendingUp, Users } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend as RechartsLegend, LineChart } from "recharts";

const salesData = [
  { month: "Jan", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Feb", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Mar", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Apr", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "May", sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jun", sales: Math.floor(Math.random() * 5000) + 1000 },
];

const competitorData = [
  { id: 1, name: "Apex Phone X", features: "AI Camera, OLED 120Hz", price: 799, sentiment: "Positive" },
  { id: 2, name: "Nova Smart Z", features: "Foldable, Long Battery", price: 1299, sentiment: "Mixed" },
  { id: 3, name: "BudgetFone 5", features: "Affordable, Decent Specs", price: 299, sentiment: "Neutral" },
  { id: 4, name: "PixelPro Max", features: "Top Tier Processor, Stock Android", price: 999, sentiment: "Very Positive" },
];

const chartConfig = {
  sales: {
    label: "Sales ($)",
    color: "hsl(var(--primary))",
  },
};

export default function MarketAnalysisPage() {
  return (
    <div className="space-y-8">
      <SectionTitle 
        title="Market Analysis"
        description="Understand market dynamics, sales trends, and competitor strategies."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LucideLineChart className="w-5 h-5 mr-2 text-primary" />
              Sales Trends (Simulated)
            </CardTitle>
            <CardDescription>Monthly sales performance overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={salesData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} dot={false} />
                <RechartsLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Users className="w-5 h-5 mr-2 text-primary" />
                        Consumer Sentiment
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span>Feature Demand: AI Photography</span> <TrendingUp className="w-5 h-5 text-green-500"/>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Price Sensitivity: High</span> <TrendingDown className="w-5 h-5 text-red-500"/>
                    </div>
                     <div className="flex justify-between items-center">
                        <span>Brand Loyalty: Moderate</span> <LucideLineChart className="w-5 h-5 text-yellow-500"/>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BarChart className="w-5 h-5 mr-2 text-primary" />
                        Market Segments
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    <p>Budget: 40%</p>
                    <p>Mid-range: 35%</p>
                    <p>Premium: 25%</p>
                </CardContent>
            </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitor Landscape (Simulated)</CardTitle>
          <CardDescription>Key competitors and their market positioning.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Name</TableHead>
                <TableHead>Key Features</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Public Sentiment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitorData.map((competitor) => (
                <TableRow key={competitor.id}>
                  <TableCell className="font-medium">{competitor.name}</TableCell>
                  <TableCell>{competitor.features}</TableCell>
                  <TableCell className="text-right">${competitor.price}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        competitor.sentiment === 'Positive' || competitor.sentiment === 'Very Positive'
                          ? 'bg-green-500/20 text-green-400' 
                          : competitor.sentiment === 'Mixed' ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {competitor.sentiment}
                      </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ComingSoon featureName="Advanced Market Simulation tools" />
    </div>
  );
}
