import e, { Router, Request, Response } from 'express'
import Member from '../models/Member'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
    const members = await Member.find()
    res.json(members)
})

router.post('/', async (req: Request, res: Response) => {
    const member = await Member.create({ name: req.body.name })
    res.status(201).json(member)
})

router.delete('/:id', async (req: Request, res: Response) => {
    const member = await Member.findByIdAndDelete(req.params.id)
    res.json({ message: 'Member deleted' })
})

export default router