import { errorHandlerMiddleware } from '@middlewares/ErrorHandlerMiddleware';
import indexRoutes from '@routes/indexRoutes';
import postsRoutes from '@routes/postsRoutes';
import usersRoutes from '@routes/usersRoutes';
import cors from 'cors';
import express, { Application } from 'express';

const setupExpress = async ({ app }: { app: Application }) => {
    app.use(cors());
    app.use(express.json());

    app.use('/', indexRoutes);
    app.use('/users', usersRoutes);
    app.use('/posts', postsRoutes);

    app.use(errorHandlerMiddleware);
};

export default setupExpress;
