import { createRouteInController } from '@controllers/RouteInController';
import { UserIdZodSchema } from '@models/ZodSchemas';
import DatabaseService from '@services/DatabaseService';
import { z } from 'zod';
import AuthService from "@services/AuthService";

class UserController {
    followUser = createRouteInController(
        async (req, res, _) => {
            const { user_id: userToFollow } = req.params;
            const user = await AuthService.verifyAuthorizationHeader(req.headers.authorization)
            await DatabaseService.addFollowerToUser(user.userId.toString(), userToFollow);
            res.status(200).send({ message: 'User followed successfully' }); // TODO: enum
        },
        {
            params: UserIdZodSchema,
        }
    );

    getFreshPostsFromFollowedUsers = createRouteInController(
        async (req, res, _) => {
            const { limit: limitQuery, skip: skipQuery } = req.query;
            const limit = limitQuery && !isNaN(parseInt(limitQuery as string)) ? parseInt(limitQuery as string) : 10;
            const skip = skipQuery && !isNaN(parseInt(skipQuery as string)) ? parseInt(skipQuery as string) : 0;
            
            const user = await AuthService.verifyAuthorizationHeader(req.headers.authorization);
            const posts = await DatabaseService.getFreshPostsFromFollowing(user.userId.toString(), limit, skip);
            res.status(200).json({ posts, message: 'Posts fetched successfully' }); // TODO: enum
        },
        {
            query: z.object({
                limit: z
                    .string()
                    .refine((limit) => !isNaN(parseInt(limit)), 'Limit must be a number')
                    .optional(),
                skip: z.string().refine((skip) => !isNaN(parseInt(skip)), 'Skip must be a number').optional(),
            }),
        }
    );

    getAllUsersWithSubscriberCount = createRouteInController(async (req, res, _) => {
        const users = await DatabaseService.getAllUsersWithSubscriberCount();
        res.status(200).json({ users, message: 'Users fetched successfully' }); // TODO: enum
    });
}

export default new UserController();
