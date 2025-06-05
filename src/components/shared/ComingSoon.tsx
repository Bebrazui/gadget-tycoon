
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  featureName?: string;
}

export function ComingSoon({ featureName = "This feature" }: ComingSoonProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex flex-col items-center gap-2">
          <Construction className="w-12 h-12 text-primary" />
          Coming Soon!
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">
          {featureName} is currently under development. Check back later for updates!
        </p>
      </CardContent>
    </Card>
  );
}
