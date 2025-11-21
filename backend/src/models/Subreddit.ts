import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ISubreddit extends Document {
    name: string;
    description: string;
    creator: IUser['_id'];
    members: IUser['_id'][];
    createdAt: Date;
    updatedAt: Date;
}

const SubredditSchema = new Schema<ISubreddit>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: /^[a-z0-9_]{3,21}$/,
        },
        description: {
            type: String,
            required: true,
            maxlength: 500,
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const Subreddit = mongoose.model<ISubreddit>('Subreddit', SubredditSchema);
