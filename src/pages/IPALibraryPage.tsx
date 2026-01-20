import { BookText, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const IPALibraryPage = () => {
  return (
    <div className="hero-gradient min-h-full">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            IPA Library
            <BookText className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">
            International Phonetic Alphabet reference and learning resources.
          </p>
        </div>

        <Card className="card-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Coming Soon</CardTitle>
            </div>
            <CardDescription>
              We're building a comprehensive IPA library for you. Check back soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section will include an interactive IPA chart, audio examples for each phoneme, 
              and learning materials for mastering phonetic transcription.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IPALibraryPage;
