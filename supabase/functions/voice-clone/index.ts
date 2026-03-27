import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const API_BASE_URL = "http://comp.naozumi.me"
const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_TEXT_LENGTH = 5000
const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/m4a', 'audio/x-m4a']

function sanitizeText(text: string): string {
  return text.replace(/[<>"'\\]/g, '').trim()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data, error: authError } = await supabaseClient.auth.getClaims(token)
    if (authError || !data?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData()
    const promptAudio = formData.get('prompt_audio') as File
    const rawText = formData.get('text') as string
    const rawPromptText = formData.get('prompt_text') as string

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

    if (promptAudio.type && !ALLOWED_AUDIO_TYPES.includes(promptAudio.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid audio format. Supported formats: webm, wav, mp3, ogg, m4a.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const text = sanitizeText(rawText)
    if (text.length > MAX_TEXT_LENGTH || text.length === 0) {
      return new Response(
        JSON.stringify({ error: `Text must be between 1 and ${MAX_TEXT_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!rawPromptText) {
      return new Response(
        JSON.stringify({ error: 'No prompt text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const promptText = sanitizeText(rawPromptText)
    if (promptText.length > MAX_TEXT_LENGTH || promptText.length === 0) {
      return new Response(
        JSON.stringify({ error: `Prompt text must be between 1 and ${MAX_TEXT_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('TTS Request - Text length:', text.length, 'Audio size:', promptAudio.size, 'User:', data.claims.sub)

    const ttsFormData = new FormData()
    ttsFormData.append('text', text)
    ttsFormData.append('prompt_text', promptText)
    ttsFormData.append('prompt_audio', promptAudio)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120000)

    let ttsResponse: Response
    try {
      ttsResponse = await fetch(`${API_BASE_URL}/api/tts`, {
        method: 'POST',
        body: ttsFormData,
        signal: controller.signal,
      })
    } catch (e) {
      clearTimeout(timeout)
      if (e instanceof DOMException && e.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Request timed out. Please try again.' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw e
    }
    clearTimeout(timeout)

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text()
      console.error('TTS API error:', ttsResponse.status, errorText)
      
      let clientMessage = 'Failed to generate voice. Please try again.'
      if (ttsResponse.status === 413) clientMessage = 'Audio file is too large.'
      else if (ttsResponse.status === 400) clientMessage = 'Invalid input. Please check your audio and text.'
      else if (ttsResponse.status === 503) clientMessage = 'Voice synthesis service is temporarily unavailable.'
      
      return new Response(
        JSON.stringify({ error: clientMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const audioBuffer = await ttsResponse.arrayBuffer()
    const audioBytes = new Uint8Array(audioBuffer)
    
    let binary = ''
    for (let i = 0; i < audioBytes.byteLength; i++) {
      binary += String.fromCharCode(audioBytes[i])
    }
    const audioBase64 = btoa(binary)
    
    const contentType = ttsResponse.headers.get('content-type') || 'audio/wav'
    console.log('TTS audio received, size:', audioBuffer.byteLength, 'type:', contentType)

    return new Response(
      JSON.stringify({ success: true, audio_base64: audioBase64, content_type: contentType, size: audioBuffer.byteLength }),
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
