import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const API_BASE_URL = "http://comp.naozumi.me"
const MAX_TEXT_LENGTH = 5000

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const text = formData.get('text') as string
    
    // Input validation
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Text too long. Maximum length is ${MAX_TEXT_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Jyutping Request - Text:', text.substring(0, 100))

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
      
      // Return generic error to client
      let clientMessage = 'Failed to process text. Please try again.'
      if (jyutpingResponse.status === 400) {
        clientMessage = 'Invalid text input.'
      } else if (jyutpingResponse.status === 503) {
        clientMessage = 'Jyutping service is temporarily unavailable.'
      }
      
      return new Response(
        JSON.stringify({ error: clientMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const jyutpingResult = await jyutpingResponse.json()
    console.log('Jyutping Result')

    return new Response(
      JSON.stringify({ 
        success: true,
        result: jyutpingResult.result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Jyutping Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process text. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
