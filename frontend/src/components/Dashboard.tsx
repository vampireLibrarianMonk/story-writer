import { useState, useEffect } from 'react'

interface Props {
  onOpen: (name: string) => void
}

interface Project {
  name: string
  genre: string
  chapters: number
  words: number
}

const STORAGE_KEY = 'story-writer-projects'

function loadProjects(): Project[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return JSON.parse(stored)
  return []
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export default function Dashboard({ onOpen }: Props) {
  const [newName, setNewName] = useState('')
  const [projects, setProjects] = useState<Project[]>(loadProjects)

  useEffect(() => { saveProjects(projects) }, [projects])

  const createProject = () => {
    if (!newName.trim()) return
    setProjects([...projects, { name: newName, genre: '', chapters: 0, words: 0 }])
    setNewName('')
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-2 text-[#E2E2E8]">Story Writer</h1>
      <p className="text-[#6B7280] mb-12">Your worlds await.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
        {projects.map((p) => (
          <button
            key={p.name}
            onClick={() => onOpen(p.name)}
            className="bg-[#1A1A2E] border border-[#2D2D3D] rounded-xl p-6 text-left hover:border-[#06B6D4] transition-colors"
          >
            <div className="text-2xl mb-2">⚓</div>
            <div className="font-semibold text-lg">{p.name}</div>
            <div className="text-[#6B7280] text-sm mt-1">{p.genre}</div>
            <div className="text-[#6B7280] text-xs mt-3">
              Ch.{p.chapters} · {p.words.toLocaleString()} words
            </div>
          </button>
        ))}

        {/* New project card */}
        <div className="bg-[#1A1A2E] border border-dashed border-[#2D2D3D] rounded-xl p-6 flex flex-col justify-center">
          <input
            type="text"
            placeholder="New project name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createProject()}
            className="bg-transparent border-b border-[#2D2D3D] text-[#E2E2E8] placeholder-[#6B7280] outline-none pb-2 mb-3"
          />
          <button
            onClick={createProject}
            className="text-[#06B6D4] text-sm hover:text-[#22D3EE] transition-colors"
          >
            + Create
          </button>
        </div>
      </div>
    </div>
  )
}
