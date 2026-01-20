import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const API_BASE_URL = "http://comp.naozumi.me"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TEXT_LENGTH = 5000
const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/m4a', 'audio/x-m4a']

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const promptAudio = formData.get('prompt_audio') as File
    const text = formData.get('text') as string
    const promptText = formData.get('prompt_text') as string

    // Input validation
    if (!promptAudio) {
      return new Response(
        JSON.stringify({ error: 'No prompt audio provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (promptAudio.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Audio file too large. Maximum size is 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check content type (allow empty/unknown types for browser-recorded audio)
    if (promptAudio.type && !ALLOWED_AUDIO_TYPES.includes(promptAudio.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid audio format. Supported formats: webm, wav, mp3, ogg, m4a.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    if (!promptText) {
      return new Response(
        JSON.stringify({ error: 'No prompt text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (promptText.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Prompt text too long. Maximum length is ${MAX_TEXT_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('TTS Request:')
    console.log('- Text to speak:', text.substring(0, 100))
    console.log('- Prompt text (ASR result):', promptText.substring(0, 100))
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
      
      // Return generic error to client
      let clientMessage = 'Failed to generate voice. Please try again.'
      if (ttsResponse.status === 413) {
        clientMessage = 'Audio file is too large.'
      } else if (ttsResponse.status === 400) {
        clientMessage = 'Invalid input. Please check your audio and text.'
      } else if (ttsResponse.status === 503) {
        clientMessage = 'Voice synthesis service is temporarily unavailable.'
      }
      
      return new Response(
        JSON.stringify({ error: clientMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
    return new Response(
      JSON.stringify({ error: 'Failed to generate voice. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
