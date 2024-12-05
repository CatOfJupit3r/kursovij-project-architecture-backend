import { getModelForClass, prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';

export class CommentClass {
    @prop({ required: true, unique: true, index: true })
    commentId: Types.ObjectId;

    @prop({ required: true, index: true })
    postId: Types.ObjectId;

    @prop({ required: true, index: true })
    userId: string;

    @prop({ default: 'Wow... So empty!' })
    content: string;

    @prop({ required: true })
    createdAt: Date;
}

const CommentModel = getModelForClass(CommentClass, {
    schemaOptions: {
        collection: 'comments',
    },
});

export default CommentModel;
