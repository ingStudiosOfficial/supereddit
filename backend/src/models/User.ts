import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    discordId: string;
    username: string;
    discriminator: string;
    avatar: string;
    lastLogin: Date;
    loginCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        discordId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        username: {
            type: String,
            required: true,
        },
        discriminator: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        lastLogin: {
            type: Date,
            default: Date.now,
        },
        loginCount: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model<IUser>('User', UserSchema);
