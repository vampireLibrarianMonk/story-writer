import { useState } from 'react'
import CharacterEditor from './CharacterEditor'

interface Props {
  project: string
  onBack: () => void
}

export default function Editor({ project, onBack }: Props) {
  const stateKey = `story-writer-state-${project}`
  const contentKey = `story-writer-content-${project}`
  const chaptersKey = `story-writer-chapters-${project}`

  const [content, setContent] = useState(() => localStorage.getItem(contentKey) || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [charEditorOpen, setCharEditorOpen] = useState(false)

  const [styleOpen, setStyleOpen] = useState(false)
  const ALL_VOICES = ['Tom Clancy', 'J.R.R. Tolkien', 'Stephen King', 'J.K. Rowling', 'Hemingway', 'Cormac McCarthy', 'Raymond Chandler', 'Terry Pratchett']
  const [voices, setVoices] = useState<{ name: string; weight: number }[]>(() => {
    const stored = localStorage.getItem(`story-writer-voices-${project}`)
    return stored ? JSON.parse(stored) : [{ name: 'Tom Clancy', weight: 60 }, { name: 'J.R.R. Tolkien', weight: 40 }]
  })
  const [showVoicePicker, setShowVoicePicker] = useState(false)

  // Chapters
  const [chapters, setChapters] = useState<{ title: string; id: string }[]>(() => {
    const stored = localStorage.getItem(chaptersKey)
    return stored ? JSON.parse(stored) : []
  })
  const [activeChapter, setActiveChapter] = useState<string>(chapters[0]?.id || '')
  const [newChapterTitle, setNewChapterTitle] = useState('')

  // Characters from localStorage
  const characters: { id: string; name: string }[] = (() => {
    const stored = localStorage.getItem(`story-writer-characters-${project}`)
    return stored ? JSON.parse(stored) : []
  })()

  const updateWeight = (idx: number, weight: number) => {
    const updated = [...voices]
    updated[idx].weight = weight
    setVoices(updated)
    localStorage.setItem(`story-writer-voices-${project}`, JSON.stringify(updated))
  }
  const removeVoice = (idx: number) => {
    const updated = voices.filter((_, i) => i !== idx)
    setVoices(updated)
    localStorage.setItem(`story-writer-voices-${project}`, JSON.stringify(updated))
  }
  const addVoice = (name: string) => {
    const updated = [...voices, { name, weight: 20 }]
    setVoices(updated)
    setShowVoicePicker(false)
    localStorage.setItem(`story-writer-voices-${project}`, JSON.stringify(updated))
  }
  const totalWeight = voices.reduce((s, v) => s + v.weight, 0)

  const saveContent = (text: string) => {
    setContent(text)
    localStorage.setItem(contentKey, text)
    const lines = text.trim().split('\n').filter(Boolean)
    const lastLine = lines[lines.length - 1]?.trim() || ''
    const existing = JSON.parse(localStorage.getItem(stateKey) || '{}')
    localStorage.setItem(stateKey, JSON.stringify({ ...existing, lastLine }))
  }

  const addChapter = () => {
    if (!newChapterTitle.trim()) return
    const id = crypto.randomUUID().slice(0, 8)
    const updated = [...chapters, { title: newChapterTitle.trim(), id }]
    setChapters(updated)
    setActiveChapter(id)
    setNewChapterTitle('')
    localStorage.setItem(chaptersKey, JSON.stringify(updated))
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const doSearch = () => {
    if (!searchQuery.trim()) return
    // Placeholder — real impl calls /api/search
    setSearchResults([`Searching corpus for "${searchQuery}"... (connect OpenSearch for real results)`])
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-[#2D2D3D] bg-[#0A0A0F] shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-[#6B7280] hover:text-[#E2E2E8]">←</button>
          <span className="font-semibold">⚓ {project}</span>
          {activeChapter && <span className="text-[#6B7280]">{chapters.find(c => c.id === activeChapter)?.title}</span>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStyleOpen(!styleOpen)}
            className="text-xs px-2 py-1 rounded bg-[#D946EF]/10 text-[#D946EF] hover:bg-[#D946EF]/20 transition-colors"
          >
            🎨 {voices.map(v => `${v.name.split(' ').pop()} ${Math.round(v.weight / totalWeight * 100)}`).join(' / ')}
          </button>
          <span className="text-[#6B7280] text-sm">{wordCount} words</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <aside className="w-48 border-r border-[#2D2D3D] p-3 space-y-4 bg-[#1A1A2E] shrink-0 overflow-y-auto">
          <div>
            <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-2">Chapters</div>
            <ul className="space-y-1 text-sm">
              {chapters.map((ch, i) => (
                <li
                  key={ch.id}
                  onClick={() => setActiveChapter(ch.id)}
                  className={`px-2 py-1 rounded cursor-pointer ${ch.id === activeChapter ? 'text-[#E2E2E8] bg-[#06B6D4]/10 border-l-2 border-[#06B6D4]' : 'text-[#6B7280] hover:text-[#E2E2E8]'}`}
                >
                  {i + 1}. {ch.title}
                </li>
              ))}
            </ul>
            <div className="flex gap-1 mt-2">
              <input
                value={newChapterTitle}
                onChange={e => setNewChapterTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addChapter()}
                placeholder="New chapter..."
                className="flex-1 bg-transparent border-b border-[#2D2D3D] text-xs text-[#E2E2E8] placeholder-[#6B7280] outline-none"
              />
              <button onClick={addChapter} className="text-xs text-[#06B6D4]">+</button>
            </div>
          </div>
          <div>
            <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-2">Characters</div>
            <ul className="space-y-1 text-sm">
              {characters.map((c: { id: string; name: string }) => (
                <li key={c.id} className="text-[#E2E2E8] px-2 py-1 cursor-pointer hover:text-[#06B6D4]" onClick={() => setCharEditorOpen(true)}>
                  {c.name}
                </li>
              ))}
              {characters.length === 0 && <li className="text-[#6B7280] text-xs px-2">No characters yet</li>}
            </ul>
            <button onClick={() => setCharEditorOpen(true)} className="text-xs text-[#06B6D4] hover:text-[#22D3EE] mt-1 px-2">
              {characters.length > 0 ? 'Edit →' : '+ Create character'}
            </button>
          </div>
          <div>
            <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-2">
              Entities
            </div>
            <button className="text-xs text-[#06B6D4] hover:text-[#22D3EE]">Review queue →</button>
          </div>
        </aside>

        {/* Editor canvas */}
        <main className="flex-1 flex flex-col bg-[#0D0D14] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-[65ch] mx-auto">
              <textarea
                value={content}
                onChange={(e) => saveContent(e.target.value)}
                className="w-full h-full min-h-[60vh] bg-transparent text-[#E2E2E8] editor-font text-lg leading-relaxed outline-none resize-none"
                placeholder="Start writing..."
              />
            </div>
          </div>
          <div className="border-t border-[#2D2D3D] px-4 py-2 bg-[#0A0A0F]">
            <input
              type="text"
              placeholder="/ type a command..."
              className="w-full bg-transparent text-[#6B7280] text-sm outline-none placeholder-[#6B7280]"
            />
          </div>
        </main>

        {/* Right panel */}
        <aside className="w-72 border-l border-[#2D2D3D] bg-[#1A1A2E] shrink-0 flex flex-col overflow-hidden">
          {/* Style mixer */}
          {styleOpen && (
            <div className="p-4 border-b border-[#2D2D3D] space-y-3">
              <div className="text-xs uppercase tracking-wider text-[#6B7280]">Style Mixer</div>
              {voices.map((v, i) => (
                <div key={v.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{v.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#06B6D4]">{Math.round(v.weight / totalWeight * 100)}%</span>
                      <button onClick={() => removeVoice(i)} className="text-[#6B7280] hover:text-red-400 text-xs">×</button>
                    </div>
                  </div>
                  <input
                    type="range" min="0" max="100"
                    value={v.weight}
                    onChange={(e) => updateWeight(i, +e.target.value)}
                    className="w-full accent-[#06B6D4]"
                  />
                </div>
              ))}
              {showVoicePicker ? (
                <div className="bg-[#0D0D14] border border-[#2D2D3D] rounded p-2 space-y-1 max-h-40 overflow-y-auto">
                  {ALL_VOICES.filter(n => !voices.some(v => v.name === n)).map(name => (
                    <button
                      key={name}
                      onClick={() => addVoice(name)}
                      className="block w-full text-left text-sm px-2 py-1 rounded hover:bg-[#2D2D3D] text-[#E2E2E8]"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ) : (
                <button onClick={() => setShowVoicePicker(true)} className="text-xs text-[#06B6D4] hover:text-[#22D3EE]">+ Add voice</button>
              )}
            </div>
          )}

          {/* Reference search */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            <div className="text-xs uppercase tracking-wider text-[#6B7280]">🔍 Reference Search</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search corpus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                className="flex-1 bg-[#0D0D14] border border-[#2D2D3D] rounded px-2 py-1 text-sm text-[#E2E2E8] outline-none focus:border-[#06B6D4]"
              />
              <button onClick={doSearch} className="text-[#06B6D4] text-sm">Go</button>
            </div>
            {searchResults.map((r, i) => (
              <div key={i} className="bg-[#0D0D14] border border-[#2D2D3D] rounded p-3 text-xs text-[#E2E2E8] leading-relaxed">
                {r}
              </div>
            ))}

            {/* Consistency */}
            <div className="pt-4 border-t border-[#2D2D3D]">
              <div className="text-xs uppercase tracking-wider text-[#6B7280] mb-2">🛡️ Consistency</div>
              <div className="text-xs text-[#10B981]">✓ No issues detected</div>
            </div>
          </div>
        </aside>
      </div>

      {charEditorOpen && (
        <CharacterEditor project={project} onClose={() => setCharEditorOpen(false)} />
      )}
    </div>
  )
}
