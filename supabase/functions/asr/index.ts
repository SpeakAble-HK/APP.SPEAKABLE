import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !data?.user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session. Please sign in again.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = data.user.id
    console.log('Authenticated user:', userId)

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const language = formData.get('language') as string || 'yue'
    
    // Input validation
    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
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

    console.log('Received audio file:', audioFile.name, 'Size:', audioFile.size, 'Language:', language, 'User:', userId)

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
      
      // Return generic error to client
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
    console.log('ASR Result for user', userId, ':', asrResult)

    return new Response(
      JSON.stringify({ 
        success: true,
        result: asrResult.result // Array of [character, jyutping] pairs
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('ASR Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process audio. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
