import { useState, useRef } from 'react'
import { uploadImage } from '../utils/compress'

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function CommentSection({ comments, onAdd, authorName }) {
  const [text,      setText]      = useState('')
  const [images,    setImages]    = useState([])
  const [lightbox,  setLightbox]  = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files)
    e.target.value = ''
    setUploading(true)
    for (const file of files) {
      const url = await uploadImage(file)
      setImages((prev) => [...prev, url])
    }
    setUploading(false)
  }

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i))

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim() && images.length === 0) return
    onAdd({ text: text.trim(), author: authorName || 'Anonymous', images })
    setText('')
    setImages([])
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-zinc-300">Comments ({comments.length})</h4>

      {comments.length === 0 && <p className="text-sm text-zinc-500 italic">No comments yet</p>}

      <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin pr-1">
        {comments.map((c) => (
          <div key={c.id} className="bg-zinc-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">{c.author}</span>
              <span className="text-xs text-zinc-500">{formatDate(c.createdAt)}</span>
            </div>
            {c.text && <p className="text-sm text-zinc-300 whitespace-pre-wrap">{c.text}</p>}
            {c.images?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {c.images.map((src, i) => (
                  <button key={i} type="button" onClick={() => setLightbox(src)}
                    className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 hover:opacity-80 transition-opacity shrink-0">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-2 pt-2 border-t border-zinc-700">
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/60 border border-zinc-700 rounded-lg">
          <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm text-zinc-300 font-medium">{authorName || 'Anonymous'}</span>
        </div>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {images.map((src, i) => (
              <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-700 group shrink-0">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/60 text-white text-base flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment..." rows={2}
            className="flex-1 text-sm bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder-zinc-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
            className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 disabled:opacity-50 transition-colors self-end" title="Attach image">
            {uploading
              ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            }
          </button>
          <button type="submit" disabled={!text.trim() && images.length === 0}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors self-end">
            Post
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </form>

      {lightbox && (
        <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  )
}
