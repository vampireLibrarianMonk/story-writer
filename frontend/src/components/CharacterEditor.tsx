import { useState, useEffect } from 'react'

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
  rawCarryover: string
}

interface Props {
  project: string
  characterId?: string
  rawContent?: string
  initialName?: string
  onClose: () => void
}

const EMPTY_CHARACTER: Character = {
  id: '', name: '', species: 'Human', role: '', rank: '', age: '',
  appearance: { height: '', build: '', hair: '', eyes: '', skin: '', distinguishing: '' },
  personality: '', abilities: [], equipment: [],
  relationships: [], backstory: '', notes: '', rawCarryover: '',
}

function parseRawProfile(text: string, fallbackName: string): Character {
  const char: Character = { ...EMPTY_CHARACTER, id: crypto.randomUUID().slice(0, 8), rawCarryover: text }

  // Name
  const nameMatch = text.match(/Name:\s*(.+)/i)
  char.name = nameMatch ? nameMatch[1].trim() : fallbackName

  // Role
  const roleMatch = text.match(/Role:\s*(.+)/i)
  if (roleMatch) char.role = roleMatch[1].trim()

  // Age
  const ageMatch = text.match(/Age:\s*(.+)/i)
  if (ageMatch) char.age = ageMatch[1].trim()

  // Background/Backstory - grab the text after "Background:" until next section
  const bgMatch = text.match(/Background:\s*(.+?)(?=\n\n|\n[A-Z])/s)
  if (bgMatch) char.backstory = bgMatch[1].trim()

  // Personality - grab content between "Personality" header and next major section
  const persMatch = text.match(/Personality\n([\s\S]+?)(?=\n(?:Abilities|Powers|Relationships|Role in|Character Arc|Significant))/i)
  if (persMatch) char.personality = persMatch[1].trim()

  // Abilities - find lines after "Abilities" section
  const abilMatch = text.match(/(?:Abilities|Powers)[^\n]*\n([\s\S]+?)(?=\n(?:Relationships|Role in|Character Arc|Significant|Equipment))/i)
  if (abilMatch) {
    const abilText = abilMatch[1]
    // Extract named abilities (lines starting with a capitalized word followed by colon)
    const abilities = abilText.match(/^([A-Z][^:]+):/gm)
    if (abilities) {
      char.abilities = abilities.map(a => a.replace(/:$/, '').trim())
    }
  }

  // Relationships
  const relMatch = text.match(/Relationships\n([\s\S]+?)(?=\n(?:Role in|Character Arc|Significant|$))/i)
  if (relMatch) {
    const relLines = relMatch[1].match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s*\(([^)]+)\)/gm)
    if (relLines) {
      char.relationships = relLines.map(line => {
        const m = line.match(/^(.+?)\s*\(([^)]+)\)/)
        return m ? { name: m[1].trim(), relation: m[2].trim() } : { name: line, relation: '' }
      })
    } else {
      // Try "Name\n" pattern as section headers
      const relSections = relMatch[1].match(/^([A-Z][a-z]+(?:\s(?:\([^)]+\)|[A-Z][a-z]+))*)/gm)
      if (relSections) {
        char.relationships = relSections
          .filter(s => s.length > 2 && !s.match(/^(Shared|Balance|Opposites|Trust|Nurturing|A )/))
          .map(name => ({ name: name.trim(), relation: 'ally' }))
      }
    }
  }

  return char
}

function loadCharacters(project: string): Character[] {
  const stored = localStorage.getItem(`story-writer-characters-${project}`)
  return stored ? JSON.parse(stored) : []
}

function saveCharacters(project: string, chars: Character[]) {
  localStorage.setItem(`story-writer-characters-${project}`, JSON.stringify(chars))
}

export default function CharacterEditor({ project, characterId, rawContent, initialName, onClose }: Props) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [newAbility, setNewAbility] = useState('')
  const [newEquipment, setNewEquipment] = useState('')
  const [newRelName, setNewRelName] = useState('')
  const [newRelType, setNewRelType] = useState('')
  const [rawOpen, setRawOpen] = useState(false)

  const active = characters.find(c => c.id === activeId) || null

  // Load characters: always from API parsed data
  useEffect(() => {
    localStorage.removeItem(`story-writer-characters-${project}`)
    fetch(`/api/projects/${project}/characters-parsed`)
      .then(r => r.ok ? r.json() : [])
      .then((parsed: Character[]) => {
        if (parsed.length > 0) {
          setCharacters(parsed)
          const target = initialName ? parsed.find(c => c.name === initialName) : parsed[0]
          setActiveId(target?.id || parsed[0]?.id || null)
        } else if (rawContent && initialName) {
          const char = parseRawProfile(rawContent, initialName)
          setCharacters([char])
          setActiveId(char.id)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { if (characters.length > 0) saveCharacters(project, characters) }, [characters])

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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1A1A2E] border border-[#2D2D3D] rounded-xl w-[750px] max-h-[85vh] flex overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-[#6B7280] p-8">Loading...</div>
        ) : active ? (
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
                <button onClick={onClose} className="text-xs text-[#6B7280] hover:text-[#E2E2E8]">Close ×</button>
              </div>
            </div>

            {/* Basic info */}
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

            {/* Raw Carryover Data */}
            {active.rawCarryover && (
              <div className="border border-[#2D2D3D] rounded-lg overflow-hidden">
                <button
                  onClick={() => setRawOpen(!rawOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#0D0D14] hover:bg-[#1A1A2E] transition-colors"
                >
                  <span className="text-xs uppercase tracking-wider text-[#6B7280]">📄 Raw Source Data</span>
                  <span className="text-[#6B7280] text-sm">{rawOpen ? '▾' : '▸'}</span>
                </button>
                {rawOpen && (
                  <div className="p-4 bg-[#0A0A0F] max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-xs text-[#9CA3AF] leading-relaxed font-sans">{active.rawCarryover}</pre>
                  </div>
                )}
              </div>
            )}
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
