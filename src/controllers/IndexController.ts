import { createRouteInController } from '@controllers/RouteInController';

class IndexController {
    index = createRouteInController((req, res) => {
        res.status(200).send({ message: 'Welcome!' });
    });

    health = createRouteInController((req, res) => {
        res.status(200).send({ message: 'OK' });
    });
}

export default new IndexController();
