import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENROUTER_BASE = "https://openrouter.ai/api/v1"
const DEFAULT_MODEL = "mistralai/mixtral-8x7b-instruct"

const SYSTEM_PROMPT = `You are a Cantonese speech therapy mini-game designer AI.
Given a therapy goal description, generate a structured mini-game blueprint in JSON.

The blueprint must have this exact structure:
{
  "name": "游戏名称",
  "description": "游戏描述",
  "phonemeTargets": [{"type": "initial|final|tone", "phonemes": ["b", "p"]}],
  "mechanic": {
    "type": "select-correct|drag-sort|tone-wheel|repeat-after|match-pair|minimal-pair-dash",
    "timeLimitSec": 20,
    "itemsPerRound": 6,
    "roundsPerGame": 1,
    "showScore": true,
    "showTimer": true,
    "allowRetry": false,
    "passThreshold": 0.65
  },
  "scene": {
    "environment": "forest|underwater|space|room|desert",
    "particleEffect": "sparkles|bubbles|stars|none"
  },
  "ui": {
    "cardStyle": "card",
    "primaryColor": "#2563eb",
    "secondaryColor": "#10b981",
    "accentColor": "#f59e0b",
    "showCharacter": true,
    "showJyutping": true
  },
  "rewards": {
    "onCorrect": "sparkle",
    "onStreak": "badge",
    "onComplete": "summary"
  },
  "challenges": [
    {
      "id": "q1",
      "text": "爸",
      "jyutping": "baa1",
      "correctAnswer": "b",
      "options": ["b", "p", "m", "f"],
      "difficulty": "medium",
      "hint": "双唇音"
    }
  ],
  "adaptationRules": {
    "difficultyMultiplier": 1.0,
    "fatigueThresholdSec": 600,
    "adaptiveDifficulty": true
  }
}

Rules:
- phonemeTargets type: "initial" for consonants (b,p,m,f,d,t,n,l,g,k,ng,h,gw,kw,w,j), "final" for vowels/rhymes (aa,aai,aau,aam,aan,aang,aap,aat,aak,i,iu,im,in,ing,ip,it,ik,u,ui,un,ung,ut,uk,e,ei,eng,ek,o,oi,ou,on,ong,ot,ok,oe,oeng,oek,eo,eoi,eon,eot,yu,yun,yut), "tone" for tones (1-6)
- mechanic type mapping: initial→select-correct, final→drag-sort, tone→tone-wheel, mixed→repeat-after
- scene mapping: initial→forest, final→underwater, tone→space
- Generate 4-8 challenges based on difficulty (easy=4, medium=6, hard=8)
- Each challenge needs correctAnswer and 2-4 options including the correct one
- Use real Cantonese characters with accurate jyutping
- Return ONLY valid JSON, no markdown, no explanation`

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

    const { description, difficulty, patientContext } = await req.json()
    if (!description) {
      return new Response(
        JSON.stringify({ error: 'description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openRouterKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const model = Deno.env.get('OPENROUTER_MODEL') || DEFAULT_MODEL

    let userPrompt = `Therapy goal: ${description}\nDifficulty: ${difficulty || 'medium'}\n\nGenerate the mini-game blueprint JSON.`

    if (patientContext) {
      userPrompt += `\n\nPatient context:
- Name: ${patientContext.name}
- Overall accuracy: ${Math.round(patientContext.overallAccuracy * 100)}%
- Weak phonemes: ${patientContext.phonemeProfiles?.filter(p => p.accuracy < 0.75).map(p => `${p.phoneme} (${Math.round(p.accuracy * 100)}%)`).join(', ') || 'none'}
- Fatigue warnings: ${patientContext.fatigueWarnings?.join(', ') || 'none'}

Design the game to target the weakest phonemes first.`
    }

    const aiResponse = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
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

    let blueprint
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        blueprint = JSON.parse(jsonMatch[0])
      } else {
        blueprint = JSON.parse(content)
      }
    } catch {
      console.error('Failed to parse AI response:', content)
      return new Response(
        JSON.stringify({ error: 'AI returned invalid JSON' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        blueprint: {
          ...blueprint,
          id: `ai-${Date.now()}`,
          generatedBy: 'ai',
          createdAt: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('ai-blueprint error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
