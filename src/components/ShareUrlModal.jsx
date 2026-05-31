import { useState } from 'react'
import { TEAMS } from '../data/teams'

export default function ShareUrlModal({ onClose }) {
  const [copied, setCopied] = useState(null)
  const [shared, setShared] = useState(null)

  const baseUrl = window.location.origin

  const copyUrl = (teamId, url) => {
    navigator.clipboard.writeText(url)
    setCopied(teamId)
    setTimeout(() => setCopied(null), 2000)
  }

  const shareUrl = async (team, url) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `GSD Defect Tracker — ${team.label}`,
          text: `Access your team's defect list for ${team.label}`,
          url,
        })
        setShared(team.id)
        setTimeout(() => setShared(null), 2000)
      } catch {
        // user cancelled share
      }
    } else {
      copyUrl(team.id, url)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-100">Share Team Links</h2>
              <p className="text-xs text-zinc-500">Engineers don't need to log in</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instruction banner */}
        <div className="mx-6 mt-4 px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded-xl flex items-start gap-3">
          <svg className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Send each team their unique link. They'll see only their own defects and can update task status directly.
          </p>
        </div>

        {/* Team list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {TEAMS.map((team) => {
            const url = `${baseUrl}/team/${team.id}`
            const isCopied = copied === team.id
            const isShared = shared === team.id

            return (
              <div
                key={team.id}
                className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl px-4 py-3.5 group hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Team info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${team.color}`}>
                      {team.label}
                    </span>
                    <p className="text-xs text-zinc-500 truncate font-mono">{url}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Copy */}
                    <button
                      onClick={() => copyUrl(team.id, url)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                        isCopied
                          ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border border-transparent'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>

                    {/* Share (native share API or fallback to copy) */}
                    <button
                      onClick={() => shareUrl(team, url)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                        isShared
                          ? 'bg-blue-900/40 text-blue-400 border-blue-700'
                          : 'bg-transparent text-zinc-400 border-zinc-600 hover:border-zinc-500 hover:text-zinc-200'
                      }`}
                    >
                      {isShared ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Shared
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800">
          <button
            onClick={() => {
              TEAMS.forEach((team) => {
                const url = `${baseUrl}/team/${team.id}`
                navigator.clipboard.writeText(
                  TEAMS.map((t) => `${t.label}: ${baseUrl}/team/${t.id}`).join('\n')
                )
              })
              setCopied('all')
              setTimeout(() => setCopied(null), 2000)
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              copied === 'all'
                ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            {copied === 'all' ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                All URLs Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy All URLs
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
