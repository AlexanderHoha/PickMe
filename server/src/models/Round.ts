import { Schema, model, Document, Types } from 'mongoose'

export interface IRound extends Document {
    number: number,
    pickedIds: Types.ObjectId[],
    isComplete: boolean,
}

const RoundSchema: Schema = new Schema<IRound>({
    number: { type: Number, required: true, default: 1 },
    pickedIds: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
    isComplete: { type: Boolean, default: false }
},
    {
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (_, ret: any) => {
                delete ret._id
            }
        }
    }
)

export default model<IRound>('Round', RoundSchema)