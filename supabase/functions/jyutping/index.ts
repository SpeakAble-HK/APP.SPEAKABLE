import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const API_BASE_URL = "http://comp.naozumi.me"
const MAX_TEXT_LENGTH = 5000
const GUEST_DAILY_LIMIT = 5

async function checkGuestRateLimit(userId: string, isAnonymous: boolean): Promise<{ allowed: boolean; remaining: number }> {
  if (!isAnonymous) return { allowed: true, remaining: -1 }
  
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const today = new Date().toISOString().split('T')[0]
  const { data } = await adminClient
    .from('guest_usage')
    .select('request_count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .maybeSingle()
  
  const currentCount = data?.request_count ?? 0
  if (currentCount >= GUEST_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 }
  }
  
  await adminClient.from('guest_usage').upsert(
    { user_id: userId, usage_date: today, request_count: currentCount + 1, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,usage_date' }
  )
  
  return { allowed: true, remaining: GUEST_DAILY_LIMIT - currentCount - 1 }
}

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

    const isAnonymous = data.claims.is_anonymous === true
    const userId = data.claims.sub as string
    const { allowed, remaining } = await checkGuestRateLimit(userId, isAnonymous)
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Daily guest limit reached. Please create a free account to continue.', trial_exhausted: true }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData()
    const rawText = formData.get('text') as string
    
    if (!rawText) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const text = sanitizeText(rawText)
    if (text.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Text too long. Maximum length is ${MAX_TEXT_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (text.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is empty after sanitization.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Jyutping Request - Text length:', text.length, 'User:', data.claims.sub)

    const jyutpingFormData = new FormData()
    jyutpingFormData.append('text', text)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    let jyutpingResponse: Response
    try {
      jyutpingResponse = await fetch(`${API_BASE_URL}/api/jyutping`, {
        method: 'POST',
        body: jyutpingFormData,
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

    if (!jyutpingResponse.ok) {
      const errorText = await jyutpingResponse.text()
      console.error('Jyutping API error:', jyutpingResponse.status, errorText)
      
      let clientMessage = 'Failed to process text. Please try again.'
      if (jyutpingResponse.status === 400) clientMessage = 'Invalid text input.'
      else if (jyutpingResponse.status === 503) clientMessage = 'Jyutping service is temporarily unavailable.'
      
      return new Response(
        JSON.stringify({ error: clientMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const jyutpingResult = await jyutpingResponse.json()
    console.log('Jyutping Result')

    return new Response(
      JSON.stringify({ success: true, result: jyutpingResult.result }),
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
