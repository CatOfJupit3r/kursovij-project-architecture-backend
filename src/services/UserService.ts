import {BadRequest, Forbidden, NotFound} from '@models/ErrorModels'
import UserModel, { UserClass } from '@models/UserModel'
import bcrypt from 'bcrypt'
import { omit } from 'lodash'
import AuthService from './AuthService'
import DatabaseService from './DatabaseService'
import {ObjectId} from "mongodb";

class UserService {
    #privateFields = ['auth']

    #omitPrivateFields = (user: UserClass) => omit(user, this.#privateFields)

    async createAccount({ handle, password, email }: { handle: string; password: string, email: string }) {
        const user = await this.findByHandle(handle, false)
        if (user) throw new BadRequest(`User with handle ${handle} is already registered`)

        const hashedPassword = await bcrypt.hash(password, 10)

        const _id = await DatabaseService.createNewUser(handle, hashedPassword, email)

        console.log(`Registered new user with handle: ${handle}. Id: ${_id}`)
    }

    async loginWithPassword({ handle, password }: { handle: string; password: string }) {
        const user = (await this.findByHandle(handle, true)) as UserClass

        if (!user) throw new NotFound('User not found')

        const isPasswordCorrect = await bcrypt.compare(password, user.auth.hashedPassword)
        if (!isPasswordCorrect) throw new Forbidden('Incorrect password')

        const accessToken = AuthService.generateAccessToken(user)
        const refreshToken = AuthService.generateRefreshToken(user)

        return { accessToken, refreshToken, user }
    }

    loginWithRefreshToken(refreshToken: string) {
        const accessToken = AuthService.issueNewAccessToken(refreshToken)
        return { accessToken }
    }

    logout(refreshToken: string) {
        AuthService.invalidateRefreshToken(refreshToken)
    }

    async getProfile(user_id: string) {
        const user = await DatabaseService.getUser(user_id)
        if (!user) throw new NotFound('User not found')
        return user
    }

    async findById(_id: string, shouldIncludePrivateFields: boolean) {
        const user = await UserModel.findByStringId(_id)
        if (!user) return null
        if (shouldIncludePrivateFields) return user
        return this.#omitPrivateFields(user)
    }

    async findByHandle(handle: string, shouldIncludePrivateFields: boolean) {
        const user = await UserModel.findByHandle(handle)
        if (!user) {
            return null
        }
        if (shouldIncludePrivateFields) {
            return user
        }
        return this.#omitPrivateFields(user)
    }
}

export default new UserService()
