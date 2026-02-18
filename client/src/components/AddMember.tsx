import { useState } from 'react'

interface Props {
  onAdd: (name: string) => void
}

function AddMember({ onAdd }: Props) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim())
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Participant name"
        className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-[#3a3a3c] bg-white dark:bg-[#2c2c2e] text-gray-900 dark:text-gray-100 rounded-lg outline-none focus:border-gray-400 dark:focus:border-[#5a5a5c] transition-colors"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-gray-900 dark:bg-[#f5f5f5] text-white dark:text-[#1c1c1e] text-sm rounded-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
      >
        Add
      </button>
    </form>
  )
}

export default AddMember