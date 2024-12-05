import { EMAIL_REGEX } from '@configs';
import { getModelForClass, modelOptions, prop, ReturnModelType } from '@typegoose/typegoose';
import { Types } from 'mongoose';

@modelOptions({ schemaOptions: { _id: false } })
class SessionClass {
    @prop({ required: true })
    session_id: string;

    @prop({ default: () => new Date() })
    createdAt: Date; // we use it to nullify session after some time
}

@modelOptions({ schemaOptions: { _id: false } })
class AuthClass {
    @prop({ required: true })
    hashedPassword: string;

    @prop({ required: true })
    sessions: SessionClass[];
}

@modelOptions({ schemaOptions: { _id: false } })
class ProfileClass {
    @prop({ required: true, unique: true })
    handle: string;

    @prop({ required: true })
    name: string;

    @prop({ required: true, match: EMAIL_REGEX })
    email: string;

    @prop({ default: 'Wow... So empty!' })
    bio: string;

    @prop({ type: () => [String], default: [] })
    following: string[];

    @prop({ type: () => [String], default: [] })
    saved: string[];

    @prop()
    birthdate: Date;

    @prop({ default: '' })
    avatar: string;

    @prop({ default: '' })
    cover: string;
}

export class UserClass {
    @prop({ required: true, unique: true })
    userId: Types.ObjectId;

    @prop({ required: true })
    createdAt: Date;

    @prop({ required: true, type: () => ProfileClass })
    profile: ProfileClass;

    @prop({ required: true, type: () => AuthClass })
    auth: AuthClass;

    public static async findByHandle(this: ReturnModelType<typeof UserClass>, handle: string) {
        return this.findOne({ 'profile.handle': handle }).exec();
    }
    
    public static async findByStringId(this: ReturnModelType<typeof UserClass>, id: string) {
        return this.findOne({ userId: new Types.ObjectId(id) }).exec();
    }
    
    public static async getFollowersCount(this: ReturnModelType<typeof UserClass>, userId: Types.ObjectId): Promise<number> {
        const [result] = await this.aggregate([
            // Unwind the following array
            {
                $unwind: {
                    path: '$profile.following',
                    preserveNullAndEmptyArrays: true,
                },
            },
            // Group by following to count followers
            {
                $group: {
                    _id: '$profile.following',
                    followers: {
                        $sum: 1,
                    },
                },
            },
            // Match the specific user ID
            {
                $match: {
                    _id: userId.toString(),
                },
            },
            // Project only the followers count
            {
                $project: {
                    _id: 0,
                    followers: 1,
                },
            },
        ]);
        return result ? result.followers : 0;
    }
    
    
}

const UserModel = getModelForClass(UserClass, {
    schemaOptions: {
        collection: 'users',
    },
});

export default UserModel;
