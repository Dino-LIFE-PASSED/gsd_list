const KEY = 'gsd_defects'

const migrate = (d) => ({
  approved: false,
  approvedBy: null,
  approvedAt: null,
  ...d,
})

export const loadDefects = () => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw).map(migrate) : []
  } catch {
    return []
  }
}

export const saveDefects = (defects) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(defects))
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      alert('Storage full — please remove some images to free up space.')
    }
  }
}
