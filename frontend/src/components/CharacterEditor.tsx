import { useState, useEffect } from 'react'

interface CharacterImage {
  id: string
  prompt: string
  timestamp: string
  url: string // base64 data URL or path
}

interface Character {
  id: string
  name: string
  species: string
  role: string
  rank: string
  age: string
  appearance: {
    height: string
    build: string
    hair: string
    eyes: string
    skin: string
    distinguishing: string
  }
  personality: string
  abilities: string[]
  equipment: string[]
  relationships: { name: string; relation: string }[]
  backstory: string
  notes: string
  images: CharacterImage[]
}

interface Props {
  project: string
  characterId?: string
  onClose: () => void
}

const EMPTY_CHARACTER: Character = {
  id: '', name: '', species: 'Human', role: '', rank: '', age: '',
  appearance: { height: '', build: '', hair: '', eyes: '', skin: '', distinguishing: '' },
  personality: '', abilities: [], equipment: [],
  relationships: [], backstory: '', notes: '', images: [],
}

function loadCharacters(project: string): Character[] {
  const stored = localStorage.getItem(`story-writer-characters-${project}`)
  return stored ? JSON.parse(stored) : []
}

function saveCharacters(project: string, chars: Character[]) {
  localStorage.setItem(`story-writer-characters-${project}`, JSON.stringify(chars))
}

