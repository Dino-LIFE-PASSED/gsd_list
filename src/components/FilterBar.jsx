import { TEAMS, TASK_STATUSES } from '../data/teams'

export default function FilterBar({ activeTeam, activeStatus, onTeamChange, onStatusChange }) {
  return (
    <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 space-y-3 divide-y divide-zinc-800">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide min-w-fit">Team:</span>
        <button
          onClick={() => onTeamChange(null)}
          className={`text-sm px-3 py-1 rounded-full border transition-colors ${
            activeTeam === null
              ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
              : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
          }`}
        >
          All
        </button>
        {TEAMS.map((team) => (
          <button
            key={team.id}
            onClick={() => onTeamChange(team.id)}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              activeTeam === team.id
                ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                : `${team.color} opacity-70 hover:opacity-100`
            }`}
          >
            {team.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center pt-3">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide min-w-fit">Status:</span>
        <button
          onClick={() => onStatusChange(null)}
          className={`text-sm px-3 py-1 rounded-full border transition-colors ${
            activeStatus === null
              ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
              : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
          }`}
        >
          All
        </button>
        {TASK_STATUSES.map((status) => (
          <button
            key={status.id}
            onClick={() => onStatusChange(status.id)}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              activeStatus === status.id
                ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                : `${status.color} opacity-70 hover:opacity-100`
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  )
}
