import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiFetch } from '../api/client'
import { getPermissions } from '../utils/permissions'
import { getTeam } from '../data/teams'
import DefectCard from '../components/DefectCard'
import DefectModal from '../components/DefectModal'

const permissions = getPermissions('engineer')

export default function EngineerPage() {
  const { teamId } = useParams()
  const team = getTeam(teamId)

  const [defects, setDefects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)

  useEffect(() => {
    if (!team) { setLoading(false); return }
    apiFetch(`/api/defects?team=${teamId}`)
      .then(setDefects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [teamId, team])

  const handleStatusChange = async (defectId, statusId) => {
    await apiFetch(`/api/defects/${defectId}/status`, { method: 'PATCH', body: { statusId } })
    setDefects((prev) => prev.map((d) => (d.id === defectId ? { ...d, statusId } : d)))
    setModal((prev) =>
      prev?.defect?.id === defectId ? { ...prev, defect: { ...prev.defect, statusId } } : prev
    )
  }

  const handleAddComment = async (defectId, { text, author, images }) => {
    const comment = await apiFetch(`/api/defects/${defectId}/comments`, {
      method: 'POST',
      body: { author, text, images },
    })
    setDefects((prev) =>
      prev.map((d) => (d.id === defectId ? { ...d, comments: [...d.comments, comment] } : d))
    )
    setModal((prev) =>
      prev?.defect?.id === defectId
        ? { ...prev, defect: { ...prev.defect, comments: [...prev.defect.comments, comment] } }
        : prev
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center p-8">
        <div>
          <p className="text-zinc-400 text-lg font-medium">Team not found</p>
          <p className="text-zinc-600 text-sm mt-2">The URL may be incorrect.</p>
          <Link to="/login" className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300">Go to login →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-100 leading-tight">GSD Defect Tracker</h1>
              <p className="text-xs text-zinc-400 leading-tight">Engineer View</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium px-3 py-1 rounded-full border ${team.color}`}>{team.label}</span>
            <span className="text-xs text-zinc-500 hidden sm:block">{defects.length} defect{defects.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-sm text-zinc-400 mb-4">
          Showing <span className="font-semibold text-gray-200">{defects.length}</span> defects for{' '}
          <span className="font-semibold text-gray-200">{team.label}</span>
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : defects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-zinc-400 font-medium">No defects assigned to your team</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {defects.map((defect) => (
              <DefectCard key={defect.id} defect={defect} onClick={() => setModal({ defect })} />
            ))}
          </div>
        )}
      </main>

      {modal && (
        <DefectModal
          mode="view"
          defect={modal.defect}
          permissions={permissions}
          authorName={`${team.label} Team`}
          onClose={() => setModal(null)}
          onAddComment={handleAddComment}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
