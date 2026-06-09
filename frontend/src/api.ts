const API = '/api'

export async function fetchProjects(): Promise<{ name: string; path: string }[]> {
  const res = await fetch(`${API}/projects`)
  if (!res.ok) return []
  return res.json()
}

export async function fetchCharacters(project: string): Promise<{ name: string; file: string }[]> {
  const res = await fetch(`${API}/projects/${project}/characters`)
  if (!res.ok) return []
  return res.json()
}

export async function fetchChapters(project: string): Promise<{ title: string; file: string }[]> {
  const res = await fetch(`${API}/projects/${project}/chapters`)
  if (!res.ok) return []
  return res.json()
}

export async function fetchChapterContent(project: string, filename: string): Promise<string> {
  const res = await fetch(`${API}/projects/${project}/chapters/${encodeURIComponent(filename)}`)
  if (!res.ok) return ''
  const data = await res.json()
  return data.content || ''
}

export async function fetchCharacterContent(project: string, filename: string): Promise<string> {
  const res = await fetch(`${API}/projects/${project}/characters/${filename}`)
  if (!res.ok) return ''
  const data = await res.json()
  return data.content || ''
}

export async function indexProject(project: string): Promise<{ files: number; chunks: number }> {
  const res = await fetch(`${API}/projects/${project}/index`, { method: 'POST' })
  if (!res.ok) return { files: 0, chunks: 0 }
  return res.json()
}

export async function searchCorpus(query: string, project?: string): Promise<{ results: any[]; total: number }> {
  const params = new URLSearchParams({ q: query })
  if (project) params.set('project_id', project)
  const res = await fetch(`${API}/search?${params}`)
  if (!res.ok) return { results: [], total: 0 }
  return res.json()
}
