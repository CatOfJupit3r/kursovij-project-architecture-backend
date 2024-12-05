import { createRouteInController } from '@controllers/RouteInController';
import { PostIdZodSchema } from '@models/ZodSchemas';
import AuthService from '@services/AuthService';
import DatabaseService from '@services/DatabaseService';
import { z } from 'zod';

class PostController {
    getMostLikedPosts = createRouteInController(
        async (req, res, _) => {
            const { limit: limitQuery, skip: skipQuery, period } = req.query;
            const limit = limitQuery && !isNaN(parseInt(limitQuery as string)) ? parseInt(limitQuery as string) : 10;
            const skip = skipQuery && !isNaN(parseInt(skipQuery as string)) ? parseInt(skipQuery as string) : 0;

            const posts = await DatabaseService.getMostLikedPosts(limit, skip, period as string);
            res.status(200).json({ posts, message: 'Posts fetched successfully' }); // TODO: enum
        },
        {
            query: z.object({
                limit: z
                    .string()
                    .refine((limit) => !isNaN(parseInt(limit)), 'Limit must be a number')
                    .optional(),
                period: z.enum(['day', 'week', 'month', 'year']).optional(),
                skip: z
                    .string()
                    .refine((skip) => !isNaN(parseInt(skip)), 'Skip must be a number')
                    .optional(),
            }),
        }
    );

    addNewCommentToPost = createRouteInController(
        async (req, res, _) => {
            const { post_id: postId } = req.params;
            const { content } = req.body;
            const user = await AuthService.verifyAuthorizationHeader(req.headers.authorization);
            await DatabaseService.addNewCommentToPost(postId, content, user.userId.toString());
            res.status(200).send({ message: 'Comment added successfully' }); // TODO: enum
        },
        {
            body: z.object({
                content: z.string().min(1).max(32768),
            }),
            params: PostIdZodSchema,
        }
    );

    likePost = createRouteInController(
        async (req, res, _) => {
            const { post_id: postId } = req.params;
            const user = await AuthService.verifyAuthorizationHeader(req.headers.authorization);
            const { isUnliked } = await DatabaseService.togglePostLike(user.userId.toString(), postId);
            res.status(200).send({
                message: isUnliked ? 'Post unliked successfully' : 'Post liked successfully',
            }); // TODO: enum
        },
        {
            params: PostIdZodSchema,
        }
    );

    createNewPost = createRouteInController(
        async (req, res, _) => {
            const { content } = req.body;
            const user = await AuthService.verifyAuthorizationHeader(req.headers.authorization);
            await DatabaseService.createNewPost(user.userId.toString(), content);
            res.status(200).send({ message: 'Post created successfully' }); // TODO: enum
        },
        {
            body: z.object({
                content: z.string().min(1).max(32768),
            }),
        }
    );

    getPostComments = createRouteInController(
        async (req, res, _) => {
            const { post_id: postId } = req.params;
            const comments = await DatabaseService.getCommentsForPost(postId);
            res.status(200).json({ comments, message: 'Comments fetched successfully' }); // TODO: enum
        },
        {
            params: PostIdZodSchema,
        }
    );
}

export default new PostController();
