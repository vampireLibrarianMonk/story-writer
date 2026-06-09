import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Briefing from './components/Briefing'
import Editor from './components/Editor'

type Screen = 'dashboard' | 'briefing' | 'editor'

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [project, setProject] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)

  const openProject = (name: string) => {
    setProject(name)
    setIsNew(false)
    setScreen('briefing')
  }

  const startWriting = () => setScreen('editor')
  const goHome = () => { setScreen('dashboard'); setProject(null) }

  return (
    <div className="h-screen flex flex-col">
      {screen === 'dashboard' && <Dashboard onOpen={openProject} />}
      {screen === 'briefing' && project && <Briefing project={project} isNew={isNew} onContinue={startWriting} onBack={goHome} />}
      {screen === 'editor' && project && <Editor project={project} onBack={goHome} />}
    </div>
  )
}
