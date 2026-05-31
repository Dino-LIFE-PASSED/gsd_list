const compressToBlob = (file, maxPx = 1280, quality = 0.75) =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round(height * maxPx / width); width = maxPx }
          else { width = Math.round(width * maxPx / height); height = maxPx }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        canvas.toBlob(resolve, 'image/jpeg', quality)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })

export async function uploadImage(file) {
  const blob = await compressToBlob(file)
  const form = new FormData()
  form.append('image', blob, 'photo.jpg')
  const res = await fetch('/api/upload', { method: 'POST', body: form, credentials: 'include' })
  const { url } = await res.json()
  return url
}
