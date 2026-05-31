import { useState, useEffect } from 'react'
import { TEAMS, TASK_STATUSES, getTeam, getStatus } from '../data/teams'
import TagBadge from './TagBadge'
import ImageUpload from './ImageUpload'
import CommentSection from './CommentSection'

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function DefectModal({
  mode,           // 'add' | 'view'
  defect,
  permissions,
  authorName,
  onClose,
  onSave,         // add mode
  onUpdate,       // edit within view mode
  onDelete,
  onApprove,
  onAddComment,
  onStatusChange,
}) {
  const isAdd = mode === 'add'
  const [isEditing, setIsEditing] = useState(false)

  const [header, setHeader] = useState('')
  const [description, setDescription] = useState('')
  const [teamId, setTeamId] = useState(TEAMS[0].id)
  const [statusId, setStatusId] = useState(TASK_STATUSES[0].id)
  const [images, setImages] = useState([])
  const [lightboxSrc, setLightboxSrc] = useState(null)

  useEffect(() => {
    if (defect) {
      setHeader(defect.header)
      setDescription(defect.description)
      setTeamId(defect.teamId)
      setStatusId(defect.statusId)
      setImages(defect.images)
    }
  }, [defect])

  const handleSave = () => {
    if (!header.trim()) return
    const data = { header: header.trim(), description: description.trim(), teamId, statusId, images }
    if (isAdd) {
      onSave(data)
    } else {
      onUpdate(defect.id, data)
      setIsEditing(false)
    }
  }

  const cancelEdit = () => {
    setHeader(defect.header)
    setDescription(defect.description)
    setTeamId(defect.teamId)
    setImages(defect.images)
    setIsEditing(false)
  }

  const team = getTeam(isAdd || isEditing ? teamId : defect?.teamId)
  const status = getStatus(isAdd ? statusId : defect?.statusId)

  const showForm = isAdd || isEditing

  const canApproveNow =
    permissions?.canApprove &&
    defect?.statusId === 'done' &&
    !defect?.approved

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={lightboxSrc ? undefined : onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-gray-100">
            {isAdd ? 'New Defect' : isEditing ? 'Edit Defect' : 'Defect Detail'}
          </h2>
          <div className="flex items-center gap-1">
            {!isAdd && !isEditing && permissions?.canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {!isAdd && !isEditing && permissions?.canDelete && (
              <button
                onClick={() => onDelete(defect.id)}
                className="px-3 py-1.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={isEditing ? cancelEdit : onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-5">
          {showForm ? (
            /* ── FORM (add or edit) ── */
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  placeholder="Enter defect title"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-gray-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue or work required..."
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-gray-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Team</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TEAMS.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                {isAdd && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Status</label>
                    <select
                      value={statusId}
                      onChange={(e) => setStatusId(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TASK_STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {team && (
                <div className="flex gap-2">
                  <TagBadge label={team.label} color={team.color} />
                  {isAdd && status && <TagBadge label={status.label} color={status.color} />}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Images</label>
                <ImageUpload images={images} onChange={setImages} />
              </div>
            </>
          ) : (
            /* ── VIEW ── */
            <>
              {/* Tags + Status control */}
              <div className="flex flex-wrap items-center gap-2">
                {team && <TagBadge label={team.label} color={team.color} />}
                {status && (
                  <>
                    <TagBadge label={status.label} color={status.color} />
                    {permissions?.canUpdateStatus && (
                      <select
                        value={defect.statusId}
                        onChange={(e) => onStatusChange(defect.id, e.target.value)}
                        className="text-xs bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {TASK_STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    )}
                  </>
                )}

                {/* Approved indicator */}
                {defect?.approved && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-700">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Approved
                  </span>
                )}
              </div>

              {/* Approve action */}
              {canApproveNow && (
                <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <p className="text-sm text-emerald-300">Work marked as done — ready for approval?</p>
                  <button
                    onClick={() => onApprove(defect.id)}
                    className="ml-4 px-4 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                  >
                    Approve ✓
                  </button>
                </div>
              )}

              {defect?.approved && (
                <p className="text-xs text-zinc-500">
                  Approved by <span className="text-zinc-300">{defect.approvedBy}</span>{' '}
                  · {formatDateTime(defect.approvedAt)}
                </p>
              )}

              <h3 className="text-xl font-bold text-gray-100">{defect?.header}</h3>

              {defect?.description && (
                <p className="text-zinc-400 whitespace-pre-wrap leading-relaxed">{defect.description}</p>
              )}

              {defect?.images?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                    Images ({defect.images.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {defect.images.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxSrc(src)}
                        className="aspect-square rounded-xl overflow-hidden border border-zinc-700 hover:opacity-90 transition-opacity"
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-zinc-800 pt-4">
                <CommentSection
                  comments={defect?.comments ?? []}
                  onAdd={(comment) => onAddComment(defect.id, comment)}
                  authorName={authorName}
                />
              </div>
            </>
          )}
        </div>

        {/* ── Footer (form modes) ── */}
        {showForm && (
          <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-3">
            <button
              onClick={isEditing ? cancelEdit : onClose}
              className="px-5 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!header.trim()}
              className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <img src={lightboxSrc} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  )
}
