import { Router, Request, Response } from 'express'
import Member from '../models/Member'
import Round from '../models/Round'
import { Types } from 'mongoose'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  let round = await Round.findOne({ isComplete: false })
    .populate('pickedIds')
    .populate('lastWinner')
    .populate('lastReviewers')

  if (!round) {
    const lastRound = await Round.findOne().sort({ number: -1 })
    round = await Round.create({
      number: (lastRound?.number ?? 0) + 1
    })
    await round.populate('pickedIds')
    await round.populate('lastWinner')
    await round.populate('lastReviewers')
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
  round.lastWinner = winner._id as Types.ObjectId
  round.lastReviewers = reviewers.map((r) => r._id as Types.ObjectId)

  if (round.pickedIds.length === allMembers.length) {
    round.isComplete = true
    await round.save()
    await Round.deleteMany({ isComplete: true })
    const newRound = await Round.create({ number: 1 })
    res.json({ winner, reviewers, round: newRound })
    return
  }

  await round.save()
  await round.populate('pickedIds')
  await round.populate('lastWinner')
  await round.populate('lastReviewers')

  res.json({ winner, reviewers, round })
})

router.post('/pick-manual', async (req: Request, res: Response) => {
  const { memberId } = req.body

  if (!memberId) {
    res.status(400).json({ message: 'memberId is required' })
    return
  }

  let round = await Round.findOne({ isComplete: false })

  if (!round) {
    const lastRound = await Round.findOne().sort({ number: -1 })
    round = await Round.create({
      number: (lastRound?.number ?? 0) + 1
    })
  }

  const winner = await Member.findById(memberId)

  if (!winner) {
    res.status(404).json({ message: 'Member not found' })
    return
  }

  const alreadyPicked = round.pickedIds.some((id) =>
    id.equals(winner._id as Types.ObjectId)
  )
  if (alreadyPicked) {
    res.status(400).json({ message: 'Member already picked this round' })
    return
  }

  round.pickedIds.push(winner._id as Types.ObjectId)
  round.picked.push({
    memberId: winner._id as Types.ObjectId,
    pickedAt: new Date(),
  })
  round.lastPickedAt = new Date()
  round.lastWinner = winner._id as Types.ObjectId
  round.lastReviewers = []

  const allMembers = await Member.find()

  if (round.pickedIds.length === allMembers.length) {
    round.isComplete = true
    await round.save()
    await Round.deleteMany({ isComplete: true })
    const newRound = await Round.create({ number: 1 })
    res.json({ winner, round: newRound })
    return
  }

  await round.save()
  await round.populate('pickedIds')
  await round.populate('lastWinner')
  await round.populate('lastReviewers')

  res.json({ winner, round })
})

router.post('/repick', async (_req: Request, res: Response) => {
  let round = await Round.findOne({ isComplete: false })

  if (!round || !round.lastWinner) {
    res.status(400).json({ message: 'No winner to repick' })
    return
  }

  const allMembers = await Member.find()
  const winnerId = round.lastWinner as Types.ObjectId

  // Remove last winner from pickedIds
  round.pickedIds = round.pickedIds.filter((id) => !id.equals(winnerId))
  round.picked = round.picked.filter((p) => !p.memberId.equals(winnerId))

  // Pick new winner from remaining
  const available = allMembers.filter(
    (m) => !round!.pickedIds.some((id) => id.equals(m._id as Types.ObjectId))
  )

  if (available.length === 0) {
    res.status(400).json({ message: 'No available participants' })
    return
  }

  const shuffled = available.sort(() => Math.random() - 0.5)
  const newWinner = shuffled[0]

  round.pickedIds.push(newWinner._id as Types.ObjectId)
  round.picked.push({
    memberId: newWinner._id as Types.ObjectId,
    pickedAt: new Date(),
  })
  round.lastWinner = newWinner._id as Types.ObjectId
  round.lastPickedAt = new Date()

  await round.save()
  await round.populate('pickedIds')
  await round.populate('lastWinner')
  await round.populate('lastReviewers')

  res.json({ winner: newWinner, reviewers: round.lastReviewers, round })
})

router.post('/repick-reviewers', async (_req: Request, res: Response) => {
  let round = await Round.findOne({ isComplete: false })

  if (!round || !round.lastWinner) {
    res.status(400).json({ message: 'No round to repick reviewers' })
    return
  }

  const allMembers = await Member.find()
  const winnerId = round.lastWinner as Types.ObjectId

  const reviewerPool = allMembers
    .filter((m) => !m._id.equals(winnerId))
    .sort(() => Math.random() - 0.5)
  const reviewers = reviewerPool.slice(0, 3)

  round.lastReviewers = reviewers.map((r) => r._id as Types.ObjectId)
  await round.save()
  await round.populate('pickedIds')
  await round.populate('lastWinner')
  await round.populate('lastReviewers')

  res.json({ reviewers, round })
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