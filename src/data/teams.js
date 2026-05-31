export const TEAMS = [
  { id: 'electrical', label: 'Electrical', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { id: 'plumbing',   label: 'Plumbing',   color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'structure',  label: 'Structure',  color: 'bg-stone-100 text-stone-800 border-stone-300' },
  { id: 'painting',   label: 'Painting',   color: 'bg-pink-100 text-pink-800 border-pink-300' },
  { id: 'carpentry',  label: 'Carpentry',  color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'tiling',     label: 'Tiling',     color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { id: 'hvac',       label: 'HVAC / AC',  color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { id: 'other',      label: 'Other',      color: 'bg-purple-100 text-purple-800 border-purple-300' },
]

export const TASK_STATUSES = [
  { id: 'pending',     label: 'Pending',     color: 'bg-red-100 text-red-700 border-red-300' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'done',        label: 'Done',        color: 'bg-green-100 text-green-700 border-green-300' },
]

export const getTeam = (id) => TEAMS.find((t) => t.id === id)
export const getStatus = (id) => TASK_STATUSES.find((s) => s.id === id)
