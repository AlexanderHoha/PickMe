import { Router, Request, Response } from 'express'
import Member from '../models/Member'
import Round from '../models/Round'
import { Types } from 'mongoose'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
    let round = await Round.findOne({ isComplete: false }).populate('pickedIds')

    if (!round) {
        const lastRound = await Round.findOne().sort({ number: -1 })
        round = await Round.create({
            number: (lastRound?.number ?? 0) + 1
        })
        await round.populate('pickedIds')
    }

    res.json(round)
})

router.post('/pick', async (_req: Request, res: Response) => {
  let round = await Round.findOne({ isComplete: false })

  if (!round) {
    const lastRound = await Round.findOne().sort({ number: -1 })
    round = await Round.create({
      number: (lastRound?.number ?? 0) + 1
    })
  }

  const allMembers = await Member.find()

  if (allMembers.length === 0) {
    res.status(400).json({ message: 'No participants' })
    return
  }

  const available = allMembers.filter(
    (m) => !round!.pickedIds.some(
      (id) => id.equals(m._id as Types.ObjectId)
    )
  )

  if (available.length === 0) {
    res.status(400).json({ message: 'All participants have already been winners' })
    return
  }

  const shuffled = available.sort(() => Math.random() - 0.5)
  const winner = shuffled[0]

  const reviewerPool = allMembers
    .filter((m) => !m._id.equals(winner._id as Types.ObjectId))
    .sort(() => Math.random() - 0.5)
  const reviewers = reviewerPool.slice(0, 3)

  round.pickedIds.push(winner._id as Types.ObjectId)
  round.picked.push({
    memberId: winner._id as Types.ObjectId,
    pickedAt: new Date(),
  })
  round.lastPickedAt = new Date()

  if (round.pickedIds.length === allMembers.length) {
    round.isComplete = true
  }

  await round.save()
  await round.populate('pickedIds')

  res.json({ winner, reviewers, round })
})

router.delete('/', async (_req: Request, res: Response) => {
    await Round.updateMany({ isComplete: false }, { isComplete: true })

    const lastRound = await Round.findOne().sort({ number: -1 })
    const newRound = await Round.create({
        number: (lastRound?.number ?? 0) + 1
    })

    res.json(newRound)
})

export default router