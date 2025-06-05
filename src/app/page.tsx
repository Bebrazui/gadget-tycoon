
import { StatCard } from "@/components/shared/StatCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DollarSign, Smartphone, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <SectionTitle
        title="Welcome to Gadget Tycoon!"
        description="Manage your tech empire, design cutting-edge phones, and conquer the market."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Funds" value="$1,000,000" icon={DollarSign} description="+20.1% from last month" />
        <StatCard title="Phones Sold" value="0" icon={Smartphone} description="No phones launched yet" />
        <StatCard title="Brand Reputation" value="Newcomer" icon={Users} description="Build your brand image" />
        <StatCard title="Market Trend" value="AI Cameras" icon={TrendingUp} description="Currently hot" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump right into managing your business.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild variant="outline" size="lg">
              <Link href="/design">Design New Phone</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/brand">Manage Your Brand</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/market">Analyze Market</Link>
            </Button>
            <Button asChild variant="default" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/trends">Forecast Trends (AI)</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Next Big Idea</CardTitle>
             <CardDescription>Start crafting your masterpiece.</CardDescription>
          </CardHeader>
          <CardContent>
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Phone Blueprint" 
              width={600} 
              height={400}
              className="rounded-lg object-cover aspect-video"
              data-ai-hint="phone blueprint"
            />
            <p className="text-sm text-muted-foreground mt-2">Sketch out your vision and bring it to life. The market awaits your innovation!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
