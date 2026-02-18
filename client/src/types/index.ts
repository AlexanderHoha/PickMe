export interface Member {
  id: string
  name: string
  createdAt: string
}

export interface PickedEntry {
  memberId: string
  pickedAt: string
}

export interface Round {
  id: string
  number: number
  pickedIds: Member[]
  picked: PickedEntry[]
  isComplete: boolean
  lastPickedAt: string | null
  lastWinner: Member | null
  lastReviewers: Member[]
}

export interface PickResult {
  winner: Member
  reviewers: Member[]
  round: Round
}