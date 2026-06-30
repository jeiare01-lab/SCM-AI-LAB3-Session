import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ppmvfkmltfxmllnlinsl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbXZma21sdGZ4bWxsbmxpbnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODA5ODEsImV4cCI6MjA5NzE1Njk4MX0.gdJKESBUoLxqTAh6y_dQlZMNgPq3LlQXoBopNd1DAk4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Session helpers ────────────────────────────────────────────────────────
export function genPin() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export async function createSession(pin) {
  const { error } = await supabase
    .from('lab3_sessions')
    .insert({ pin, current_slide: 1 })
  return !error
}

export async function checkSessionExists(pin) {
  const { data, error } = await supabase
    .from('lab3_sessions')
    .select('pin')
    .eq('pin', pin)
    .maybeSingle()
  return !error && !!data
}

export async function setCurrentSlide(pin, slideId) {
  await supabase
    .from('lab3_sessions')
    .update({ current_slide: slideId })
    .eq('pin', pin)
}

export async function getCurrentSlide(pin) {
  const { data } = await supabase
    .from('lab3_sessions')
    .select('current_slide')
    .eq('pin', pin)
    .maybeSingle()
  return data ? data.current_slide : 1
}

// ── Presence helpers ───────────────────────────────────────────────────────
export async function touchPresence(pin, name) {
  await supabase
    .from('lab3_presence')
    .upsert({ pin, name, last_seen: new Date().toISOString() }, { onConflict: 'pin,name' })
}

export async function getActivePresenceCount(pin) {
  const cutoff = new Date(Date.now() - 60000).toISOString()
  const { data } = await supabase
    .from('lab3_presence')
    .select('name')
    .eq('pin', pin)
    .gte('last_seen', cutoff)
  return data ? data.length : 0
}

export async function resetPresence(pin) {
  await supabase.from('lab3_presence').delete().eq('pin', pin)
}

// ── Answer helpers ─────────────────────────────────────────────────────────
export async function submitAnswer(pin, slideId, questionId, name, text) {
  await supabase
    .from('lab3_answers')
    .upsert(
      { pin, slide_id: slideId, question_id: questionId, name, answer_text: text, submitted_at: new Date().toISOString() },
      { onConflict: 'pin,slide_id,question_id,name' }
    )
}

export async function getAllAnswers(pin) {
  const { data } = await supabase
    .from('lab3_answers')
    .select('slide_id, question_id, name, answer_text, submitted_at')
    .eq('pin', pin)
    .order('submitted_at', { ascending: true })
  return data || []
}

export async function clearSlideAnswers(pin, slideId, questionId) {
  await supabase
    .from('lab3_answers')
    .delete()
    .eq('pin', pin)
    .eq('slide_id', slideId)
    .eq('question_id', questionId)
}

export async function resetAllAnswers(pin) {
  await supabase.from('lab3_answers').delete().eq('pin', pin)
  await resetPresence(pin)
}
