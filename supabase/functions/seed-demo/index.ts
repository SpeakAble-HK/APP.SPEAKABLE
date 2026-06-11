import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import postgres from "https://deno.land/x/postgresjs/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEMO_THERAPIST = {
  email: "demo@st.speakable.hk",
  password: "Demo2024!",
  first_name: "Demo",
  last_name: "治療師",
  username: "demo_therapist",
}

const DEMO_PARENT = {
  email: "demo@parent.speakable.hk",
  password: "Parent2024!",
  first_name: "Demo",
  last_name: "家長",
  username: "demo_parent",
}

const DEMO_STUDENTS = [
  {
    email: "student1@demo.speakable.hk",
    password: "Student123!",
    first_name: "小明",
    last_name: "陳",
    username: "demo_student_1",
    nickname: "陳小明",
    age: 8,
    gender: "M",
    date_of_birth: "2018-03-15",
  },
  {
    email: "student2@demo.speakable.hk",
    password: "Student123!",
    first_name: "芷晴",
    last_name: "李",
    username: "demo_student_2",
    nickname: "李芷晴",
    age: 7,
    gender: "F",
    date_of_birth: "2019-06-20",
  },
  {
    email: "student3@demo.speakable.hk",
    password: "Student123!",
    first_name: "家豪",
    last_name: "黃",
    username: "demo_student_3",
    nickname: "黃家豪",
    age: 9,
    gender: "M",
    date_of_birth: "2017-01-10",
  },
]

