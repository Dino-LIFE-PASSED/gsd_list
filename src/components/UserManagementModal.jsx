import { useState, useEffect } from 'react'
import { apiFetch } from '../api/client'
import { TEAMS } from '../data/teams'

export default function UserManagementModal({ onClose }) {
  const [managers, setManagers] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [tab,      setTab]      = useState('users')
  const [copied,   setCopied]   = useState(null)

  useEffect(() => {
    apiFetch('/api/users/managers').then(setManagers).catch(console.error)
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiFetch('/api/users/managers', { method: 'POST', body: { username: username.trim(), password: password.trim() } })
      const updated = await apiFetch('/api/users/managers')
      setManagers(updated)
      setUsername('')
      setPassword('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this work manager account?')) return
    await apiFetch(`/api/users/managers/${id}`, { method: 'DELETE' })
    setManagers((prev) => prev.filter((m) => m.id !== id))
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const baseUrl = window.location.origin

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-gray-100">User Management</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-zinc-800 px-6">
          {[{ id: 'users', label: 'Work Managers' }, { id: 'engineers', label: 'Engineer URLs' }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {tab === 'users' ? (
            <>
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">Add Work Manager</h3>
                <form onSubmit={handleAdd} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"
                      className="bg-zinc-800 border border-zinc-700 text-gray-100 placeholder-zinc-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                      className="bg-zinc-800 border border-zinc-700 text-gray-100 placeholder-zinc-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button type="submit" disabled={!username.trim() || !password.trim()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Add Account
                  </button>
                </form>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">Active Accounts ({managers.length})</h3>
                {managers.length === 0 ? (
                  <p className="text-sm text-zinc-500 italic">No work manager accounts yet</p>
                ) : (
                  <div className="space-y-2">
                    {managers.map((m) => (
                      <div key={m.id} className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-200">{m.username}</p>
                          <p className="text-xs text-zinc-500">Created {new Date(m.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <button onClick={() => handleDelete(m.id)} className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-900/30 transition-colors">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">Share these URLs with each engineering team. No login required.</p>
              {TEAMS.map((team) => {
                const url = `${baseUrl}/team/${team.id}`
                return (
                  <div key={team.id} className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${team.color}`}>{team.label}</span>
                      <p className="text-xs text-zinc-500 truncate font-mono">{url}</p>
                    </div>
                    <button onClick={() => copyToClipboard(url, team.id)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${copied === team.id ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
                      {copied === team.id ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