export default function CharacterEditor({ project, characterId, onClose }: Props) {
  const [characters, setCharacters] = useState<Character[]>(() => loadCharacters(project))
  const [activeId, setActiveId] = useState<string | null>(characterId || characters[0]?.id || null)
  const [newAbility, setNewAbility] = useState('')
  const [newEquipment, setNewEquipment] = useState('')
  const [newRelName, setNewRelName] = useState('')
  const [newRelType, setNewRelType] = useState('')
  const [generating, setGenerating] = useState(false)

  const active = characters.find(c => c.id === activeId) || null

  useEffect(() => { saveCharacters(project, characters) }, [characters])

  const updateChar = (updates: Partial<Character>) => {
    setCharacters(characters.map(c => c.id === activeId ? { ...c, ...updates } : c))
  }

  const updateAppearance = (field: string, value: string) => {
    if (!active) return
    updateChar({ appearance: { ...active.appearance, [field]: value } })
  }

  const createCharacter = () => {
    const id = crypto.randomUUID().slice(0, 8)
    const newChar = { ...EMPTY_CHARACTER, id, name: 'New Character' }
    setCharacters([...characters, newChar])
    setActiveId(id)
  }

  const deleteCharacter = () => {
    if (!activeId) return
    const updated = characters.filter(c => c.id !== activeId)
    setCharacters(updated)
    setActiveId(updated[0]?.id || null)
  }

  const addAbility = () => {
    if (!newAbility.trim() || !active) return
    updateChar({ abilities: [...active.abilities, newAbility.trim()] })
    setNewAbility('')
  }

  const removeAbility = (idx: number) => {
    if (!active) return
    updateChar({ abilities: active.abilities.filter((_, i) => i !== idx) })
  }

  const addEquipment = () => {
    if (!newEquipment.trim() || !active) return
    updateChar({ equipment: [...active.equipment, newEquipment.trim()] })
    setNewEquipment('')
  }

  const removeEquipment = (idx: number) => {
    if (!active) return
    updateChar({ equipment: active.equipment.filter((_, i) => i !== idx) })
  }

  const addRelationship = () => {
    if (!newRelName.trim() || !active) return
    updateChar({ relationships: [...active.relationships, { name: newRelName.trim(), relation: newRelType.trim() || 'ally' }] })
    setNewRelName('')
    setNewRelType('')
  }

  const removeRelationship = (idx: number) => {
    if (!active) return
    updateChar({ relationships: active.relationships.filter((_, i) => i !== idx) })
  }

  const generateImage = async () => {
    if (!active) return
    setGenerating(true)
    // Build prompt from character data
    const prompt = [
      active.name,
      active.species,
      active.appearance.build && `${active.appearance.build} build`,
      active.appearance.hair && `${active.appearance.hair} hair`,
      active.appearance.eyes && `${active.appearance.eyes} eyes`,
      active.appearance.skin && `${active.appearance.skin} skin`,
      active.appearance.distinguishing,
      active.role,
      active.equipment.length > 0 && `carrying ${active.equipment.join(', ')}`,
    ].filter(Boolean).join(', ')

    // Simulate generation (in real app, calls /api/generate-image)
    await new Promise(r => setTimeout(r, 1500))

    const newImage: CharacterImage = {
      id: crypto.randomUUID().slice(0, 8),
      prompt,
      timestamp: new Date().toISOString(),
      url: '', // placeholder — real impl returns base64 from Bedrock
    }
    updateChar({ images: [...active.images, newImage] })
    setGenerating(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1A1A2E] border border-[#2D2D3D] rounded-xl w-[900px] max-h-[85vh] flex overflow-hidden">
        {/* Character list sidebar */}
        <div className="w-48 border-r border-[#2D2D3D] p-3 flex flex-col">
          <div className="text-xs uppercase tracking-wider text-[#6B7280] mb-2">Characters</div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {characters.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                  c.id === activeId ? 'bg-[#06B6D4]/10 text-[#06B6D4] border-l-2 border-[#06B6D4]' : 'text-[#E2E2E8] hover:bg-[#2D2D3D]'
                }`}
              >
                {c.name || 'Unnamed'}
              </button>
            ))}
          </div>
          <button onClick={createCharacter} className="text-xs text-[#06B6D4] hover:text-[#22D3EE] mt-2">+ New Character</button>
        </div>

        {/* Editor area */}
        {active ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start">
              <input
                value={active.name}
                onChange={e => updateChar({ name: e.target.value })}
                className="text-xl font-bold bg-transparent text-[#E2E2E8] outline-none border-b border-transparent focus:border-[#06B6D4] w-64"
                placeholder="Character name"
              />
              <div className="flex gap-2">
                <button onClick={deleteCharacter} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                <button onClick={onClose} className="text-xs text-[#6B7280] hover:text-[#E2E2E8]">Close ×</button>
              </div>
            </div>

            {/* Basic info row */}
            <div className="grid grid-cols-4 gap-3">
              <Field label="Species" value={active.species} onChange={v => updateChar({ species: v })} />
              <Field label="Role" value={active.role} onChange={v => updateChar({ role: v })} />
              <Field label="Rank" value={active.rank} onChange={v => updateChar({ rank: v })} />
              <Field label="Age" value={active.age} onChange={v => updateChar({ age: v })} />
            </div>

            {/* Appearance */}
            <Section title="Appearance">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Height" value={active.appearance.height} onChange={v => updateAppearance('height', v)} />
                <Field label="Build" value={active.appearance.build} onChange={v => updateAppearance('build', v)} />
                <Field label="Hair" value={active.appearance.hair} onChange={v => updateAppearance('hair', v)} />
                <Field label="Eyes" value={active.appearance.eyes} onChange={v => updateAppearance('eyes', v)} />
                <Field label="Skin" value={active.appearance.skin} onChange={v => updateAppearance('skin', v)} />
                <Field label="Distinguishing" value={active.appearance.distinguishing} onChange={v => updateAppearance('distinguishing', v)} />
              </div>
            </Section>

            {/* Personality */}
            <Section title="Personality">
              <textarea
                value={active.personality}
                onChange={e => updateChar({ personality: e.target.value })}
                className="w-full bg-[#0D0D14] border border-[#2D2D3D] rounded px-3 py-2 text-sm text-[#E2E2E8] outline-none focus:border-[#06B6D4] resize-none h-20"
                placeholder="Traits, mannerisms, motivations..."
              />
            </Section>

            {/* Abilities */}
            <Section title="Abilities">
              <div className="flex flex-wrap gap-2 mb-2">
                {active.abilities.map((a, i) => (
                  <span key={i} className="bg-[#D946EF]/10 text-[#D946EF] text-xs px-2 py-1 rounded flex items-center gap-1">
                    {a} <button onClick={() => removeAbility(i)} className="hover:text-red-300">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newAbility} onChange={e => setNewAbility(e.target.value)} onKeyDown={e => e.key === 'Enter' && addAbility()}
                  className="flex-1 bg-[#0D0D14] border border-[#2D2D3D] rounded px-2 py-1 text-sm text-[#E2E2E8] outline-none focus:border-[#06B6D4]"
                  placeholder="Add ability..." />
                <button onClick={addAbility} className="text-xs text-[#06B6D4]">Add</button>
              </div>
            </Section>

            {/* Equipment */}
            <Section title="Equipment">
              <div className="flex flex-wrap gap-2 mb-2">
                {active.equipment.map((e, i) => (
                  <span key={i} className="bg-[#F59E0B]/10 text-[#F59E0B] text-xs px-2 py-1 rounded flex items-center gap-1">
                    {e} <button onClick={() => removeEquipment(i)} className="hover:text-red-300">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newEquipment} onChange={e => setNewEquipment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEquipment()}
                  className="flex-1 bg-[#0D0D14] border border-[#2D2D3D] rounded px-2 py-1 text-sm text-[#E2E2E8] outline-none focus:border-[#06B6D4]"
                  placeholder="Add equipment..." />
                <button onClick={addEquipment} className="text-xs text-[#06B6D4]">Add</button>
              </div>
            </Section>

            {/* Relationships */}
            <Section title="Relationships">
              <div className="space-y-1 mb-2">
                {active.relationships.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-[#E2E2E8]">{r.name}</span>
                    <span className="text-[#6B7280]">—</span>
                    <span className="text-[#06B6D4]">{r.relation}</span>
                    <button onClick={() => removeRelationship(i)} className="text-[#6B7280] hover:text-red-400 text-xs ml-auto">×</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newRelName} onChange={e => setNewRelName(e.target.value)} placeholder="Name"
                  className="flex-1 bg-[#0D0D14] border border-[#2D2D3D] rounded px-2 py-1 text-sm text-[#E2E2E8] outline-none focus:border-[#06B6D4]" />
                <input value={newRelType} onChange={e => setNewRelType(e.target.value)} placeholder="Relation"
                  className="w-28 bg-[#0D0D14] border border-[#2D2D3D] rounded px-2 py-1 text-sm text-[#E2E2E8] outline-none focus:border-[#06B6D4]" />
                <button onClick={addRelationship} className="text-xs text-[#06B6D4]">Add</button>
              </div>
            </Section>

            {/* Backstory */}
            <Section title="Backstory">
              <textarea
                value={active.backstory}
                onChange={e => updateChar({ backstory: e.target.value })}
                className="w-full bg-[#0D0D14] border border-[#2D2D3D] rounded px-3 py-2 text-sm text-[#E2E2E8] outline-none focus:border-[#06B6D4] resize-none h-24"
                placeholder="Origin, history, key events..."
              />
            </Section>

            {/* Notes */}
            <Section title="Author Notes">
              <textarea
                value={active.notes}
                onChange={e => updateChar({ notes: e.target.value })}
                className="w-full bg-[#0D0D14] border border-[#2D2D3D] rounded px-3 py-2 text-sm text-[#E2E2E8] outline-none focus:border-[#06B6D4] resize-none h-16"
                placeholder="Private notes, reminders, arc plans..."
              />
            </Section>

            {/* Image Generation */}
            <Section title="Character Images">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={generateImage}
                  disabled={generating}
                  className="bg-[#D946EF]/20 text-[#D946EF] text-sm px-3 py-1.5 rounded hover:bg-[#D946EF]/30 transition-colors disabled:opacity-50"
                >
                  {generating ? '⏳ Generating...' : '🎨 Generate Portrait'}
                </button>
                <span className="text-[#6B7280] text-xs self-center">Uses appearance + equipment fields as prompt</span>
              </div>
              {active.images.length > 0 && (
                <div className="space-y-2">
                  {active.images.map((img) => (
                    <div key={img.id} className="bg-[#0D0D14] border border-[#2D2D3D] rounded p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[#6B7280] text-xs">{new Date(img.timestamp).toLocaleDateString()}</span>
                        {img.url && <div className="w-16 h-16 bg-[#2D2D3D] rounded" />}
                      </div>
                      <p className="text-xs text-[#6B7280] italic">Prompt: {img.prompt}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#6B7280]">
            <div className="text-center">
              <p>No characters yet.</p>
              <button onClick={createCharacter} className="text-[#06B6D4] mt-2">+ Create one</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-[#6B7280] mb-2">{title}</div>
      {children}
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[#6B7280] text-xs">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#0D0D14] border border-[#2D2D3D] rounded px-2 py-1 text-sm text-[#E2E2E8] outline-none focus:border-[#06B6D4] mt-0.5"
      />
    </div>
  )
}
