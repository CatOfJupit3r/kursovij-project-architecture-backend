import { createRouteInController } from '@controllers/RouteInController';
import {z} from "zod";
import { Request, Response } from 'express'
import {Exception, Forbidden, InternalServerError} from "@models/ErrorModels";
import UserService from "@services/UserService";
import AuthService from "@services/AuthService";
import {ERROR_MESSAGES} from "../enums";

export const LoginSchema = z.object({
    handle: z.string().min(3),
    password: z.string().min(6),
})


class LoggedInController {
    login = createRouteInController(
        async (req: Request, res: Response) => {
            const { handle, password } = req.body

            try {
                const { accessToken, refreshToken } = await UserService.loginWithPassword({ handle, password })
                res.status(200).json({
                    accessToken,
                    refreshToken,
                    message: 'Logged in successfully', // TODO: enum
                })
            } catch (error) {
                if (error instanceof Exception) throw error
                else {
                    console.log(error)
                    throw new InternalServerError('Something went wrong')
                }
            }
        },
        { body: LoginSchema }
    )

    register = createRouteInController(
        async (req: Request, res: Response) => {
            const { handle, password, email } = req.body

            try {
                await UserService.createAccount({ handle, password, email })
                const { accessToken, refreshToken } = await UserService.loginWithPassword({ handle, password })
                res.status(200).json({
                    accessToken,
                    refreshToken,
                    message: 'Registered successfully', // TODO: enum
                })
            } catch (error) {
                if (error instanceof Exception) throw error
                else {
                    console.log(error)
                    throw new InternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
                }
            }
        },
        { body: z.object({
            handle: z.string().min(3),
            password: z.string().min(6),
            email: z.string().email(),
        }) }
    )

    token = createRouteInController(
        async (req: Request, res: Response) => {
            const { token: refreshToken } = req.body
            if (!refreshToken || typeof refreshToken !== 'string') throw new Forbidden()

            try {
                const { accessToken } = UserService.loginWithRefreshToken(refreshToken)
                res.status(200).json({ accessToken, message: 'Token refreshed' }) // TODO: enum
            } catch (error) {
                if (error instanceof Exception) throw error
                else {
                    console.log(error)
                    throw new Forbidden()
                }
            }
        },
        {
            body: z.object({
                token: z.string().min(1),
            }),
        }
    )

    logout = createRouteInController(
        async (req: Request, res: Response) => {
            const { token: refreshToken } = req.body

            try {
                UserService.logout(refreshToken)
                res.status(200).json({ message: 'Logged out' }) // TODO: enum
            } catch (error) {
                console.log(error)
                throw new Forbidden()
            }
        },
        {
            body: z.object({
                token: z.string().min(1),
            }),
        }
    )
    
    getUserInfo = createRouteInController(
        async (req: Request, res: Response) => {
            const user = await AuthService.verifyAuthorizationHeader(req.headers.authorization)
            const profile = await UserService.getProfile(user.userId.toString())
            res.status(200).json({ profile, message: 'User info fetched' }) // TODO: enum
        },
    )
}

export default new LoggedInController();
