import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const API_BASE_URL = "http://comp.naozumi.me"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/m4a', 'audio/x-m4a']

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const verifyText = formData.get('verify_text') as string
    
    // Input validation
    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!verifyText) {
      return new Response(
        JSON.stringify({ error: 'No verify_text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (audioFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Audio file too large. Maximum size is 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check content type (allow empty/unknown types for browser-recorded audio)
    if (audioFile.type && !ALLOWED_AUDIO_TYPES.includes(audioFile.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid audio format. Supported formats: webm, wav, mp3, ogg, m4a.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('ASRPhone Request - File:', audioFile.name, 'Size:', audioFile.size, 'Verify text:', verifyText.substring(0, 50))

    // Forward to the ASRPhone API
    const asrFormData = new FormData()
    asrFormData.append('file', audioFile)
    asrFormData.append('verify_text', verifyText)

    const asrResponse = await fetch(`${API_BASE_URL}/api/asrphone`, {
      method: 'POST',
      body: asrFormData,
    })

    if (!asrResponse.ok) {
      const errorText = await asrResponse.text()
      console.error('ASRPhone API error:', asrResponse.status, errorText)
      
      let clientMessage = 'Failed to process audio. Please try again.'
      if (asrResponse.status === 413) {
        clientMessage = 'Audio file is too large.'
      } else if (asrResponse.status === 400) {
        clientMessage = 'Invalid audio format or corrupted file.'
      } else if (asrResponse.status === 503) {
        clientMessage = 'Speech recognition service is temporarily unavailable.'
      }
      
      return new Response(
        JSON.stringify({ error: clientMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const asrResult = await asrResponse.json()
    console.log('ASRPhone Result:', JSON.stringify(asrResult).substring(0, 200))

    return new Response(
      JSON.stringify({ 
        success: true,
        predicted: asrResult.predicted,
        verify_check: asrResult.verify_check
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('ASRPhone Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process audio. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
