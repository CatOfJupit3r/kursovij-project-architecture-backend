import { Exception, Unauthorized } from '@models/ErrorModels';
import AuthService from '@services/AuthService';
import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export const authenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.headers || !req.headers.authorization) {
            return next(
                new Unauthorized('Authentication Failed', {
                    reason: 'Authorization header is missing',
                })
            );
        }
        const decoded = await AuthService.verifyAuthorizationHeader(req.headers.authorization);

        if (!decoded) {
            return next(
                new Unauthorized('Authentication Failed', {
                    reason: 'Invalid token',
                })
            );
        }
        next();
    } catch (err: unknown) {
        if (err instanceof TokenExpiredError)
            return next(new Unauthorized('Authentication Failed', { reason: 'Token expired' }));
        if (err instanceof JsonWebTokenError) {
            return next(
                new Unauthorized('Authentication Failed', {
                    reason: 'Invalid token',
                })
            );
        }
        if (!(err instanceof Unauthorized)) console.log('Error in Authentication Middleware:', err);
        if (err instanceof Exception)
            return next(
                new Unauthorized('Authentication Failed', {
                    ...err.additionalData,
                })
            );
        return next(
            new Unauthorized('Authentication Failed', {
                reason: 'Unknown error',
            })
        );
    }
};
