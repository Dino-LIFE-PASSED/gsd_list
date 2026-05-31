import { useRef, useState } from 'react'
import { uploadImage } from '../utils/compress'

export default function ImageUpload({ images, onChange }) {
  const inputRef = useRef()
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files)
    e.target.value = ''
    setUploading(true)
    for (const file of files) {
      const url = await uploadImage(file)
      onChange((prev) => [...prev, url])
    }
    setUploading(false)
  }

  const removeImage = (index) => onChange((prev) => prev.filter((_, i) => i !== index))

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-700 group">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => removeImage(i)}
              className="absolute inset-0 bg-black/50 text-white text-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={() => inputRef.current.click()} disabled={uploading}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-zinc-600 flex flex-col items-center justify-center text-zinc-500 hover:border-blue-500 hover:text-blue-400 disabled:opacity-50 transition-colors">
          {uploading ? (
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-2xl leading-none">+</span>
              <span className="text-xs mt-0.5">Photo</span>
            </>
          )}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
    </div>
  )
}
