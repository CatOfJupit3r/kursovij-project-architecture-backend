import {getModelForClass, prop, ReturnModelType} from '@typegoose/typegoose';
import { Types } from 'mongoose';

export class PostClass {
    @prop({ required: true, unique: true, index: true })
    postId: Types.ObjectId;

    @prop({ required: true, index: true })
    userId: Types.ObjectId;

    @prop({ default: 'Wow... So empty!' })
    content: string;

    @prop({ type: () => [String], default: () => [] })
    likes: string[];

    @prop({ type: () => [Types.ObjectId], default: () => [], ref: 'CommentClass' })
    comments: Types.ObjectId[];

    @prop({ required: true })
    createdAt: Date;

    public static async findByStringId(this: ReturnModelType<typeof PostClass>, id: string) {
        return this.findOne({ postId: new Types.ObjectId(id) }).exec();
    }
}

const PostModel = getModelForClass(PostClass, {
    schemaOptions: {
        collection: 'posts',
        autoIndex: false,
    },
});

export default PostModel;
