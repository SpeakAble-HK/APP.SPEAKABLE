import { Link } from "react-router-dom";
import { Mic, BarChart3, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen hero-gradient">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Learning
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Master Your
            <span className="text-primary"> Pronunciation</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Improve your speaking skills with real-time feedback and track your progress with beautiful visualizations.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Pronunciation Card */}
          <Link to="/pronunciation" className="group">
            <div className="bg-card border border-border rounded-2xl p-8 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 hover:border-primary/30">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                <Mic className="h-7 w-7 text-primary" />
              </div>
              
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Pronunciation Correction
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Get instant feedback on your pronunciation with AI-powered speech analysis.
              </p>
              
              <div className="inline-flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                Start practicing
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>

          {/* Visualization Card */}
          <Link to="/visualization" className="group">
            <div className="bg-card border border-border rounded-2xl p-8 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 hover:border-accent/30">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 mb-6 group-hover:bg-accent/20 transition-colors">
                <BarChart3 className="h-7 w-7 text-accent" />
              </div>
              
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Visualization
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Track your learning journey with detailed analytics and progress charts.
              </p>
              
              <div className="inline-flex items-center text-accent font-medium group-hover:gap-3 gap-2 transition-all">
                View progress
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
