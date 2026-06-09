import { useState, useEffect } from 'react'
import { fetchCharacters, fetchChapters } from '../api'

interface Props {
  project: string
  onContinue: () => void
  onBack: () => void
  isNew?: boolean
}

export default function Briefing({ project, onContinue, onBack, isNew }: Props) {
  const [characters, setCharacters] = useState<{ name: string }[]>([])
  const [chapters, setChapters] = useState<{ title: string }[]>([])
  const [briefing, setBriefing] = useState<{ project_name?: string; last_line?: string; next_beats?: string[]; notes?: string[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchCharacters(project).then(setCharacters),
      fetchChapters(project).then(setChapters),
      fetch(`/api/projects/${encodeURIComponent(project)}/briefing`).then(r => r.ok ? r.json() : null).then(setBriefing).catch(() => null),
    ]).finally(() => setLoading(false))
  }, [project])

  const hasContent = characters.length > 0 || chapters.length > 0
  const displayName = briefing?.project_name || project.replace(/-/g, ' ')

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[#6B7280]">Loading...</div>
      </div>
    )
  }

  if (isNew && !hasContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 animate-[fadeIn_0.6s_ease-in]">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="text-[#06B6D4] text-sm tracking-widest uppercase mb-2">New World</div>
            <h1 className="text-3xl font-bold">🔥 {displayName}</h1>
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
            <button onClick={onContinue} className="bg-[#06B6D4] text-[#0A0A0F] font-semibold px-6 py-3 rounded-lg hover:bg-[#22D3EE] transition-colors">
              ▶ Start Writing
            </button>
            <button onClick={onBack} className="text-[#6B7280] px-4 py-3 hover:text-[#E2E2E8] transition-colors">← Back</button>
          </div>
        </div>
      </div>
    )
  }

  // Existing project with content — show immersion briefing
  const lastLine = briefing?.last_line || ''
  const beats = briefing?.next_beats || []

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-[fadeIn_0.6s_ease-in]">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="text-[#06B6D4] text-sm tracking-widest uppercase mb-2">Returning to</div>
          <h1 className="text-3xl font-bold">⚓ {displayName}</h1>
        </div>

        <div className="bg-[#1A1A2E] border border-[#2D2D3D] rounded-xl p-8 space-y-6">
          {/* World status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0D0D14] rounded-lg p-4">
              <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-1">Characters</div>
              <div className="text-2xl font-bold text-[#E2E2E8]">{characters.length}</div>
              <div className="text-xs text-[#6B7280] mt-1 truncate">
                {characters.slice(0, 3).map(c => c.name).join(', ')}{characters.length > 3 ? '...' : ''}
              </div>
            </div>
            <div className="bg-[#0D0D14] rounded-lg p-4">
              <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-1">Chapters</div>
              <div className="text-2xl font-bold text-[#E2E2E8]">{chapters.length}</div>
              <div className="text-xs text-[#6B7280] mt-1 truncate">
                {chapters.length > 0 ? chapters[chapters.length - 1].title : 'None yet'}
              </div>
            </div>
          </div>

          {lastLine && (
            <div>
              <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-2">Last Time</div>
              <p className="text-[#E2E2E8] italic leading-relaxed">"{lastLine}"</p>
            </div>
          )}

          {!lastLine && (
            <div>
              <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-2">Status</div>
              <p className="text-[#E2E2E8]">Your world awaits — pick up where you left off.</p>
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
          <button onClick={onContinue} className="bg-[#06B6D4] text-[#0A0A0F] font-semibold px-6 py-3 rounded-lg hover:bg-[#22D3EE] transition-colors">
            ▶ Continue Writing
          </button>
          <button onClick={onBack} className="text-[#6B7280] px-4 py-3 hover:text-[#E2E2E8] transition-colors">← Back</button>
        </div>
      </div>
    </div>
  )
}
