import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IPickedEntry {
  memberId: Types.ObjectId
  pickedAt: Date
}

export interface IRound extends Document {
  number: number
  pickedIds: Types.ObjectId[]
  picked: IPickedEntry[]
  isComplete: boolean
  lastPickedAt: Date | null
}

const RoundSchema = new Schema<IRound>(
  {
    number:       { type: Number, required: true, default: 1 },
    pickedIds:    [{ type: Schema.Types.ObjectId, ref: 'Member' }],
    picked: [
      {
        memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
        pickedAt: { type: Date, default: Date.now },
      }
    ],
    isComplete:   { type: Boolean, default: false },
    lastPickedAt: { type: Date, default: null },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret: any) => { delete ret._id },
    },
  }
)

export default mongoose.model<IRound>('Round', RoundSchema)