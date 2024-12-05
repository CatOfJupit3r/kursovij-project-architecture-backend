import { MONGO_PASS, MONGO_URI, MONGO_USER } from '@configs';
import { BadRequest, InternalServerError } from '@models/ErrorModels';
import PostModel, { PostClass } from '@models/PostModel';
import UserModel, { UserClass } from '@models/UserModel';
import { DocumentType } from '@typegoose/typegoose';
import mongoose, { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import CommentModel, { CommentClass } from '@models/CommentModel';

type SupportedDocumentTypes = DocumentType<PostClass> | DocumentType<UserClass> | DocumentType<CommentClass>;

const getBeforeDate = (period: string) => {
    const date = new Date();
    switch (period) {
        case 'day':
            date.setDate(date.getDate() - 1);
            break;
        case 'week':
            date.setDate(date.getDate() - 7);
            break;
        case 'month':
            date.setMonth(date.getMonth() - 1);
            break;
        case 'year':
            date.setFullYear(date.getFullYear() - 1);
            break;
        default:
            throw new BadRequest('Invalid period');
    }
    return date;
};

class DatabaseService {
    public setup = async (): Promise<void> => {
        await mongoose.connect(MONGO_URI, {
            user: MONGO_USER,
            pass: MONGO_PASS,
        });
        console.log('Database is connected');
    };

    private async findUserById(userId: string): Promise<DocumentType<UserClass>>;
    private async findUserById(userId: string, autoThrow: true): Promise<DocumentType<UserClass>>;
    private async findUserById(userId: string, autoThrow: false): Promise<DocumentType<UserClass> | null>;
    private async findUserById(userId: string, autoThrow: boolean = true) {
        const user = await UserModel.findByStringId(userId);
        if (!user && autoThrow) throw new BadRequest('User not found');
        return user;
    }

    private async findPostById(postId: string, autoThrow: true): Promise<DocumentType<PostClass>>;
    private async findPostById(postId: string): Promise<DocumentType<PostClass>>;
    private async findPostById(postId: string, autoThrow: false): Promise<DocumentType<PostClass>>;
    private async findPostById(postId: string, autoThrow: boolean = false): Promise<DocumentType<PostClass> | null> {
        const post = await PostModel.findByStringId(postId);
        if (!post && autoThrow) throw new BadRequest('Post not found');
        return post;
    }

    public createNewUser = async (handle: string, hashedPassword: string, email: string) => {
        const user = new UserModel({
            userId: new mongoose.Types.ObjectId(),
            createdAt: new Date(),
            auth: {
                hashedPassword,
                sessions: [],
            },
            profile: {
                handle,
                email,
                name: handle,
                bio: '',
                following: [],
                saved: [],
                birthdate: new Date(),
                avatar: '',
                cover: '',
            },
        });
        await this.saveDocument(user);
        return user;
    };

    public addFollowerToUser = async (newFollowerId: string, userToFollowId: string) => {
        await this.findUserById(userToFollowId); // find if user to follow exists
        const follower = await this.findUserById(newFollowerId, true);
        if (follower.profile.following.includes(userToFollowId)) return;
        follower.profile.following.push(userToFollowId);
        await this.saveDocument(follower);
    };

    public addNewCommentToPost = async (postId: string, content: string, authorId: string) => {
        // Verify post exists
        await this.findPostById(postId);

        const comment = new CommentModel({
            commentId: new mongoose.Types.ObjectId(),
            postId: new mongoose.Types.ObjectId(postId),
            userId: authorId,
            content,
            createdAt: new Date(),
        });

        // Save comment
        await this.saveDocument(comment);

        // Add comment ID to post's comments array
        const post = await this.findPostById(postId);
        post.comments.push(comment.commentId);
        await this.saveDocument(post);

        return comment;
    };

    public togglePostLike = async (userId: string, postId: string) => {
        await this.findUserById(userId, true); // Verify user exists
        const post = await this.findPostById(postId);

        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(userId);
        }

        const isUnliked = likeIndex > -1;

        await this.saveDocument(post);

        return {
            likes: post.likes.length,
            isUnliked,
        };
    };

    public getFreshPostsFromFollowing = async (userId: string, limit: number = 10, skip: number = 0) => {
        const user = await this.findUserById(userId);
        return PostModel.aggregate([
            {
                $match: {
                    userId: { $in: user.profile.following.map((id) => new mongoose.Types.ObjectId(id)) },
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);
    };

    public getUser = async (userId: Types.ObjectId | string) => {
        // Ensure userId is converted to ObjectId if it's not already
        const userObjectId = userId instanceof Types.ObjectId ? userId : new ObjectId(userId);

        const usersId = await UserModel.distinct('userId');

        const [user] = await UserModel.aggregate([
            {
                $match: {
                    userId: userObjectId,
                },
            },
            {
                $project: {
                    userId: 1,
                    createdAt: 1,
                    profile: 1,
                },
            },
            // Project the final result
            {
                $project: {
                    _id: 0,
                    userId: '$userId',
                    createdAt: '$createdAt',
                    profile: {
                        handle: '$profile.handle',
                        name: '$profile.name',
                        email: '$profile.email',
                        bio: '$profile.bio',
                        avatar: '$profile.avatar',
                        cover: '$profile.cover',
                        following: '$profile.following',
                        saved: '$profile.saved',
                        birthdate: '$profile.birthdate',
                    },
                },
            },
            {
                $project: {
                    auth: 0,
                },
            },
        ]);
        for (const id of usersId) {
            user.profile.followers = await UserModel.getFollowersCount(id);
        }

        return user || null;
    };

    public getAllUsersWithSubscriberCount = async () => {
        const usersIds = await UserModel.distinct('userId');
        let users: Array<DocumentType<UserClass>> = [];
        for (const userId of usersIds) {
            const user = await this.getUser(userId);
            if (user) {
                users = [...users, user];
            }
        }
        return users;
    };

    public getMostLikedPosts = async (limit: number = 10, skip = 0, period: string = 'year') => {
        // Показати 10 найпопулярніших постів за кількістю лайків.
        const date = getBeforeDate(period);

        return PostModel.aggregate([
            // {
            //     $match: {
            //         createdAt: {
            //             $gte: date,
            //         },
            //     },
            // },
            {
                $sort: {
                    likes: -1,
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);
    };

    public getCommentsForPost = async (postId: string, limit: number = 10, skip: number = 0) => {
        return CommentModel.aggregate([
            {
                $match: {
                    postId: new mongoose.Types.ObjectId(postId),
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);
    };

    public createNewPost = async (userId: string, content: string) => {
        const post = new PostModel({
            postId: new ObjectId(),
            userId,
            content,
            createdAt: new Date(),
        });
        await this.saveDocument(post);
        return post;
    };

    private saveDocument = async (document: SupportedDocumentTypes) => {
        try {
            await document.save({
                validateBeforeSave: true,
            });
        } catch (e) {
            console.log(`Validation failed for creation of ${document.baseModelName}`, e);
            throw new InternalServerError();
        }
    };
}

export default new DatabaseService();
