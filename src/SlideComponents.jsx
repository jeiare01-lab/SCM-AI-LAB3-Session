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
