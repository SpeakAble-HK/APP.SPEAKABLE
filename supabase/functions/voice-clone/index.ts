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
    const promptAudio = formData.get('prompt_audio') as File
    const text = formData.get('text') as string
    const promptText = formData.get('prompt_text') as string

    if (!promptAudio) {
      return new Response(
        JSON.stringify({ error: 'No prompt audio provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!promptText) {
      return new Response(
        JSON.stringify({ error: 'No prompt text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('TTS Request:')
    console.log('- Text to speak:', text)
    console.log('- Prompt text (ASR result):', promptText)
    console.log('- Prompt audio size:', promptAudio.size)

    // Forward to the TTS API
    const ttsFormData = new FormData()
    ttsFormData.append('text', text)
    ttsFormData.append('prompt_text', promptText)
    ttsFormData.append('prompt_audio', promptAudio)

    const ttsResponse = await fetch(`${API_BASE_URL}/api/tts`, {
      method: 'POST',
      body: ttsFormData,
    })

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text()
      console.error('TTS API error:', ttsResponse.status, errorText)
      throw new Error(`TTS API returned ${ttsResponse.status}: ${errorText}`)
    }

    // Get the audio as ArrayBuffer and convert to base64
    const audioBuffer = await ttsResponse.arrayBuffer()
    const audioBytes = new Uint8Array(audioBuffer)
    
    // Convert to base64
    let binary = ''
    for (let i = 0; i < audioBytes.byteLength; i++) {
      binary += String.fromCharCode(audioBytes[i])
    }
    const audioBase64 = btoa(binary)
    
    const contentType = ttsResponse.headers.get('content-type') || 'audio/wav'
    console.log('TTS audio received, size:', audioBuffer.byteLength, 'type:', contentType)

    return new Response(
      JSON.stringify({ 
        success: true,
        audio_base64: audioBase64,
        content_type: contentType,
        size: audioBuffer.byteLength
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Voice Clone Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate voice clone'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
