import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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

    const therapistId = data.claims.sub

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: therapistRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', therapistId)
      .eq('role', 'therapist')
      .maybeSingle()

    if (!therapistRole) {
      return new Response(
        JSON.stringify({ error: 'Only therapists can create student accounts' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { email, password, first_name, last_name, username, date_of_birth, nickname, age, gender } = body

    if (!email || !password || !username) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and username are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const displayName = `${first_name || ''} ${last_name || ''}`.trim() || username

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName,
        first_name: first_name || null,
        last_name: last_name || null,
        username,
        date_of_birth: date_of_birth || null,
      },
    })

    if (createError || !newUser?.user) {
      return new Response(
        JSON.stringify({ error: createError?.message || 'Failed to create user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const studentId = newUser.user.id

    await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: studentId, role: 'explorer' })

    await supabaseAdmin
      .from('explorer_profiles')
      .insert({
        user_id: studentId,
        nickname: nickname || displayName,
        age: age || null,
        gender: gender || null,
      })

    const { error: linkError } = await supabaseAdmin
      .from('st_students')
      .insert({ therapist_id: therapistId, student_id: studentId })

    if (linkError) {
      console.warn('Student created but link failed:', linkError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        student: {
          id: studentId,
          email,
          username,
          display_name: displayName,
          nickname: nickname || displayName,
          age: age || null,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Create student error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
