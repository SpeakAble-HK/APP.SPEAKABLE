import { BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PracticePage = () => {
  return (
    <div className="hero-gradient min-h-full">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            Practice
            <BookOpen className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Interactive exercises to improve your pronunciation skills.
          </p>
        </div>

        <Card className="card-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Coming Soon</CardTitle>
            </div>
            <CardDescription>
              We're building interactive practice modules for you. Check back soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section will include guided pronunciation exercises, tongue twisters, 
              and real-world conversation practice scenarios.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PracticePage;
