import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IPost } from './Post';

export interface IComment extends Document {
    content: string;
    author: IUser['_id'];
    post: IPost['_id'];
    parentComment?: IComment['_id'];
    votes: number;
    voters: {
        user: IUser['_id'];
        vote: 1 | -1;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        content: {
            type: String,
            required: true,
            maxlength: 10000,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        parentComment: {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
            default: null,
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

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
