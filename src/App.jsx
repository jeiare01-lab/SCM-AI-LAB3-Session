import React, { useState, useEffect, useRef, useCallback } from 'react'
import { SLIDES, LEARN } from './slidesData.js'
import { SlideBody, SlideFrame, DialoguePanel, ReadContent, QuizCard, BuildPanel, PresentPanel } from './SlideComponents.jsx'
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

  // ── Participant-side learn UI state ───────────────────────────────────────
  const [activeTab, setActiveTab] = useState('read') // 'read' | 'build' | 'present'
  const [quizAnswers, setQuizAnswers] = useState({}) // { slideId: optionIndex }
  const [ratings, setRatings] = useState({}) // { slideId: 1-5 }

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

  // ── PARTICIPANT: copy build prompt to clipboard for use in Claude.ai ──────
  const [copiedTask, setCopiedTask] = useState(null)
  const handleCopyPrompt = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTask(idx)
      setTimeout(() => setCopiedTask(null), 2000)
    } catch (e) {
      // clipboard API unavailable — fallback handled in UI via manual select
    }
  }

  // ── PARTICIPANT: quiz + rating handlers ───────────────────────────────────
  const handleQuizAnswer = (optionIndex) => {
    setQuizAnswers(prev => ({ ...prev, [slide.id]: optionIndex }))
  }
  const handleRate = (n) => {
    setRatings(prev => ({ ...prev, [slide.id]: n }))
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
        if (liveSlide !== current) {
          setCurrent(liveSlide)
          setAnswerText('')
          setActiveTab('read')
          setCopiedTask(null)
        }
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
            <input value={joinPin} onChange={e => setJoinPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="4-digit PIN"
              style={{ width: '100%', background: '#0D1B3D', border: '1px solid #2E3347', borderRadius: 8, padding: 10, color: '#fff', fontSize: 16, letterSpacing: 4, textAlign: 'center', marginBottom: 8, outline: 'none', boxSizing: 'border-box' }} />
            {error && <div style={{ color: '#f87171', fontSize: 11.5, marginBottom: 8 }}>{error}</div>}
            <button onClick={handleJoinSession} disabled={loading} style={{ width: '100%', background: '#0D9488', color: '#fff', border: 'none', padding: 12, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Joining...' : 'Join Session'}
            </button>
          </div>
        </div>

        {showPasswordGate && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
            <div style={{ background: '#152347', borderRadius: 14, padding: 26, maxWidth: 360, width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>🔒</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: "'Space Grotesk',sans-serif" }}>Facilitator Access</div>
                <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>Enter the facilitator password to start a session</div>
              </div>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleVerifyPassword() }}
                placeholder="Password"
                autoFocus
                style={{ width: '100%', background: '#0D1B3D', border: '1px solid #2E3347', borderRadius: 8, padding: 12, color: '#fff', fontSize: 14, marginBottom: 8, outline: 'none', boxSizing: 'border-box', textAlign: 'center', letterSpacing: 2 }}
              />
              {passwordError && <div style={{ color: '#f87171', fontSize: 11.5, marginBottom: 8, textAlign: 'center' }}>{passwordError}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => { setShowPasswordGate(false); setPasswordInput(''); setPasswordError('') }} style={{ flex: 1, background: 'transparent', border: '1px solid #2E3347', color: '#94A3B8', padding: 10, borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleVerifyPassword} disabled={loading} style={{ flex: 1, background: '#1E40AF', border: 'none', color: '#fff', padding: 10, borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Checking...' : 'Unlock'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FACILITATOR VIEW
  // ═══════════════════════════════════════════════════════════════════════
  if (mode === 'facilitator') {
    const qKey = slide.question ? `${slide.id}_${slide.question.id}` : null
    const slideAnswers = qKey ? (answersByKey[qKey] || []) : []

    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0D1B3D', fontFamily: "'Inter',sans-serif", overflow: 'hidden' }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #summary-print-area, #summary-print-area * { visibility: visible; }
            #summary-print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .print-header { display: block !important; }
          }
        `}</style>

        <div style={{ height: 52, background: '#1A1D27', borderBottom: '1px solid #2E3347', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#C0392B,#1E40AF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 10 }}>PGB</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Lab 3 — Facilitator</div>
              <div style={{ color: '#94A3B8', fontSize: 9 }}>Session PIN: <strong style={{ color: '#F59E0B' }}>{sessionPin}</strong></div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
              ● {participantCount} joined
            </div>
            <button onClick={() => setShowSummary(true)} style={{ ...navBtnStyle(false), width: 'auto', padding: '0 10px', fontSize: 10, fontWeight: 700 }}>📋 Summary</button>
            <button onClick={() => setShowConfirm('resetAll')} style={{ ...navBtnStyle(false), width: 'auto', padding: '0 10px', fontSize: 10, fontWeight: 700, color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>⟲ Reset All</button>
            <button onClick={() => goSlide(current - 1)} disabled={current === 1} style={navBtnStyle(current === 1)}>‹</button>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", minWidth: 46, textAlign: 'center' }}>{current} / {SLIDES.length}</div>
            <button onClick={() => goSlide(current + 1)} disabled={current === SLIDES.length} style={navBtnStyle(current === SLIDES.length)}>›</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: '1 1 32%', padding: 14, minWidth: 0 }}>
            <SlideFrame slide={slide}><SlideBody slide={slide} /></SlideFrame>
          </div>
          <div style={{ flex: '1 1 30%', background: '#0f1520', borderLeft: '1px solid #2E3347', borderRight: '1px solid #2E3347', padding: 14, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8, flexShrink: 0 }}>🎤 FACILITATOR SCRIPT</div>
            <DialoguePanel slide={slide} />
          </div>
          <div style={{ flex: '1 1 38%', background: '#F8FAFC', padding: 14, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0 }}>
              <div style={{ color: '#0D1B3D', fontSize: 12, fontWeight: 700 }}>💬 LIVE ANSWERS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {slide.question && (
                  <div style={{ background: '#1E40AF', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>
                    {slideAnswers.length} / {participantCount || '?'} submitted
                  </div>
                )}
                {slide.question && slideAnswers.length > 0 && (
                  <button onClick={() => setShowConfirm('clearSlide')} style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#475569', fontSize: 9.5, fontWeight: 700, padding: '3px 8px', borderRadius: 20, cursor: 'pointer' }}>⟲ Clear</button>
                )}
              </div>
            </div>
            {slide.question ? (
              <>
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 11.5, color: '#475569', fontStyle: 'italic', flexShrink: 0 }}>
                  "{slide.question.prompt}"
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {slideAnswers.length === 0 && (
                    <div style={{ color: '#94A3B8', fontSize: 11.5, textAlign: 'center', marginTop: 30 }}>Waiting for answers to come in...</div>
                  )}
                  {slideAnswers.slice().reverse().map((a, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#1E40AF', marginBottom: 3 }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: '#1E293B', lineHeight: 1.5 }}>{a.text}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color: '#94A3B8', fontSize: 11.5, textAlign: 'center', marginTop: 30 }}>No question on this slide.</div>
            )}
          </div>
        </div>

        <div style={{ height: 56, background: '#1A1D27', borderTop: '1px solid #2E3347', display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', overflowX: 'auto', flexShrink: 0 }}>
          {SLIDES.map(s => (
            <div key={s.id} onClick={() => goSlide(s.id)} style={{
              minWidth: 78, height: 40, borderRadius: 5, cursor: 'pointer',
              border: s.id === current ? '2px solid #1E40AF' : '2px solid transparent',
              background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 9, fontWeight: 700, textAlign: 'center', padding: '0 6px', flexShrink: 0
            }}>
              {s.id}. {s.title.split(':')[0]}
            </div>
          ))}
        </div>

        {showConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
            <div style={{ background: '#152347', borderRadius: 14, padding: 26, maxWidth: 360, width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>{showConfirm === 'resetAll' ? '⟲' : '🗑'}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>
                {showConfirm === 'resetAll' ? 'Reset entire session?' : 'Clear answers for this slide?'}
              </div>
              <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 18, lineHeight: 1.5 }}>
                {showConfirm === 'resetAll'
                  ? 'This deletes every submitted answer across all 8 slides and resets the participant counter. This cannot be undone.'
                  : `This deletes all ${slideAnswers.length} answer${slideAnswers.length === 1 ? '' : 's'} submitted for Slide ${current} only. This cannot be undone.`}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowConfirm(null)} style={{ flex: 1, background: 'transparent', border: '1px solid #2E3347', color: '#94A3B8', padding: 10, borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                <button onClick={showConfirm === 'resetAll' ? resetAllSession : clearCurrentSlide} style={{ flex: 1, background: '#C0392B', border: 'none', color: '#fff', padding: 10, borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  {showConfirm === 'resetAll' ? 'Reset Everything' : 'Clear Slide'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSummary && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 14, maxWidth: 640, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 22px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0D1B3D', fontFamily: "'Space Grotesk',sans-serif" }}>📋 Session Summary</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>PIN {sessionPin} · Printable view</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => window.print()} style={{ background: '#1E40AF', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 7, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>🖨 Print / Save PDF</button>
                  <button onClick={() => setShowSummary(false)} style={{ background: '#F1F5F9', color: '#475569', border: 'none', width: 32, height: 32, borderRadius: 7, fontSize: 14, cursor: 'pointer' }}>✕</button>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 22 }} id="summary-print-area">
                <div style={{ textAlign: 'center', marginBottom: 18, display: 'none' }} className="print-header">
                  <div style={{ fontWeight: 700, fontSize: 16 }}>PGB AI Lab 3 — Session Summary</div>
                  <div style={{ fontSize: 11, color: '#666' }}>Session PIN: {sessionPin} · {new Date().toLocaleDateString()}</div>
                </div>
                {buildSummaryData().map((sec, i) => (
                  <div key={i} style={{ marginBottom: 22 }}>
                    <div style={{ background: '#0D1B3D', color: '#fff', fontSize: 11, fontWeight: 700, padding: '7px 12px', borderRadius: 6, marginBottom: 4 }}>
                      Slide {sec.slideId} · {sec.slideTitle}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#475569', fontStyle: 'italic', marginBottom: 8, padding: '0 4px' }}>"{sec.prompt}"</div>
                    {sec.responses.length === 0 ? (
                      <div style={{ fontSize: 11.5, color: '#94A3B8', padding: '6px 4px' }}>No responses submitted.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {sec.responses.map((r, ri) => (
                          <div key={ri} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 7, padding: '8px 11px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#1E40AF', marginBottom: 2 }}>{r.name}</div>
                            <div style={{ fontSize: 12, color: '#1E293B', lineHeight: 1.5 }}>{r.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div style={{ textAlign: 'center', fontSize: 9.5, color: '#94A3B8', marginTop: 10 }}>
                  PGB AI Lab Series — Lab 3 · Generated {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PARTICIPANT VIEW
  // ═══════════════════════════════════════════════════════════════════════
  const qKey = slide.question ? `${slide.id}_${slide.question.id}` : null
  const alreadySubmitted = qKey ? submitted[qKey] : false
  const learn = LEARN[slide.id]
  const hasLearnTabs = !!learn

  const tabBtnStyle = (tab) => ({
    flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 700, border: 'none',
    borderBottom: activeTab === tab ? '2px solid #1E40AF' : '2px solid transparent',
    background: 'transparent', color: activeTab === tab ? '#fff' : '#64748B', cursor: 'pointer'
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B3D', fontFamily: "'Inter',sans-serif", padding: 16 }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>👤 {name}</div>
          <div style={{ color: '#94A3B8', fontSize: 11 }}>Slide {current} / {SLIDES.length} · PIN {sessionPin}</div>
        </div>

        <div style={{ marginBottom: 16, minHeight: 220 }}>
          <SlideFrame slide={slide}><SlideBody slide={slide} /></SlideFrame>
        </div>

        {hasLearnTabs ? (
          <>
            <div style={{ display: 'flex', background: '#152347', borderRadius: '10px 10px 0 0', overflow: 'hidden' }}>
              <button onClick={() => setActiveTab('read')} style={tabBtnStyle('read')}>📖 Read</button>
              <button onClick={() => setActiveTab('build')} style={tabBtnStyle('build')}>🔧 Build</button>
              <button onClick={() => setActiveTab('present')} style={tabBtnStyle('present')}>🎤 Present</button>
            </div>
            <div style={{ background: '#0f1520', borderRadius: '0 0 10px 10px', padding: 14 }}>
              {activeTab === 'read' && (
                <>
                  <ReadContent learn={learn} />
                  <QuizCard quiz={learn.quiz} quizState={quizAnswers[slide.id]} onAnswer={handleQuizAnswer} />
                </>
              )}
              {activeTab === 'build' && (
                <BuildPanel
                  build={learn.build}
                  copiedTask={copiedTask}
                  onCopy={handleCopyPrompt}
                />
              )}
              {activeTab === 'present' && (
                <PresentPanel
                  present={learn.present}
                  question={slide.question}
                  reflection={answerText} setReflection={setAnswerText}
                  onSaveReflection={handleSubmitAnswer}
                  saved={alreadySubmitted}
                  rating={ratings[slide.id] || 0}
                  onRate={handleRate}
                />
              )}
            </div>
          </>
        ) : slide.question ? (
          <div style={{ background: '#152347', borderRadius: 12, padding: 16 }}>
            <div style={{ color: '#F59E0B', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>QUESTION</div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 12, lineHeight: 1.4 }}>{slide.question.prompt}</div>
            <textarea value={answerText} onChange={e => setAnswerText(e.target.value)} placeholder={slide.question.placeholder}
              style={{ width: '100%', minHeight: 80, background: '#0D1B3D', border: '1px solid #2E3347', borderRadius: 8, padding: 10, color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" }} />
            <button onClick={handleSubmitAnswer} disabled={!answerText.trim()} style={{
              width: '100%', marginTop: 10, background: answerText.trim() ? '#0D9488' : '#475569',
              color: '#fff', border: 'none', padding: 12, borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: answerText.trim() ? 'pointer' : 'not-allowed'
            }}>
              {alreadySubmitted ? '✓ Update Answer' : 'Submit Answer'}
            </button>
            {alreadySubmitted && <div style={{ color: '#2dd4bf', fontSize: 11, textAlign: 'center', marginTop: 8 }}>✓ Your answer is live on the facilitator's screen</div>}
          </div>
        ) : (
          <div style={{ background: '#152347', borderRadius: 12, padding: 16, textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
            No question on this slide — just follow along.
          </div>
        )}

        <div style={{ textAlign: 'center', color: '#475569', fontSize: 10, marginTop: 16 }}>
          The facilitator controls slide navigation · This screen updates automatically
        </div>
      </div>
    </div>
  )
}
