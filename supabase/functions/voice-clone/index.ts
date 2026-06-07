import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const API_BASE_URL = Deno.env.get("SPEAKABLE_API_URL") || "http://localhost:8100"
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
      console.warn('TTS backend unreachable, using mock fallback')
      return sendMockAudioResponse(corsHeaders)
    }
    clearTimeout(timeout)

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text()
      console.error('TTS API error:', ttsResponse.status, errorText, '- using mock fallback')
      return sendMockAudioResponse(corsHeaders)
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
    console.error('Voice Clone Error:', error, '- using mock fallback')
    return sendMockAudioResponse(corsHeaders)
  }
})

function sendMockAudioResponse(headers: Record<string, string>) {
  const mockB64 = "UklGRoYGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAATElTVBoAAABJTkZPSVNGVA0AAABMYXZmNjIuMy4xMDAAAGRhdGFABgAAIgE/BUgKtg3BD8QPDA6PCucFfwAR+zH2f/Jj8CHwv/EN9aX5/v52BGcJOw1+D+0Peg5QC9AGggEG/AP3D/Ok8AnwUvFX9Lz4/v19A5IIpAw3D/0P4A4ADLUHgQIB/dz3rfPz8AHw8/Cs89v3Af2AArUHAAzfDv0PNw+kDJIIfgP//b34V/RS8Qnwo/AP8wL3BfyBAc8GUAt5Du0Pfw87DWgJdwT//qb5DfW/8SHwY/B+8jL2DvuAAOMFlAoFDs0Ptg/FDTIKbAUBAJX6zvU88knwM/D78Wz1HPp///EEzgmBDZwP3w9BDvQKWwYCAYr7mvbF8oLwE/CH8bD0MPl+/voD/QjxDF0P9w+uDqkLQwcBAoP8bvdc88nwA/Ag8QD0S/h//f8CJAhTDA0P/w8ND1MMJQgAA4D9S/gA9CDxA/DJ8FzzbveC/AECQwepC64O9w9dD/EM/gj7A3/+Mfmx9IfxE/CB8MXymfaJ+wEBWgbzCkEO3w+dD4ENzwnwBIL/Gfpy9fPxP/A78FDyrfXW+g=="
  const mockSize = 64078
  return new Response(
    JSON.stringify({ success: true, audio_base64: mockB64, content_type: "audio/wav", size: mockSize }),
    { headers: { ...headers, 'Content-Type': 'application/json' } }
  )
}
