import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { loggerService } from '../../services/logger.service.js'

export const authService = {
    signup,
    login,
    getLoginToken,
    validateToken
}
const cryptr = new Cryptr(process.env.SECRET1 || 'secret-puk-1234')

async function login(username, password, email) {
    loggerService.debug(`auth.service - login with email: ${email}`)

    const user = await userService.getByEmail(email)
    if (!user) throw new Error('Invalid email or password')

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error('Invalid email or password')

    delete user.password
    return user
}

async function signup({ username, password, fullname, email, imgUrl, gender, balance, isAdmin }) {
    const saltRounds = 10

    loggerService.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}, email: ${email}`)

    console.log('AUTH SIGNUP: username, password, fullname, email, imgUrl, gender, balance:',
        username, password, fullname, email, imgUrl, gender, balance)

    if (!username || !password || !fullname || !email) throw new Error('Missing details')

    const userExists = await userService.getByEmail(email)
    if (userExists) throw new Error('Email already exists')

    const hash = await bcrypt.hash(password, saltRounds)
    return await userService.add({ username, password: hash, fullname, email, imgUrl, gender, balance, isAdmin })
}

function getLoginToken(user) {
    const userInfo = { _id: user._id, fullname: user.fullname, isAdmin: user.isAdmin }
    const encryptedStr = cryptr.encrypt(JSON.stringify(userInfo))
    return encryptedStr
}

function validateToken(loginToken) {
    if (!loginToken) return null
    try {
        const str = cryptr.decrypt(loginToken)
        const loggedinUser = JSON.parse(str)

        return loggedinUser
    } catch (err) {
        console.log('invalid login token:', err)
    }
}
