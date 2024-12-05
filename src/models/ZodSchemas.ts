import { isValidObjectId } from 'mongoose';
import { z } from 'zod';

export const ObjectIDZod = z.string().refine((id) => isValidObjectId(id), {
    message: 'Invalid ObjectID',
});

export const UserIdZodSchema = z.object({
    user_id: ObjectIDZod,
});

export const PostIdZodSchema = z.object({
    post_id: ObjectIDZod,
});
