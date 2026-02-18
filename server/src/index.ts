import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import membersRouter from './routes/members'
import roundRouter from './routes/round'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/members', membersRouter)
app.use('/api/round', roundRouter)

mongoose
    .connect(process.env.MONGODB_URI!)
    .then(() => {
        console.log('Connected to MongoDB')
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    })
    .catch((err) => console.error('Couldnt connect to MongoDB:', err))