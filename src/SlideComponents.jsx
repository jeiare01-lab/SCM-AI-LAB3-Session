export function SlideBody({ slide }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      {slide.body.map((block, bi) => {
        if (block.type === 'layers') {
          return (
            <div key={bi} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {block.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#152347', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: it.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, color: '#fff', fontWeight: 700, fontSize: 13 }}>{it.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: it.tagColor === '#16A34A' ? '#fff' : '#0D1B3D', background: it.tagColor, padding: '2px 8px', borderRadius: 4 }}>{it.tag}</div>
                </div>
              ))}
            </div>
          )
        }
        if (block.type === 'modgrid') {
          return (
            <div key={bi} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8 }}>
              {block.items.map((m, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'inline-block', background: m.color, color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 6px', width: 'fit-content' }}>{m.num}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{m.title}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: m.color, marginTop: 'auto' }}>{m.time}</div>
                </div>
              ))}
            </div>
          )
        }
        if (block.type === 'pillars') {
          return (
            <div key={bi} style={{ display: 'flex', gap: 8 }}>
              {block.items.map((p, i) => (
                <div key={i} style={{ flex: 1, background: '#152347', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{p.icon}</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{p.title}</div>
                  <div style={{ color: '#94A3B8', fontSize: 10.5, lineHeight: 1.4 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          )
        }
        if (block.type === 'costbar') {
          return (
            <div key={bi} style={{ background: '#0D1B3D', borderRadius: 8, padding: '10px 14px', color: '#F59E0B', fontWeight: 700, fontSize: 12, textAlign: 'center' }}>
              {block.text}
            </div>
          )
        }
        if (block.type === 'modcards') {
          return (
            <div key={bi} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8 }}>
              {block.items.map((m, i) => (
                <div key={i} style={{
                  background: m.riskColor ? 'rgba(239,68,68,0.1)' : '#152347',
                  border: m.highlight ? `1px solid ${m.riskColor ? '#ef4444' : '#1E40AF'}` : 'none',
                  borderRadius: 8, padding: 10
                }}>
                  <div style={{ display: 'inline-block', background: '#F59E0B', color: '#0D1B3D', fontSize: 9, fontWeight: 700, borderRadius: 3, padding: '1px 6px', marginBottom: 5 }}>{m.q}</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 11.5, marginBottom: 3 }}>{m.title}</div>
                  <div style={{ color: '#60a5fa', fontSize: 9.5, marginBottom: 4 }}>{m.sbu}</div>
                  <div style={{ color: '#94A3B8', fontSize: 9.5, lineHeight: 1.4 }}>{m.body}</div>
                </div>
              ))}
            </div>
          )
        }
        if (block.type === 'note2') {
          return (
            <div key={bi} style={{
              background: block.danger ? 'rgba(239,68,68,0.1)' : 'rgba(30,64,175,0.12)',
              border: `1px solid ${block.danger ? 'rgba(239,68,68,0.3)' : 'rgba(30,64,175,0.3)'}`,
              borderRadius: 8, padding: 10, color: block.danger ? '#fca5a5' : '#BFDBFE', fontSize: 11, lineHeight: 1.5
            }}>
              {block.text}
            </div>
          )
        }
        if (block.type === 'handoffs') {
          return (
            <div key={bi} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {block.items.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#152347', borderRadius: 8, padding: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: h.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{h.n}</div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 11.5 }}>{h.from}</div>
                    <div style={{ color: '#F59E0B', fontSize: 10 }}>{h.owner}</div>
                    <div style={{ color: '#94A3B8', fontSize: 10 }}>{h.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
        if (block.type === 'capsteps') {
          return (
            <div key={bi} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {block.items.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#152347', borderRadius: 8, padding: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#F59E0B', color: '#0D1B3D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{c.n}</div>
                  <div>
                    <div style={{ color: '#F59E0B', fontWeight: 700, fontSize: 10.5 }}>{c.label}</div>
                    <div style={{ color: '#94A3B8', fontSize: 10.5 }}>{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
        if (block.type === 'questions3') {
          return (
            <div key={bi} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {block.items.map((q, i) => (
                <div key={i} style={{ background: '#152347', borderRadius: 8, padding: 12, color: '#e8eaf0', fontSize: 12, lineHeight: 1.5 }}>{q}</div>
              ))}
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

export function SlideFrame({ slide, children }) {
  return (
    <div style={{
      background: slide.id === 1 ? '#0D1B3D' : (slide.layerTag === 'L3' ? '#061A18' : slide.layerTag === '★' ? '#1E293B' : '#0A1628'),
      borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%'
    }}>
      <div style={{ background: slide.color, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: 0.5, fontFamily: "'Space Grotesk',sans-serif" }}>{slide.heading}</div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10.5 }}>{slide.sub}</div>
      </div>
      <div style={{ flex: 1, padding: 14, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

export function DialoguePanel({ slide }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, height: '100%', overflowY: 'auto', paddingRight: 2 }}>
      {slide.dialogue.map((b, i) => {
        if (b.type === 'timing') {
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1E293B', borderRadius: 5, padding: '6px 10px' }}>
              <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 10 }}>⏱ {b.time}</span>
              <span style={{ color: '#CBD5E1', fontSize: 9 }}>·</span>
              <span style={{ color: '#94A3B8', fontSize: 10 }}>{b.phase}</span>
            </div>
          )
        }
        if (b.type === 'phase') {
          return (
            <div key={i} style={{ background: slide.color, color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: 10, letterSpacing: 0.5, borderRadius: 5, padding: '5px 8px' }}>
              {b.text}
            </div>
          )
        }
        if (b.type === 'note') {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, background: '#FFFBEB', border: '1px solid #FDE68A', borderLeft: '3px solid #F59E0B', borderRadius: '0 6px 6px 0', padding: '7px 10px' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#F59E0B', whiteSpace: 'nowrap' }}>✎ NOTE</span>
              <span style={{ fontSize: 10.5, color: '#78350F', fontStyle: 'italic', lineHeight: 1.5 }}>{b.text}</span>
            </div>
          )
        }
        if (b.type === 'tip') {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', borderLeft: '3px solid #1E40AF', borderRadius: '0 6px 6px 0', padding: '7px 10px' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#1E40AF', whiteSpace: 'nowrap' }}>💻 VIRTUAL TIP</span>
              <span style={{ fontSize: 10.5, color: '#1E3A8A', fontStyle: 'italic', lineHeight: 1.5 }}>{b.text}</span>
            </div>
          )
        }
        return (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: slide.color, color: '#fff', fontSize: 8.5, fontWeight: 700, borderRadius: 4, padding: '4px 7px', height: 'fit-content', whiteSpace: 'nowrap', flexShrink: 0 }}>FACILITATOR</div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '7px 10px', fontSize: 10.5, color: '#1E293B', lineHeight: 1.5 }}>{b.text}</div>
          </div>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// READ CONTENT — full lesson reading material (merged from standalone app)
// ════════════════════════════════════════════════════════════════════════════
export function ReadContent({ learn }) {
  if (!learn || !learn.read) return <div style={{ color:'#94A3B8', fontSize:12, textAlign:'center', marginTop:30 }}>No reading content for this slide.</div>
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {learn.read.cards.map((card, ci) => (
        <div key={ci} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:10, padding:16 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0D1B3D', marginBottom:10, fontFamily:"'Space Grotesk',sans-serif" }}>{card.title}</div>

          {card.paras && card.paras.map((p,pi)=>(
            <p key={pi} style={{ fontSize:12.5, color:'#475569', lineHeight:1.7, marginBottom:8 }}>{p}</p>
          ))}

          {card.callout && (
            <div style={{ background:'rgba(30,64,175,0.06)', border:'1px solid rgba(30,64,175,0.2)', borderRadius:8, padding:12, marginTop:8 }}>
              <div style={{ fontSize:9, fontWeight:700, color:'#1E40AF', letterSpacing:1, textTransform:'uppercase', marginBottom:5 }}>{card.callout.label}</div>
              <div style={{ fontSize:12, color:'#334155', lineHeight:1.6 }}>{card.callout.text}</div>
            </div>
          )}

          {card.pillars && (
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {card.pillars.map((p,pi)=>(
                <div key={pi} style={{ flex:'1 1 160px', background:'#F8FAFC', borderRadius:8, padding:12, textAlign:'center' }}>
                  <div style={{ width:34, height:34, borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, margin:'0 auto 8px' }}>{p.icon}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#1E293B', marginBottom:5 }}>{p.title}</div>
                  <div style={{ fontSize:11, color:'#64748B', lineHeight:1.5 }}>{p.body}</div>
                </div>
              ))}
            </div>
          )}

          {card.modules && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {card.modules.map((m,mi)=>(
                <div key={mi} style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#F8FAFC', borderRadius:8, padding:10 }}>
                  <div style={{ fontSize:16 }}>{m.icon}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#1E293B', marginBottom:3 }}>{m.title}</div>
                    <div style={{ fontSize:11, color:'#64748B', lineHeight:1.5 }}>{m.body}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {card.layers && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {card.layers.map((l,li)=>(
                <div key={li} style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#F8FAFC', borderRadius:8, padding:10 }}>
                  <div style={{ width:30, height:30, borderRadius:6, background:l.color, color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{l.tag}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#1E293B', marginBottom:3 }}>{l.name}</div>
                    <div style={{ fontSize:11, color:'#64748B', lineHeight:1.5 }}>{l.body}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {card.handoffPairs && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {card.handoffPairs.map((h,hi)=>(
                <div key={hi} style={{ background:'rgba(30,64,175,0.05)', border:'1px solid rgba(30,64,175,0.15)', borderRadius:8, padding:10 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#1E40AF', letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>{h.label}</div>
                  <div style={{ fontSize:11.5, color:'#334155', lineHeight:1.6 }}>{h.text}</div>
                </div>
              ))}
            </div>
          )}

          {card.list && (
            <ul style={{ margin:0, paddingLeft:0, listStyle:'none', display:'flex', flexDirection:'column', gap:6 }}>
              {card.list.map((item,ii)=>(
                <li key={ii} style={{ fontSize:11.5, color:'#475569', lineHeight:1.5, display:'flex', gap:7 }}>
                  <span style={{ color:'#0D9488', fontWeight:700, flexShrink:0 }}>✓</span>{item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE CHECK QUIZ
// ════════════════════════════════════════════════════════════════════════════
export function QuizCard({ quiz, quizState, onAnswer }) {
  if (!quiz) return null
  const answered = quizState !== undefined
  return (
    <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:10, padding:16, marginTop:14 }}>
      <div style={{ fontSize:13, fontWeight:600, color:'#1E293B', marginBottom:12, lineHeight:1.5 }}>{quiz.q}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {quiz.options.map((opt, oi) => {
          let bg='transparent', border='#E2E8F0', color='#475569'
          if (answered) {
            if (oi === quiz.correctIndex) { bg='rgba(13,148,136,0.1)'; border='#0D9488'; color='#0D9488' }
            else if (oi === quizState) { bg='rgba(192,57,43,0.1)'; border='#C0392B'; color='#f87171' }
          }
          return (
            <button key={oi} disabled={answered} onClick={()=>onAnswer(oi)} style={{
              padding:'9px 13px', border:`1px solid ${border}`, borderRadius:7, background:bg, color,
              fontSize:12, textAlign:'left', cursor:answered?'default':'pointer', transition:'all .15s'
            }}>{String.fromCharCode(65+oi)}. {opt}</button>
          )
        })}
      </div>
      {answered && (
        <div style={{
          marginTop:10, fontSize:11.5, padding:'8px 12px', borderRadius:7,
          background: quizState===quiz.correctIndex ? 'rgba(13,148,136,0.1)' : 'rgba(192,57,43,0.1)',
          color: quizState===quiz.correctIndex ? '#0D9488' : '#f87171'
        }}>
          {quizState===quiz.correctIndex ? '✓ Correct! ' : '✗ Not quite — the correct answer is highlighted above. '}{quiz.explain}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// BUILD PANEL — Embedded AI assistant (calls Vercel serverless proxy, no key in browser)
// ════════════════════════════════════════════════════════════════════════════
export function BuildPanel({ build, aiInput, setAiInput, aiResponse, aiLoading, aiError, onAsk }) {
  if (!build) return <div style={{ color:'#94A3B8', fontSize:12, textAlign:'center', marginTop:30 }}>No build challenge for this slide.</div>

  return (
    <div>
      <div style={{ background:'#0A1628', border:'1px solid #2E3347', borderRadius:10, padding:16, marginBottom:14 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#F59E0B', letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>🔧 Build Challenge</div>
        <div style={{ fontSize:12.5, color:'#c8d0e0', lineHeight:1.6, marginBottom:12 }}>{build.scenario}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {build.tasks.map((t, ti) => (
            <button key={ti} onClick={() => onAsk(`${build.scenario}\n\n${t}`)} style={{
              display:'flex', gap:8, alignItems:'flex-start', textAlign:'left',
              background:'#152347', border:'1px solid #2E3347', borderRadius:8, padding:'9px 11px',
              cursor:'pointer', transition:'border-color .15s'
            }}>
              <span style={{ background:'#F59E0B', color:'#0D1B3D', borderRadius:'50%', width:17, height:17, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, flexShrink:0, marginTop:1 }}>{ti+1}</span>
              <span style={{ fontSize:11.5, color:'#cbd5e1', lineHeight:1.45 }}>{t}</span>
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={aiInput} onChange={e => setAiInput(e.target.value)}
        placeholder={build.placeholder}
        style={{ width:'100%', minHeight:80, background:'#152347', border:'1px solid #2E3347', borderRadius:8, padding:12, color:'#fff', fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:"'Inter',sans-serif" }}
      />
      <button onClick={() => onAsk(aiInput)} disabled={aiLoading || !aiInput.trim()} style={{
        marginTop:10, background: aiLoading ? '#475569' : '#1E40AF', color:'#fff', border:'none', padding:'10px 20px',
        borderRadius:7, fontSize:12, fontWeight:600, cursor: aiLoading || !aiInput.trim() ? 'not-allowed' : 'pointer',
        display:'flex', alignItems:'center', gap:7
      }}>
        {aiLoading ? (<><span style={spinnerStyle}/> Thinking...</>) : '✨ Ask PGB AI Assistant'}
      </button>

      {aiError && (
        <div style={{ background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:8, padding:12, marginTop:12, fontSize:12, color:'#fca5a5' }}>
          {aiError}
        </div>
      )}

      {aiResponse && !aiError && (
        <div style={{ background:'#0D1B3D', border:'1px solid rgba(30,64,175,0.3)', borderRadius:8, padding:14, marginTop:12, fontSize:12.5, color:'#c8d0e0', lineHeight:1.7, whiteSpace:'pre-wrap' }}>
          <div style={{ fontSize:9, fontWeight:700, color:'#60a5fa', letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>PGB AI Assistant</div>
          {aiResponse}
        </div>
      )}
    </div>
  )
}

const spinnerStyle = {
  display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)',
  borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite'
}

// ════════════════════════════════════════════════════════════════════════════
// PRESENT PANEL — framework + reflection
// ════════════════════════════════════════════════════════════════════════════
export function PresentPanel({ present, question, reflection, setReflection, onSaveReflection, saved, rating, onRate }) {
  return (
    <div>
      {present && present.framework && (
        <div style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:10, padding:14, marginBottom:14 }}>
          <div style={{ fontSize:9, fontWeight:700, color:'#F59E0B', letterSpacing:1, textTransform:'uppercase', marginBottom:7 }}>🎤 Presentation Framework</div>
          <div style={{ fontSize:12, color:'#c8d0e0', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{present.framework}</div>
        </div>
      )}
      {question && (
        <div style={{ background:'#152347', borderRadius:10, padding:16 }}>
          <div style={{ color:'#F59E0B', fontSize:10, fontWeight:700, letterSpacing:0.5, marginBottom:6 }}>QUESTION</div>
          <div style={{ color:'#fff', fontSize:13.5, fontWeight:600, marginBottom:12, lineHeight:1.4 }}>{question.prompt}</div>
          <textarea
            value={reflection} onChange={e=>setReflection(e.target.value)} placeholder={question.placeholder}
            style={{ width:'100%', minHeight:80, background:'#0D1B3D', border:'1px solid #2E3347', borderRadius:8, padding:10, color:'#fff', fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:"'Inter',sans-serif" }}
          />
          <button onClick={onSaveReflection} disabled={!reflection.trim()} style={{
            width:'100%', marginTop:10, background: reflection.trim() ? '#0D9488' : '#475569',
            color:'#fff', border:'none', padding:12, borderRadius:8, fontWeight:700, fontSize:13,
            cursor: reflection.trim() ? 'pointer' : 'not-allowed'
          }}>
            {saved ? '✓ Update Answer' : 'Submit Answer'}
          </button>
          {saved && <div style={{ color:'#2dd4bf', fontSize:11, textAlign:'center', marginTop:8 }}>✓ Your answer is live on the facilitator's screen</div>}
        </div>
      )}
      {onRate && (
        <div style={{ background:'#152347', borderRadius:10, padding:16, marginTop:14 }}>
          <div style={{ color:'#fff', fontSize:12, fontWeight:700, marginBottom:8 }}>⭐ Rate This Lesson</div>
          <div style={{ display:'flex', gap:6 }}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>onRate(n)} style={{
                width:34, height:34, borderRadius:7, border:'1px solid #2E3347',
                background: rating>=n ? '#F59E0B' : 'transparent', color: rating>=n ? '#0D1B3D' : '#94A3B8',
                fontSize:14, cursor:'pointer', fontWeight:700
              }}>{n}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
