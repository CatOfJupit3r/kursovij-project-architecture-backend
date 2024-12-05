import PostController from '@controllers/PostController';
import { createConfig, createRouter } from '@controllers/RouteInController';
import {authenticationMiddleware} from "@middlewares/AuthenticationMiddleware";

export default createRouter([
    createConfig('get', '/', PostController.getMostLikedPosts),
    createConfig('post', '/', PostController.createNewPost, [authenticationMiddleware]),
    createConfig('post', '/:post_id/comments', PostController.addNewCommentToPost, [authenticationMiddleware]),
    createConfig('get', '/:post_id/comments', PostController.getPostComments),
    createConfig('post', '/:post_id/likes', PostController.likePost, [authenticationMiddleware]),
]);
