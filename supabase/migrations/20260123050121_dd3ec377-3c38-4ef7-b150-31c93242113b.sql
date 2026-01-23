-- Create a table for pronunciation results history
CREATE TABLE public.pronunciation_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intended_text TEXT NOT NULL,
  spoken_phonemes JSONB NOT NULL,
  intended_phonemes JSONB NOT NULL,
  overall_accuracy INTEGER NOT NULL DEFAULT 0,
  initial_accuracy INTEGER NOT NULL DEFAULT 0,
  final_accuracy INTEGER NOT NULL DEFAULT 0,
  tone_accuracy INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pronunciation_results ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own results" 
ON public.pronunciation_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own results" 
ON public.pronunciation_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own results" 
ON public.pronunciation_results 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster user queries
CREATE INDEX idx_pronunciation_results_user_id ON public.pronunciation_results(user_id);
CREATE INDEX idx_pronunciation_results_created_at ON public.pronunciation_results(created_at DESC);