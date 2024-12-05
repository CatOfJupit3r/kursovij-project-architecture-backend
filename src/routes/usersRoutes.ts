import { createConfig, createRouter } from '@controllers/RouteInController';
import UserController from '@controllers/UserController';
import {authenticationMiddleware} from "@middlewares/AuthenticationMiddleware";
import LoggedInController from "@controllers/LoggedInController";

export default createRouter([
    createConfig('get', '/', UserController.getAllUsersWithSubscriberCount),
    createConfig('get', '/me', LoggedInController.getUserInfo, [authenticationMiddleware]),
    createConfig('get', '/me/feed', UserController.getFreshPostsFromFollowedUsers, [authenticationMiddleware]),
    createConfig('post', '/:user_id/follow', UserController.followUser, [authenticationMiddleware]),
    
]);
