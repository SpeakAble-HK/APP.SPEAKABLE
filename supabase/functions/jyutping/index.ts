import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    console.log('Jyutping Request - Text:', text.substring(0, 100), '... User:', userId)

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
    console.log('Jyutping Result for user', userId)

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
