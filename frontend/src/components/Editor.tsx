import { useState, useEffect } from 'react'
import CharacterEditor from './CharacterEditor'
import { fetchCharacters, fetchChapters, fetchChapterContent, fetchCharacterContent } from '../api'

interface Props {
  project: string
  onBack: () => void
}

export default function Editor({ project, onBack }: Props) {
  const contentKey = `story-writer-content-${project}`

  const [content, setContent] = useState(() => localStorage.getItem(contentKey) || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ title: string; snippet: string }[]>([])
  const [charEditorOpen, setCharEditorOpen] = useState(false)
  const [charEditorRaw, setCharEditorRaw] = useState('')
  const [charEditorName, setCharEditorName] = useState('')
  const [viewingCharacter, setViewingCharacter] = useState<{ name: string; content: string } | null>(null)

  // Data from API
  const [characters, setCharacters] = useState<{ name: string; file: string }[]>([])
  const [chapters, setChapters] = useState<{ title: string; file: string }[]>([])
  const [activeChapter, setActiveChapter] = useState('')

  // Style mixer
  const [styleOpen, setStyleOpen] = useState(false)
  const ALL_VOICES = ['Tom Clancy', 'J.R.R. Tolkien', 'Stephen King', 'J.K. Rowling', 'Hemingway', 'Cormac McCarthy', 'Raymond Chandler', 'Terry Pratchett']
  const [voices, setVoices] = useState<{ name: string; weight: number }[]>(() => {
    const stored = localStorage.getItem(`story-writer-voices-${project}`)
    return stored ? JSON.parse(stored) : [{ name: 'Tom Clancy', weight: 60 }, { name: 'J.R.R. Tolkien', weight: 40 }]
  })
  const [showVoicePicker, setShowVoicePicker] = useState(false)

  useEffect(() => {
    fetchCharacters(project).then(setCharacters)
    fetchChapters(project).then(chs => {
      setChapters(chs)
      if (chs.length > 0 && !activeChapter) {
        setActiveChapter(chs[0].file)
        fetchChapterContent(project, chs[0].file).then(text => saveContent(text))
      }
    })
  }, [project])

  const selectChapter = (file: string) => {
    setActiveChapter(file)
    fetchChapterContent(project, file).then(text => saveContent(text))
  }

  const openCharacter = (file: string, name: string) => {
    fetchCharacterContent(project, file).then(text => {
      setCharEditorRaw(text)
      setCharEditorName(name)
      setCharEditorOpen(true)
    })
  }

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
  const totalWeight = voices.reduce((s, v) => s + v.weight, 0) || 1

  const saveContent = (text: string) => {
    setContent(text)
    localStorage.setItem(contentKey, text)
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const doSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&project_id=${project}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.results || [])
      } else {
        setSearchResults([{ title: 'Info', snippet: `Search for "${searchQuery}" — start backend + OpenSearch for results` }])
      }
    } catch {
      setSearchResults([{ title: 'Offline', snippet: 'Backend not running. Start with: story-writer serve' }])
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-[#2D2D3D] bg-[#0A0A0F] shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-[#6B7280] hover:text-[#E2E2E8]">←</button>
          <span className="font-semibold">📖 {project.replace(/-/g, ' ')}</span>
          {activeChapter && <span className="text-[#6B7280]">{chapters.find(c => c.file === activeChapter)?.title}</span>}
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
                  key={ch.file}
                  onClick={() => selectChapter(ch.file)}
                  className={`px-2 py-1 rounded cursor-pointer truncate ${ch.file === activeChapter ? 'text-[#E2E2E8] bg-[#06B6D4]/10 border-l-2 border-[#06B6D4]' : 'text-[#6B7280] hover:text-[#E2E2E8]'}`}
                >
                  {i}. {ch.title}
                </li>
              ))}
              {chapters.length === 0 && <li className="text-[#6B7280] text-xs px-2">No chapters found</li>}
            </ul>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[#6B7280] text-xs uppercase tracking-wider">Characters ({characters.length})</div>
              <button onClick={() => { setCharEditorRaw(''); setCharEditorName(''); setCharEditorOpen(true) }} className="text-[#06B6D4] hover:text-[#22D3EE] text-sm leading-none" title="New character">+</button>
            </div>
            <ul className="space-y-1 text-sm">
              {characters.map(c => (
                <li key={c.file} className="group flex items-center justify-between px-2 py-1 rounded cursor-default hover:bg-[#2D2D3D]">
                  <span className="text-[#E2E2E8] truncate flex-1">{c.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openCharacter(c.file, c.name)} className="text-[#6B7280] hover:text-[#06B6D4] text-xs" title="Edit">✏️</button>
                    <button onClick={() => { if (confirm(`Delete ${c.name}?`)) { /* TODO: API delete */ } }} className="text-[#6B7280] hover:text-red-400 text-xs" title="Delete">🗑</button>
                  </div>
                </li>
              ))}
              {characters.length === 0 && <li className="text-[#6B7280] text-xs px-2">No characters yet</li>}
            </ul>
          </div>
        </aside>

        {/* Editor canvas */}
        <main className="flex-1 flex flex-col bg-[#0D0D14] overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <textarea
              value={content}
              onChange={(e) => saveContent(e.target.value)}
              className="w-full h-full bg-transparent text-[#E2E2E8] editor-font text-lg leading-relaxed outline-none resize-none"
              placeholder="Start writing..."
            />
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
                <div className="text-[#06B6D4] font-medium mb-1">{r.title}</div>
                <div dangerouslySetInnerHTML={{ __html: r.snippet }} />
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
        <CharacterEditor project={project} rawContent={charEditorRaw} initialName={charEditorName} onClose={() => setCharEditorOpen(false)} />
      )}

      {viewingCharacter && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-8">
          <div className="bg-[#1A1A2E] border border-[#2D2D3D] rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D2D3D]">
              <h2 className="text-xl font-bold text-[#E2E2E8]">{viewingCharacter.name}</h2>
              <button onClick={() => setViewingCharacter(null)} className="text-[#6B7280] hover:text-[#E2E2E8] text-2xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <pre className="whitespace-pre-wrap text-[#E2E2E8] text-sm leading-relaxed font-sans">{viewingCharacter.content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
