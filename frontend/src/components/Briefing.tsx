interface Props {
  project: string
  onContinue: () => void
  onBack: () => void
  isNew?: boolean
}

export default function Briefing({ project, onContinue, onBack, isNew }: Props) {
  if (isNew) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 animate-[fadeIn_0.6s_ease-in]">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="text-[#06B6D4] text-sm tracking-widest uppercase mb-2">New World</div>
            <h1 className="text-3xl font-bold">🔥 {project}</h1>
          </div>

          <div className="bg-[#1A1A2E] border border-[#2D2D3D] rounded-xl p-8 space-y-4">
            <p className="text-[#E2E2E8] leading-relaxed">
              Your world is empty — a blank canvas. Start by:
            </p>
            <ul className="space-y-2 text-[#E2E2E8]">
              <li className="flex items-center gap-2"><span className="text-[#06B6D4]">1.</span> Writing your first scene</li>
              <li className="flex items-center gap-2"><span className="text-[#06B6D4]">2.</span> Importing reference material (drag & drop .txt files)</li>
              <li className="flex items-center gap-2"><span className="text-[#06B6D4]">3.</span> Setting your voice blend in the style mixer</li>
            </ul>
            <p className="text-[#6B7280] text-sm mt-4">
              Characters, abilities, and locations will be detected automatically as you write.
            </p>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={onContinue}
              className="bg-[#06B6D4] text-[#0A0A0F] font-semibold px-6 py-3 rounded-lg hover:bg-[#22D3EE] transition-colors"
            >
              ▶ Start Writing
            </button>
            <button
              onClick={onBack}
              className="text-[#6B7280] px-4 py-3 hover:text-[#E2E2E8] transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Existing project briefing — load from localStorage
  const stored = localStorage.getItem(`story-writer-state-${project}`)
  const state = stored ? JSON.parse(stored) : null
  const lastLine = state?.lastLine || ''
  const chapterTitle = state?.chapterTitle || 'Chapter 1'
  const beats = state?.beats || []

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-[fadeIn_0.6s_ease-in]">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="text-[#06B6D4] text-sm tracking-widest uppercase mb-2">Returning to</div>
          <h1 className="text-3xl font-bold">⚓ {project}</h1>
          <div className="text-[#6B7280] mt-2">{chapterTitle}</div>
        </div>

        <div className="bg-[#1A1A2E] border border-[#2D2D3D] rounded-xl p-8 space-y-6">
          {lastLine && (
            <div>
              <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-2">Last Time</div>
              <p className="editor-font text-[#E2E2E8] italic leading-relaxed">"{lastLine}"</p>
            </div>
          )}

          {!lastLine && (
            <div>
              <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-2">Status</div>
              <p className="text-[#E2E2E8]">No writing yet — pick up where you left off or start fresh.</p>
            </div>
          )}

          {beats.length > 0 && (
            <div>
              <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-2">Next Beats</div>
              <ul className="space-y-1 text-[#E2E2E8]">
                {beats.map((b: string, i: number) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-[#06B6D4]">•</span> {b}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onContinue}
            className="bg-[#06B6D4] text-[#0A0A0F] font-semibold px-6 py-3 rounded-lg hover:bg-[#22D3EE] transition-colors"
          >
            ▶ Continue Writing
          </button>
          <button className="border border-[#2D2D3D] text-[#E2E2E8] px-4 py-3 rounded-lg hover:border-[#6B7280] transition-colors">
            ↺ Reread
          </button>
          <button
            onClick={onBack}
            className="text-[#6B7280] px-4 py-3 hover:text-[#E2E2E8] transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}