const DEMO_LESSONS = [
  { lesson_id: "bilabial-basic", completed: true, accuracy_score: 85, xp_earned: 100 },
  { lesson_id: "bilabial-intermediate", completed: true, accuracy_score: 72, xp_earned: 150 },
  { lesson_id: "tone-training-1", completed: true, accuracy_score: 68, xp_earned: 120 },
  { lesson_id: "tone-training-2", completed: false, accuracy_score: 55, xp_earned: 80 },
  { lesson_id: "vowel-practice", completed: true, accuracy_score: 78, xp_earned: 130 },
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey })
      return new Response(
        JSON.stringify({ error: 'Server configuration error: missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Apply subscription migration if not already applied
    try {
      const dbUrl = Deno.env.get('SUPABASE_DB_URL')
      if (dbUrl) {
        const sql = postgres(dbUrl)
        
        // Create subscription_plans table
        await sql`
          CREATE TABLE IF NOT EXISTS subscription_plans (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            name_zh TEXT,
            monthly_price_hkd INTEGER NOT NULL DEFAULT 0,
            annual_price_hkd INTEGER NOT NULL DEFAULT 0,
            max_child_accounts INTEGER DEFAULT 1,
            features JSONB NOT NULL DEFAULT '{}',
            active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT now()
          )
        `
        
        // Create subscriptions table
        await sql`
          CREATE TABLE IF NOT EXISTS subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
            status TEXT NOT NULL DEFAULT 'active',
            billing_cycle TEXT NOT NULL DEFAULT 'monthly',
            current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
            current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 month'),
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE (user_id)
          )
        `
        
        // Insert default plans if not exists
        await sql`
          INSERT INTO subscription_plans (id, name, name_zh, monthly_price_hkd, annual_price_hkd, max_child_accounts, features) 
          VALUES 
            ('free', 'Free', '免費', 0, 0, 1, '{"daily_credits": 5, "monthly_cap": 30, "speech_quest": false, "ai_voice_clone": false, "ipa_transcription": false, "diagnostics": false, "ad_free": false, "parent_insights": false, "nepa_analysis": false, "therapist_collaboration": false, "unlimited_practice": false, "interactive_stories": 3, "mini_games": 6}'::jsonb),
            ('plus', 'Plus', '進階', 99, 79, 3, '{"daily_credits": -1, "monthly_cap": -1, "speech_quest": true, "ai_voice_clone": true, "ipa_transcription": false, "diagnostics": false, "ad_free": false, "parent_insights": true, "nepa_analysis": false, "therapist_collaboration": false, "unlimited_practice": true, "interactive_stories": 12, "mini_games": 12}'::jsonb),
            ('pro', 'Pro', '專業', 199, 159, -1, '{"daily_credits": -1, "monthly_cap": -1, "speech_quest": true, "ai_voice_clone": true, "ipa_transcription": true, "diagnostics": true, "ad_free": true, "parent_insights": true, "nepa_analysis": true, "therapist_collaboration": true, "unlimited_practice": true, "interactive_stories": -1, "mini_games": -1}'::jsonb)
          ON CONFLICT (id) DO NOTHING
        `
        
        // Create get_user_subscription function
        await sql`
          CREATE OR REPLACE FUNCTION get_user_subscription(_user_id UUID)
          RETURNS JSONB
          LANGUAGE sql
          STABLE
          SECURITY DEFINER
          SET search_path = public
          AS $$
            SELECT COALESCE(
              (SELECT jsonb_build_object(
                'plan_id', s.plan_id,
                'status', s.status,
                'billing_cycle', s.billing_cycle,
                'current_period_end', s.current_period_end,
                'features', p.features,
                'plan_name', p.name,
                'plan_name_zh', p.name_zh,
                'max_child_accounts', p.max_child_accounts
              )
              FROM subscriptions s
              JOIN subscription_plans p ON p.id = s.plan_id
              WHERE s.user_id = _user_id AND s.status IN ('active', 'trialing')),
              (SELECT jsonb_build_object(
                'plan_id', 'free',
                'status', 'active',
                'billing_cycle', 'monthly',
                'current_period_end', null,
                'features', features,
                'plan_name', name,
                'plan_name_zh', name_zh,
                'max_child_accounts', max_child_accounts
              )
              FROM subscription_plans WHERE id = 'free')
            )
          $$
        `
        
        // Enable RLS on subscriptions table
        await sql`ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY`
        
        // Create RLS policies
        await sql`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own subscription' AND tablename = 'subscriptions') THEN
              CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own subscription' AND tablename = 'subscriptions') THEN
              CREATE POLICY "Users can insert own subscription" ON subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own subscription' AND tablename = 'subscriptions') THEN
              CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
            END IF;
          END $$
        `
        
        console.log('Subscription migration applied successfully')
        await sql.end()
      }
    } catch (migrationError) {
      console.error('Migration error (non-fatal):', migrationError.message)
    }

    let therapistId: string

    const { data: existingTherapist } = await supabaseAdmin.auth.admin.listUsers()
    const therapistUser = existingTherapist?.users?.find(u => u.email === DEMO_THERAPIST.email)

    if (therapistUser) {
      therapistId = therapistUser.id
      // Reset password to ensure it's always correct
      const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
        therapistId,
        { password: DEMO_THERAPIST.password }
      )
      if (resetError) {
        console.warn('Failed to reset therapist password:', resetError.message)
      }
      console.log('Demo therapist already exists, password reset:', therapistId)
    } else {
      const { data: newTherapist, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: DEMO_THERAPIST.email,
        password: DEMO_THERAPIST.password,
        email_confirm: true,
        user_metadata: {
          display_name: `${DEMO_THERAPIST.first_name} ${DEMO_THERAPIST.last_name}`,
          first_name: DEMO_THERAPIST.first_name,
          last_name: DEMO_THERAPIST.last_name,
          username: DEMO_THERAPIST.username,
        },
      })

      if (createError || !newTherapist?.user) {
        return new Response(
          JSON.stringify({ error: createError?.message || 'Failed to create demo therapist' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      therapistId = newTherapist.user.id

      await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: therapistId, role: 'therapist' })

      console.log('Created demo therapist:', therapistId)
    }

    // Create demo parent account
    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingParent = allUsers.users.find(u => u.email === DEMO_PARENT.email)
    let parentId: string

    if (existingParent) {
      parentId = existingParent.id
      // Reset password to ensure it's always correct
      const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
        parentId,
        { password: DEMO_PARENT.password }
      )
      if (resetError) {
        console.warn('Failed to reset parent password:', resetError.message)
      }
      console.log('Demo parent already exists, password reset:', parentId)
    } else {
      const { data: newParent, error: parentError } = await supabaseAdmin.auth.admin.createUser({
        email: DEMO_PARENT.email,
        password: DEMO_PARENT.password,
        email_confirm: true,
        user_metadata: {
          display_name: `${DEMO_PARENT.first_name} ${DEMO_PARENT.last_name}`,
          first_name: DEMO_PARENT.first_name,
          last_name: DEMO_PARENT.last_name,
          username: DEMO_PARENT.username,
        },
      })

      if (parentError || !newParent?.user) {
        return new Response(
          JSON.stringify({ error: parentError?.message || 'Failed to create demo parent' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      parentId = newParent.user.id

      await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: parentId, role: 'parent' })

      console.log('Created demo parent:', parentId)
    }

    const createdStudents: Array<{ id: string; username: string; nickname: string }> = []

    const existingUsers = allUsers?.users || []

    for (const student of DEMO_STUDENTS) {
      const existingStudent = existingUsers.find(u => u.email === student.email)
      let studentId: string

      if (existingStudent) {
        studentId = existingStudent.id
        // Reset password to ensure it's always correct
        const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
          studentId,
          { password: student.password }
        )
        if (resetError) {
          console.warn('Failed to reset student password:', student.username, resetError.message)
        }
        console.log('Demo student already exists, password reset:', student.username)
      } else {
        const { data: newStudent, error: studentError } = await supabaseAdmin.auth.admin.createUser({
          email: student.email,
          password: student.password,
          email_confirm: true,
          user_metadata: {
            display_name: `${student.first_name} ${student.last_name}`,
            first_name: student.first_name,
            last_name: student.last_name,
            username: student.username,
            date_of_birth: student.date_of_birth,
          },
        })

        if (studentError || !newStudent?.user) {
          console.warn('Failed to create student:', student.username, studentError?.message)
          continue
        }

        studentId = newStudent.user.id

        await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: studentId, role: 'explorer' })

        await supabaseAdmin
          .from('explorer_profiles')
          .insert({
            user_id: studentId,
            nickname: student.nickname,
            age: student.age,
            gender: student.gender,
          })

        console.log('Created demo student:', student.username)
      }

      createdStudents.push({ id: studentId, username: student.username, nickname: student.nickname })

      const { data: existingLink } = await supabaseAdmin
        .from('st_students')
        .select('id')
        .eq('therapist_id', therapistId)
        .eq('student_id', studentId)
        .maybeSingle()

      if (!existingLink) {
        await supabaseAdmin
          .from('st_students')
          .insert({ therapist_id: therapistId, student_id: studentId })
      }

      for (const lesson of DEMO_LESSONS) {
        const { data: existingProgress } = await supabaseAdmin
          .from('lesson_progress')
          .select('id')
          .eq('user_id', studentId)
          .eq('lesson_id', lesson.lesson_id)
          .maybeSingle()

        if (!existingProgress) {
          const variance = Math.floor(Math.random() * 20) - 10
          await supabaseAdmin
            .from('lesson_progress')
            .insert({
              user_id: studentId,
              lesson_id: lesson.lesson_id,
              completed: lesson.completed,
              accuracy_score: Math.max(30, Math.min(100, lesson.accuracy_score + variance)),
              xp_earned: lesson.xp_earned,
            })
        }
      }
    }

    // Link parent to all demo students
    for (const student of createdStudents) {
      const { data: existingParentLink } = await supabaseAdmin
        .from('parent_students')
        .select('id')
        .eq('parent_id', parentId)
        .eq('student_id', student.id)
        .maybeSingle()

      if (!existingParentLink) {
        const { error: parentLinkError } = await supabaseAdmin
          .from('parent_students')
          .insert({ parent_id: parentId, student_id: student.id, relationship: 'parent' })

        if (parentLinkError) {
          console.warn('Failed to link parent to student:', student.username, parentLinkError.message)
        } else {
          console.log('Linked parent to student:', student.username)
        }
      }
    }

    // Ensure all demo accounts have PRO subscriptions (full access)
    const allDemoUserIds = [therapistId, parentId, ...createdStudents.map(s => s.id)]
    for (const userId of allDemoUserIds) {
      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (existingSub) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ plan_id: 'pro', status: 'active', billing_cycle: 'annual' })
          .eq('user_id', userId)
      } else {
        await supabaseAdmin
          .from('subscriptions')
          .insert({ user_id: userId, plan_id: 'pro', status: 'active', billing_cycle: 'annual' })
      }
    }
    console.log('Set PRO subscriptions for all demo accounts')

    return new Response(
      JSON.stringify({
        success: true,
        therapist: {
          id: therapistId,
          email: DEMO_THERAPIST.email,
          password: DEMO_THERAPIST.password,
        },
        parent: {
          id: parentId,
          email: DEMO_PARENT.email,
          password: DEMO_PARENT.password,
        },
        students: createdStudents.map(s => ({
          ...s,
          password: "Student123!",
        })),
        message: "Demo environment seeded successfully",
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Seed demo error:', error?.message || error, JSON.stringify(error))
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error?.message || String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
