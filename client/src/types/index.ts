export interface Member {
    id: string
    name: string
    createdAt: string
}

export interface Round {
    id: string
    number: number
    pickedIds: Member[]
    isComplete: boolean
}

export interface PickResult {
  winner: Member
  reviewers: Member[]
  round: Round
}