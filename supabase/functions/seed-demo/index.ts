import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

    let therapistId: string

    const { data: existingTherapist } = await supabaseAdmin.auth.admin.listUsers()
    const therapistUser = existingTherapist?.users?.find(u => u.email === DEMO_THERAPIST.email)

    if (therapistUser) {
      therapistId = therapistUser.id
      console.log('Demo therapist already exists:', therapistId)
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

    const createdStudents: Array<{ id: string; username: string; nickname: string }> = []

    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUsers = allUsers?.users || []

    for (const student of DEMO_STUDENTS) {
      const existingStudent = existingUsers.find(u => u.email === student.email)
      let studentId: string

      if (existingStudent) {
        studentId = existingStudent.id
        console.log('Demo student already exists:', student.username)
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

    return new Response(
      JSON.stringify({
        success: true,
        therapist: {
          id: therapistId,
          email: DEMO_THERAPIST.email,
          password: DEMO_THERAPIST.password,
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
