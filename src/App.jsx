import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { apiFetch } from './api/client'
import { getPermissions } from './utils/permissions'
import FilterBar from './components/FilterBar'
import DefectCard from './components/DefectCard'
import DefectModal from './components/DefectModal'
import UserManagementModal from './components/UserManagementModal'
import ShareUrlModal from './components/ShareUrlModal'
import LoginPage from './pages/LoginPage'
import EngineerPage from './pages/EngineerPage'

// ── Route guard ───────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { session } = useAuth()
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return session ? children : <Navigate to="/login" replace />
}

// ── Role badge ────────────────────────────────────────────────────────────────
const ROLE_LABELS = { client: 'Client', work_manager: 'Work Manager' }
const ROLE_COLORS = {
  client:       'bg-violet-900/50 text-violet-300 border border-violet-700',
  work_manager: 'bg-sky-900/50 text-sky-300 border border-sky-700',
}

// ── Main app ──────────────────────────────────────────────────────────────────
function MainApp() {
  const { session, logout } = useAuth()
  const permissions = getPermissions(session?.role)

  const [defects,     setDefects]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(null)
  const [userModal,   setUserModal]   = useState(false)
  const [shareModal,  setShareModal]  = useState(false)
  const [activeTeam,  setActiveTeam]  = useState(null)
  const [activeStatus,setActiveStatus]= useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchDefects = useCallback(async () => {
    try {
      const data = await apiFetch('/api/defects')
      setDefects(data)
    } catch (err) {
      console.error('Failed to load defects:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDefects() }, [fetchDefects])

  // ── Filters ───────────────────────────────────────────────────────────────
  const filtered = defects.filter((d) => {
    if (activeTeam   && d.teamId   !== activeTeam)   return false
    if (activeStatus && d.statusId !== activeStatus) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return d.header.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
    }
    return true
  })

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = async ({ header, description, teamId, statusId, images }) => {
    const defect = await apiFetch('/api/defects', {
      method: 'POST',
      body: { header, description, teamId, statusId, images },
    })
    setDefects((prev) => [defect, ...prev])
    setModal(null)
  }

  const handleUpdate = async (defectId, { header, description, teamId, images }) => {
    const updated = await apiFetch(`/api/defects/${defectId}`, {
      method: 'PUT',
      body: { header, description, teamId, images },
    })
    setDefects((prev) => prev.map((d) => (d.id === defectId ? updated : d)))
    setModal(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this defect?')) return
    await apiFetch(`/api/defects/${id}`, { method: 'DELETE' })
    setDefects((prev) => prev.filter((d) => d.id !== id))
    setModal(null)
  }

  const handleApprove = async (defectId) => {
    const { approvedBy, approvedAt } = await apiFetch(`/api/defects/${defectId}/approve`, { method: 'PATCH' })
    const patch = { approved: true, approvedBy, approvedAt }
    setDefects((prev) => prev.map((d) => (d.id === defectId ? { ...d, ...patch } : d)))
    setModal((prev) =>
      prev?.defect?.id === defectId ? { ...prev, defect: { ...prev.defect, ...patch } } : prev
    )
  }

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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Navbar */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-100 leading-tight">Defect Tracker</h1>
              <p className="text-xs text-zinc-400 leading-tight">Construction defect management</p>
            </div>
          </div>

          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search defects..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-800 border border-zinc-700 text-gray-200 placeholder-zinc-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-zinc-400">{session?.username}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[session?.role]}`}>
                {ROLE_LABELS[session?.role]}
              </span>
            </div>

            {permissions.canManageUsers && (
              <button onClick={() => setUserModal(true)} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors" title="Manage Users">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
            )}

            {permissions.canShareUrls && (
              <button onClick={() => setShareModal(true)} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors" title="Share Team Links">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            )}

            {permissions.canAdd && (
              <button onClick={() => setModal({ mode: 'add' })} className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Defect</span>
              </button>
            )}

            <button onClick={logout} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors" title="Sign out">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <FilterBar activeTeam={activeTeam} activeStatus={activeStatus} onTeamChange={setActiveTeam} onStatusChange={setActiveStatus} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            Showing <span className="font-semibold text-gray-200">{filtered.length}</span> of{' '}
            <span className="font-semibold text-gray-200">{defects.length}</span> defects
          </p>
          {(activeTeam || activeStatus || searchQuery) && (
            <button onClick={() => { setActiveTeam(null); setActiveStatus(null); setSearchQuery('') }} className="text-sm text-blue-400 hover:text-blue-300 font-medium">
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-zinc-400 font-medium">No defects found</p>
            <p className="text-sm text-zinc-500 mt-1">Try adjusting the filters or add a new defect</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((defect) => (
              <DefectCard key={defect.id} defect={defect} onClick={() => setModal({ mode: 'view', defect })} />
            ))}
          </div>
        )}
      </main>

      {modal && (
        <DefectModal
          mode={modal.mode}
          defect={modal.defect}
          permissions={permissions}
          authorName={session?.username}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onApprove={handleApprove}
          onAddComment={handleAddComment}
          onStatusChange={handleStatusChange}
        />
      )}
      {userModal  && <UserManagementModal onClose={() => setUserModal(false)} />}
      {shareModal && <ShareUrlModal       onClose={() => setShareModal(false)} />}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/team/:teamId" element={<EngineerPage />} />
          <Route path="/"             element={<RequireAuth><MainApp /></RequireAuth>} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
