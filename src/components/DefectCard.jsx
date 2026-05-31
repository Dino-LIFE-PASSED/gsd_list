import TagBadge from './TagBadge'
import { getTeam, getStatus } from '../data/teams'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function DefectCard({ defect, onClick }) {
  const team = getTeam(defect.teamId)
  const status = getStatus(defect.statusId)

  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all cursor-pointer flex flex-col overflow-hidden"
    >
      {defect.images.length > 0 && (
        <div className="relative h-40 bg-zinc-800 overflow-hidden">
          <img src={defect.images[0]} alt="" className="w-full h-full object-cover" />
          {defect.images.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
              +{defect.images.length - 1} more
            </span>
          )}
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex flex-wrap gap-1.5">
          {team && <TagBadge label={team.label} color={team.color} size="xs" />}
          {status && <TagBadge label={status.label} color={status.color} size="xs" />}
          {defect.statusId === 'done' && !defect.approved && (
            <span className="inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Waiting for Approval
            </span>
          )}
          {defect.approved && (
            <span className="inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Approved
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-100 leading-snug line-clamp-2">{defect.header}</h3>

        {defect.description && (
          <p className="text-sm text-zinc-400 line-clamp-2">{defect.description}</p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between text-xs text-zinc-500">
          <span>{formatDate(defect.createdAt)}</span>
          <div className="flex gap-3">
            {defect.images.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {defect.images.length}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {defect.comments.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
