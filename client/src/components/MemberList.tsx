import type { Member, PickedEntry } from '../types'

interface Props {
  members: Member[]
  pickedIds: string[]
  picked: PickedEntry[]
  onDelete: (id: string) => void
}

function MemberList({ members, pickedIds, picked, onDelete }: Props) {
  console.log('picked:', picked)
  console.log('members:', members)
  if (members.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        No participants yet — add the first one
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-[#3a3a3c]">
      {members.map((member) => {
        const isPicked = pickedIds.includes(member.id)
        const entry = picked.find((p) => String(p.memberId) === String(member.id))
        return (
          <li
            key={member.id}
            className={`flex items-center justify-between py-3 ${isPicked ? 'opacity-40' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${isPicked ? 'line-through' : ''}`}>
                {member.name}
              </span>
              {isPicked && entry && (
                <span className="text-xs text-gray-400">
                  picked · {new Date(entry.pickedAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
            <button
              onClick={() => onDelete(member.id)}
              className="text-xs text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors"
            >
              remove
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default MemberList