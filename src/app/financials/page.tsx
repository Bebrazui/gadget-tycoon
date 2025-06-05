
import { ComingSoon } from "@/components/shared/ComingSoon";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, TrendingUp, TrendingDown, AlertCircle, CreditCard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const financialSummary = {
  revenue: 125000,
  costs: 75000,
  profit: 50000,
  marketingSpend: 15000,
  rdSpend: 20000,
};

const transactions = [
  { id: "txn_1", date: "2024-07-15", description: "Component Purchase - OLED Screens", amount: -12000, type: "expense" },
  { id: "txn_2", date: "2024-07-16", description: "Initial Sales - Model X", amount: 35000, type: "income" },
  { id: "txn_3", date: "2024-07-18", description: "Marketing Campaign - Social Media", amount: -5000, type: "expense" },
  { id: "txn_4", date: "2024-07-20", description: "Software Licensing", amount: -2500, type: "expense" },
  { id: "txn_5", date: "2024-07-22", description: "Sales - Model X accesorios", amount: 3000, type: "income" },
];

export default function FinancialsPage() {
  return (
    <div className="space-y-8">
      <SectionTitle
        title="Financial Overview"
        description="Track your company's financial health, manage expenses, and analyze profitability."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.costs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5% from last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Banknote className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.profit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Profit Margin: {(financialSummary.profit/financialSummary.revenue * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-primary" />
            Recent Transactions (Simulated)
            </CardTitle>
          <CardDescription>A log of your recent income and expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>{txn.date}</TableCell>
                  <TableCell className="font-medium">{txn.description}</TableCell>
                  <TableCell className={`text-right font-semibold ${txn.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {txn.type === 'income' ? '+' : '-'}${Math.abs(txn.amount).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ComingSoon featureName="Detailed Financial Reports and Budgeting Tools" />
    </div>
  );
}
