import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const API_BASE_URL = "https://comp.naozumi.me"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const text = formData.get('text') as string
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Jyutping Request - Text:', text)

    // Forward to the Jyutping API
    const jyutpingFormData = new FormData()
    jyutpingFormData.append('text', text)

    const jyutpingResponse = await fetch(`${API_BASE_URL}/api/jyutping`, {
      method: 'POST',
      body: jyutpingFormData,
    })

    if (!jyutpingResponse.ok) {
      const errorText = await jyutpingResponse.text()
      console.error('Jyutping API error:', jyutpingResponse.status, errorText)
      throw new Error(`Jyutping API returned ${jyutpingResponse.status}: ${errorText}`)
    }

    const jyutpingResult = await jyutpingResponse.json()
    console.log('Jyutping Result:', jyutpingResult)

    return new Response(
      JSON.stringify({ 
        success: true,
        result: jyutpingResult.result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Jyutping Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process text'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
