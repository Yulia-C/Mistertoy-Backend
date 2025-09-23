import { authService } from "./auth.service.js"
import { loggerService } from "../../services/logger.service.js"

export async function login(req, res) {
    const { username, password, email } = req.body
    try {
        const user = await authService.login(username, password, email)
        const loginToken = authService.getLoginToken(user)
        loggerService.info('User login:', user)
        res.cookie('loginToken', loginToken)
        res.json(user)
    } catch (err) {
        loggerService.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

export async function signup(req, res) {
    const { username, password, fullname, email, imgUrl, gender, balance, isAdmin } = req.body
    console.log('{username, password, fullname, email, imgUrl, gender, balance, isAdmin}:', { username, password, fullname, email, imgUrl, gender, balance, isAdmin })
    //    const user ={ username, password, fullname, email, imgUrl, gender, balance, isAdmin }
    try {
        const account = await authService.signup({ username, password, fullname, email, imgUrl, gender, balance, isAdmin })
        loggerService.debug(`auth.route - new account created: ` + account)

        const user = await authService.login(username, password, email)
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)
        res.json(user)

    } catch (err) {
        loggerService.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

export function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}
