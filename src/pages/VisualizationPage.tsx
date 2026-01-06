import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const VisualizationPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6">
            <BarChart3 className="h-10 w-10 text-accent-foreground" />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Visualization
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            View your progress and analyze your learning patterns with beautiful charts and insights.
          </p>
          
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-center gap-4 mb-6">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
              <span className="text-muted-foreground">Your progress overview</span>
            </div>
            
            <div className="h-48 bg-muted rounded-xl flex items-center justify-center">
              <span className="text-muted-foreground">Charts coming soon...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPage;
