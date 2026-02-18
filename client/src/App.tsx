import { useState, useEffect } from 'react'
import type { Member, Round } from './types'
import { getMembers, addMember, deleteMember, getRound, pickMember, resetRound } from './api'
import MemberList from './components/MemberList'
import AddMember from './components/AddMember'
import Spinner from './components/Spinner'

function App() {
  const [members, setMembers] = useState<Member[]>([])
  const [round, setRound] = useState<Round | null>(null)
  const [winner, setWinner] = useState<Member | null>(null)
  const [reviewers, setReviewers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [picking, setPicking] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const loadData = async () => {
    setLoading(true)
    const [membersData, roundData] = await Promise.all([
      getMembers(),
      getRound(),
    ])
    setMembers(membersData)
    setRound(roundData)
    if (roundData.lastWinner) {
      setWinner(roundData.lastWinner)
      setReviewers(roundData.lastReviewers)
    }
    setLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      await loadData()
    }
    init()
  }, [])

  const handleAdd = async (name: string) => {
    const newMember = await addMember(name)
    setMembers((prev) => [...prev, newMember])
  }

  const handleDelete = async (id: string) => {
    await deleteMember(id)
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const handlePick = async () => {
    setPicking(true)
    const { winner: picked, reviewers: pickedReviewers, round: updatedRound } = await pickMember()
    setWinner(picked)
    setReviewers(pickedReviewers)
    setRound(updatedRound)
    setPicking(false)
  }

  const handleReset = async () => {
    setResetting(true)
    const newRound = await resetRound()
    setRound(newRound)
    setWinner(null)
    setReviewers([])
    setResetting(false)
  }

  const pickedIds = round?.pickedIds.map((m) => m.id) ?? []
  const remaining = members.length - pickedIds.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1c1c1e] text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PickMe</h1>
            {round && (
              <p className="text-sm text-gray-400 mt-1">
                Round {round.number} · {remaining} of {members.length} remaining
              </p>
            )}
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="p-2 rounded-lg border border-gray-200 dark:border-[#3a3a3c] hover:bg-gray-100 dark:hover:bg-[#2c2c2e] transition-colors text-lg"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <>
            {/* Winner */}
            {(winner || picking) && (
              <div className="mb-8 bg-white dark:bg-[#2c2c2e] border border-gray-200 dark:border-[#3a3a3c] rounded-lg overflow-hidden">
                {picking ? (
                  <Spinner />
                ) : (
                  <>
                    <div className="p-6 border-b border-gray-100 dark:border-[#3a3a3c]">
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">PR creator</p>
                      <img src="/GAGAGA-4x.png" className="w-20 h-20 object-contain"></img>
                      <p className="text-2xl font-semibold">{winner?.name}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Reviewers</p>
                      {reviewers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {reviewers.map((r) => (
                            <span
                              key={r.id}
                              className="px-3 py-1 bg-gray-100 dark:bg-[#3a3a3c] text-sm text-gray-600 dark:text-gray-300 rounded-full"
                            >
                              {r.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Not enough participants</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Pick button */}
            <button
              onClick={handlePick}
              disabled={remaining === 0 || picking}
              className="w-full py-3 bg-gray-900 dark:bg-[#f5f5f5] text-white dark:text-[#1c1c1e] text-sm font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-gray-300 disabled:bg-gray-200 dark:disabled:bg-[#2c2c2e] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors mb-3"
            >
              {picking ? 'Picking...' : 'Pick random'}
            </button>

            {/* Reset button */}
            <button
              onClick={handleReset}
              disabled={resetting}
              className="w-full py-3 border border-gray-200 dark:border-[#3a3a3c] text-sm text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2c2c2e] disabled:cursor-not-allowed transition-colors mb-10"
            >
              {resetting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
                  Resetting...
                </span>
              ) : (
                'Reset round'
              )}
            </button>

            {/* Add member */}
            <div className="mb-6">
              <AddMember onAdd={handleAdd} />
            </div>

            {/* Members list */}
            <MemberList
              members={members}
              pickedIds={pickedIds}
              picked={round?.picked ?? []}
              onDelete={handleDelete}
            />
          </>
        )}

      </div>
    </div>
  )
}

export default App