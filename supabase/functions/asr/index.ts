import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Received audio file:', audioFile.name, 'Size:', audioFile.size)

    // DUMMY RESPONSE - Replace with actual ASR API call
    // In production, this would call an ASR service like Whisper, Google Speech-to-Text, etc.
    const dummyTranscription = "This is a dummy transcription of your speech."
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return new Response(
      JSON.stringify({ 
        success: true,
        transcription: dummyTranscription,
        confidence: 0.95,
        duration_ms: 3200
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('ASR Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process audio' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
