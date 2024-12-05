import IndexController from '@controllers/IndexController';
import { createConfig, createRouter } from '@controllers/RouteInController';
import LoggedInController from "@controllers/LoggedInController";

export default createRouter([
    createConfig('get', '/', IndexController.index),
    createConfig('get', '/health', IndexController.health),
    createConfig('post', '/login', LoggedInController.login),
    createConfig('post', '/logout', LoggedInController.logout),
    createConfig('post', '/register', LoggedInController.register),
    createConfig('post', '/token', LoggedInController.token),
]);
