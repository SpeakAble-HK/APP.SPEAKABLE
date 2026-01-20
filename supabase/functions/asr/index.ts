import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const API_BASE_URL = "http://comp.naozumi.me"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const language = formData.get('language') as string || 'auto'
    
    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Received audio file:', audioFile.name, 'Size:', audioFile.size, 'Language:', language)

    // Forward to the ASR API
    const asrFormData = new FormData()
    asrFormData.append('file', audioFile)
    asrFormData.append('language', language)

    const asrResponse = await fetch(`${API_BASE_URL}/api/asr`, {
      method: 'POST',
      body: asrFormData,
    })

    if (!asrResponse.ok) {
      const errorText = await asrResponse.text()
      console.error('ASR API error:', asrResponse.status, errorText)
      throw new Error(`ASR API returned ${asrResponse.status}: ${errorText}`)
    }

    const asrResult = await asrResponse.json()
    console.log('ASR Result:', asrResult)

    return new Response(
      JSON.stringify({ 
        success: true,
        result: asrResult.result // Array of [character, jyutping] pairs
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('ASR Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process audio'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
