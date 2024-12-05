import { Application } from 'express';
import setupDatabase from './database';
import setupExpress from './express';

export default async ({ app }: { app: Application }) => {
    console.log('Initializing loaders...');

    console.log('Setting up Express...');
    await setupExpress({ app });
    console.log('Express setup completed...');

    console.log('Setting up database...');
    await setupDatabase();
    console.log('Database setup completed...');

    console.log('All loaders initialized...');
};
