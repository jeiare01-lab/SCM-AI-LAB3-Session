import React, { useState, useEffect, useRef, useCallback } from 'react'
import { SLIDES } from './slidesData.js'
import { SlideBody, SlideFrame, DialoguePanel } from './SlideComponents.jsx'
import {
  genPin, createSession, checkSessionExists,
  setCurrentSlide, getCurrentSlide,
  touchPresence, getActivePresenceCount, resetPresence,
  submitAnswer, getAllAnswers, clearSlideAnswers, resetAllAnswers,
  checkFacilitatorPassword,
} from './supabaseClient.js'

function navBtnStyle(disabled) {
  return {
    background: '#152347', border: '1px solid #2E3347', color: disabled ? '#475569' : '#94A3B8',
    width: 28, height: 28, borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }
}

export default function App() {
  const [mode, setMode] = useState(null) // null | 'facilitator' | 'participant'
  const [sessionPin, setSessionPin] = useState('')
  const [joinPin, setJoinPin] = useState('')
  const [name, setName] = useState('')
  const [current, setCurrent] = useState(1)
  const [answersRaw, setAnswersRaw] = useState([]) // flat list from supabase
  const [answerText, setAnswerText] = useState('')
  const [submitted, setSubmitted] = useState({})
  const [participantCount, setParticipantCount] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showConfirm, setShowConfirm] = useState(null)
  const [showPasswordGate, setShowPasswordGate] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const pollRef = useRef(null)

  const slide = SLIDES.find(s => s.id === current) || SLIDES[0]

  // group answers by slide_question key
  const answersByKey = {}
  answersRaw.forEach(a => {
    const key = `${a.slide_id}_${a.question_id}`
    if (!answersByKey[key]) answersByKey[key] = []
    answersByKey[key].push({ name: a.name, text: a.answer_text, ts: new Date(a.submitted_at).getTime() })
  })

  // ── FACILITATOR: create session (after password verified) ────────────────
  const handleCreateSession = async () => {
    setLoading(true)
    setError('')
    const pin = genPin()
    const ok = await createSession(pin)
    setLoading(false)
    if (!ok) { setError('Could not create session. Check Supabase connection.'); return }
    setSessionPin(pin)
    setMode('facilitator')
  }

  // ── FACILITATOR: verify password before unlocking session creation ───────
  const handleVerifyPassword = async () => {
    setPasswordError('')
    if (!passwordInput.trim()) { setPasswordError('Enter the facilitator password.'); return }
    setLoading(true)
    const ok = await checkFacilitatorPassword(passwordInput.trim())
    setLoading(false)
    if (!ok) { setPasswordError('Incorrect password.'); setPasswordInput(''); return }
    setShowPasswordGate(false)
    setPasswordInput('')
    await handleCreateSession()
  }

  // ── PARTICIPANT: join session ────────────────────────────────────────────
  const handleJoinSession = async () => {
    setError('')
    if (!joinPin.trim() || joinPin.trim().length !== 4) { setError('Enter the 4-digit session PIN.'); return }
    if (!name.trim()) { setError('Enter your name.'); return }
    setLoading(true)
    const exists = await checkSessionExists(joinPin.trim())
    setLoading(false)
    if (!exists) { setError('Session not found. Check the PIN with your facilitator.'); return }
    setSessionPin(joinPin.trim())
    setMode('participant')
    const liveSlide = await getCurrentSlide(joinPin.trim())
    setCurrent(liveSlide)
    await touchPresence(joinPin.trim(), name.trim())
  }

  // ── FACILITATOR: navigate slides ─────────────────────────────────────────
  const goSlide = useCallback(async (n) => {
    const target = Math.max(1, Math.min(SLIDES.length, n))
    setCurrent(target)
    setAnswerText('')
    if (mode === 'facilitator' && sessionPin) {
      await setCurrentSlide(sessionPin, target)
    }
  }, [mode, sessionPin])

  // ── PARTICIPANT: submit answer ───────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !slide.question) return
    await submitAnswer(sessionPin, slide.id, slide.question.id, name.trim(), answerText.trim())
    const qKey = `${slide.id}_${slide.question.id}`
    setSubmitted(prev => ({ ...prev, [qKey]: true }))
  }

  // ── FACILITATOR: clear / reset ────────────────────────────────────────────
  const clearCurrentSlide = async () => {
    if (slide.question) await clearSlideAnswers(sessionPin, slide.id, slide.question.id)
    setShowConfirm(null)
  }
  const resetAllSession = async () => {
    await resetAllAnswers(sessionPin)
    setParticipantCount(0)
    setShowConfirm(null)
  }

  const buildSummaryData = () => {
    return SLIDES.filter(s => s.question).map(s => {
      const qKey = `${s.id}_${s.question.id}`
      const list = answersByKey[qKey] || []
      return { slideId: s.id, slideTitle: s.title, prompt: s.question.prompt, responses: list.slice().sort((a, b) => a.ts - b.ts) }
    })
  }

  // ── POLLING ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionPin) return
    const poll = async () => {
      if (mode === 'facilitator') {
        const all = await getAllAnswers(sessionPin)
        setAnswersRaw(all)
        const count = await getActivePresenceCount(sessionPin)
        setParticipantCount(count)
      } else if (mode === 'participant') {
        const liveSlide = await getCurrentSlide(sessionPin)
        if (liveSlide !== current) { setCurrent(liveSlide); setAnswerText('') }
        if (name.trim()) await touchPresence(sessionPin, name.trim())
      }
    }
    poll()
    pollRef.current = setInterval(poll, 2500)
    return () => clearInterval(pollRef.current)
  }, [sessionPin, mode, current, name])

  // ── KEYBOARD NAV ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'facilitator') return
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goSlide(current + 1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goSlide(current - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mode, current, goSlide])

  // ═══════════════════════════════════════════════════════════════════════
  // ROLE SELECT
  // ═══════════════════════════════════════════════════════════════════════
  if (!mode) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B3D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", padding: 20 }}>
        <div style={{ maxWidth: 440, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg,#C0392B,#1E40AF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 16, margin: '0 auto 14px', fontFamily: "'Space Grotesk',sans-serif" }}>PGB</div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>AI Lab 3 — Live Session</div>
            <div style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>Build the Platform</div>
          </div>

          <div style={{ background: '#152347', borderRadius: 12, padding: 20, marginBottom: 14 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>🎤 I'm the Facilitator</div>
            <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>Start a new session and get a PIN for participants to join.</div>
            <button onClick={() => setShowPasswordGate(true)} disabled={loading} style={{ width: '100%', background: '#1E40AF', color: '#fff', border: 'none', padding: 12, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
              🔒 Start Facilitator Session
            </button>
          </div>

          <div style={{ background: '#152347', borderRadius: 12, padding: 20 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>👤 I'm a Participant</div>
            <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>Enter the session PIN from your facilitator.</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
              style={{ width: '100%', background: '#0D1B3D', border: '1px solid #2E3347', borderRadius: 8, padding: 10, color: '#fff', fontSize: 13, marginBottom: 8, outline: 'none', boxSizing: 'border-box' }} />
            <input value={joinPin} onChange={e => setJoinPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeho
