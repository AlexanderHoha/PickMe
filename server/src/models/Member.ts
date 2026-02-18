import { Schema, model, Document } from 'mongoose'

export interface IMember extends Document {
    name: string,
    createdAt: Date
}

const MemberSchema: Schema = new Schema({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
},
    {
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (doc, ret: any) => {
                delete ret._id
            }
        }
    }
)

export default model<IMember>('Member', MemberSchema)