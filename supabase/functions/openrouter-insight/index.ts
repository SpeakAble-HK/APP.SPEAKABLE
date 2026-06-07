import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENROUTER_BASE = "https://openrouter.ai/api/v1"
const DEFAULT_MODEL = "mistralai/mixtral-8x7b-instruct"

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
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { student_id } = await req.json()
    if (!student_id) {
      return new Response(
        JSON.stringify({ error: 'student_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify parent-student relationship
    const { data: link, error: linkError } = await supabaseClient
      .from('parent_students')
      .select('id')
      .eq('parent_id', user.id)
      .eq('student_id', student_id)
      .maybeSingle()

    if (linkError || !link) {
      return new Response(
        JSON.stringify({ error: 'Not linked to this student' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch student's lesson progress
    const { data: progress, error: progressError } = await supabaseClient
      .from('lesson_progress')
      .select('lesson_id, completed, accuracy_score, attempts, xp_earned, updated_at')
      .eq('user_id', student_id)
      .order('updated_at', { ascending: false })
      .limit(50)

    if (progressError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch progress' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch student's explorer profile for name
    const { data: profile } = await supabaseClient
      .from('explorer_profiles')
      .select('nickname')
      .eq('user_id', student_id)
      .maybeSingle()

    // Build prompt for OpenRouter
    const totalLessons = progress?.length || 0
    const completedLessons = progress?.filter(p => p.completed).length || 0
    const avgAccuracy = totalLessons > 0
      ? Math.round(progress!.reduce((sum, p) => sum + (p.accuracy_score || 0), 0) / totalLessons)
      : 0
    const totalXp = progress?.reduce((sum, p) => sum + (p.xp_earned || 0), 0) || 0
    const studentName = profile?.nickname || '小朋友'

    const systemPrompt = `You are a Cantonese speech therapy AI assistant for parents. 
Analyze the practice data and generate insights in traditional Chinese (Hong Kong). 
Keep responses concise, warm, and actionable. Focus on:
1. Pronunciation accuracy trends
2. Tone performance (Cantonese has 6 tones)
3. Practice consistency
4. Specific recommendations for improvement
Return JSON with keys: overview (string), strengths (string[]), improvements (string[]), tips (string[])`

    const userPrompt = `Student: ${studentName}
Total lessons attempted: ${totalLessons}
Completed: ${completedLessons}
Average accuracy score: ${avgAccuracy}%
Total XP earned: ${totalXp}

Recent progress data:
${JSON.stringify(progress?.slice(0, 10) || [], null, 2)}

Generate insights in Cantonese (Hong Kong Chinese).`

    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openRouterKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const model = Deno.env.get('OPENROUTER_MODEL') || DEFAULT_MODEL

    const aiResponse = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      console.error('OpenRouter error:', aiResponse.status, errText)
      return new Response(
        JSON.stringify({ error: 'AI service unavailable' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const aiJson = await aiResponse.json()
    const content = aiJson.choices?.[0]?.message?.content || ''

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      parsed = { overview: content, strengths: [], improvements: [], tips: [] }
    }

    return new Response(
      JSON.stringify({
        success: true,
        student_id,
        student_name: studentName,
        stats: { totalLessons, completedLessons, avgAccuracy, totalXp },
        insights: parsed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('openrouter-insight error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
