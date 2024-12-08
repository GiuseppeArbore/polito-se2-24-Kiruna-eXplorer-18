import { mongoose, prop, modelOptions, getModelForClass } from "@typegoose/typegoose";
import { Stakeholders } from "./enum";

export interface LightUser {
    email: string
    role: Stakeholders
}

@modelOptions({
    schemaOptions: {
        collection: "users"
    },
})
export class User {
    _id?: mongoose.Types.ObjectId;

    @prop({ required: true, type: String })
    email!: string;

    @prop({ required: true, type: Buffer })
    password!: Buffer;

    @prop({ required: true, type: Buffer })
    salt!: Buffer;

    @prop({ required: true, type: String, enum: Stakeholders })
    role!: Stakeholders;
}

export const UserModel = getModelForClass(User);