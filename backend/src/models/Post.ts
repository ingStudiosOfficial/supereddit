import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ISubreddit } from './Subreddit';

export interface IPost extends Document {
    title: string;
    content: string;
    imageUrl?: string;
    author: IUser['_id'];
    subreddit: ISubreddit['_id'];
    votes: number;
    voters: {
        user: IUser['_id'];
        vote: 1 | -1;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
        content: {
            type: String,
            required: true,
            maxlength: 40000,
        },
        imageUrl: {
            type: String,
            required: false,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        subreddit: {
            type: Schema.Types.ObjectId,
            ref: 'Subreddit',
            required: true,
        },
        votes: {
            type: Number,
            default: 0,
        },
        voters: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
                vote: {
                    type: Number,
                    enum: [1, -1],
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const Post = mongoose.model<IPost>('Post', PostSchema);
