import {JWT_ACCESS_SECRET, JWT_REFRESH_SECRET} from '@configs'
import {BadRequest} from '@models/ErrorModels'
import jwt from 'jsonwebtoken'
import UserModel, {UserClass} from "@models/UserModel";

export type ParsedAccessTokenPayload = {
    userId: string
    profile: {
        handle: string
        email: string
        name: string
        bio: string
        following: string[]
        saved: string[]
        birthdate: Date
        avatar: string
        cover: string
    }
}

class AuthService {
    refreshTokens: Array<string> = []

    public userClassToPayload(user: UserClass): ParsedAccessTokenPayload {
        return {
            userId: user.userId.toString(),
            profile: user.profile
        }
    }

    private _createAccessToken = (user: ParsedAccessTokenPayload) => {
        return jwt.sign(user, JWT_ACCESS_SECRET, {
            expiresIn: '7d',
        })
    }

    private _createRefreshToken = (user: ParsedAccessTokenPayload) => {
        return jwt.sign(user, JWT_REFRESH_SECRET, {
            expiresIn: '7d',
        })
    }

    generateAccessToken(user: UserClass) {
        const payload: ParsedAccessTokenPayload = this.userClassToPayload(user)
        return this._createAccessToken(payload)
    }

    generateRefreshToken(user: UserClass) {
        const payload: ParsedAccessTokenPayload = this.userClassToPayload(user)
        return this._createRefreshToken(payload)
    }

    issueNewAccessToken(refreshToken: string) {
        const decodedUser = this.verifyRefreshToken(refreshToken)
        return this._createAccessToken(decodedUser)
    }

    verifyAccessToken(accessToken: string): ParsedAccessTokenPayload {
        if (!accessToken) {
            throw new BadRequest('Access token is missing')
        }
        return jwt.verify(accessToken, JWT_ACCESS_SECRET) as ParsedAccessTokenPayload
    }

    verifyAuthorizationHeader = async (header: unknown): Promise<UserClass> => {
        if (!header) {
            throw new BadRequest('Authorization header is missing')
        } else if (!(typeof header === 'string')) {
            throw new BadRequest('Authorization header is not a string')
        } else if (!header.startsWith('Bearer ')) {
            throw new BadRequest('Authorization header does not start with "Bearer "')
        } else {
            const token = header.replace('Bearer ', '')
            const user = this.verifyAccessToken(token)

            if (!user) throw new BadRequest('Invalid token');
            const userInDb = await UserModel.findByStringId(user.userId);
            if (!userInDb) throw new BadRequest('User not found');
            return userInDb;
        }
    }

    verifyRefreshToken(refreshToken: string): ParsedAccessTokenPayload {
        if (!this.refreshTokens.includes(refreshToken)) {
            throw new BadRequest('Refresh token is not valid')
        }
        return jwt.verify(refreshToken, JWT_REFRESH_SECRET) as ParsedAccessTokenPayload
    }

    invalidateRefreshToken(refreshToken: string) {
        this.refreshTokens = this.refreshTokens.filter((t) => t !== refreshToken)
    }
}

export default new AuthService()
