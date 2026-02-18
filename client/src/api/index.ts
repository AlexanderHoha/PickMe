import axios from 'axios'
import type { Member, Round, PickResult } from '../types'

const api = axios.create({
    baseURL: 'https://pickme-production.up.railway.app/api',
})

export const getMembers = async (): Promise<Member[]> => {
    const { data } = await api.get('/members')
    return data
}

export const addMember = async (name: string): Promise<Member> => {
    const { data } = await api.post('/members', { name })
    return data
}

export const deleteMember = async (id: string): Promise<void> => {
    await api.delete(`/members/${id}`)
}

export const getRound = async (): Promise<Round> => {
    const { data } = await api.get('/round')
    return data
}

export const pickMember = async (): Promise<PickResult> => {
    const { data } = await api.post('/round/pick')
    return data
}

export const resetRound = async (): Promise<Round> => {
    const { data } = await api.delete('/round')
    return data
}