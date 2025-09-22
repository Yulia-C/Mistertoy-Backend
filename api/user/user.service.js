import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { reviewService } from '../review/review.service.js'

export const userService = {
    query,
    getById,
    getByEmail,
    remove,
    add,
    update,
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)

    try {
        const collection = await dbService.getCollection('user')
        let users = await collection.find(criteria).sort({ fullName: -1 }).toArray()

        users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            return user
        })
        return users
    } catch (err) {
        loggerService.error('cannot find users', err)
        throw err
    }

}

async function getById(userId) {
    try {
        let criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)
        delete user.password

        criteria = { byUserId: userId }
        user.givenReviews = await reviewService.query(criteria)

        user.givenReviews.map(review => {
            delete review.byUser
        })

        return user
    } catch (err) {
        loggerService.error(`Cannot find user  ${userId}`, err)
        throw err
    }

}

async function getByEmail(email) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ email })
        return user
    } catch (err) {
        loggerService.error(`while finding user ${user}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('user')
        await collection.deleteOne({ _id: ObjectId.createFromHexString(userId) })
    } catch (err) {
        loggerService.error(`Cannot remove user ${userId}`, err)
        throw err
    }
}

async function add(user) {
    try {
        const existingUser = await getByEmail(user.email)
        if (existingUser) throw new Error('Email already in use')

        const userToAdd = {
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            email: user.email,
            gender: user.gender,
            imgUrl: user.imgUrl,
            balance: user.balance,
            isAdmin: user.isAdmin,
        }

        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        loggerService.error('Cannot insert user', err)
        throw err
    }
}

async function update(user) {
    try {
        const userToSave = {
            _id: ObjectId.createFromHexString(user._id),
            username: user.username,
            fullname: user.fullname,
            balance: user.balance,
        }
        console.log('user update:', userToSave)
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        loggerService.error(`cannot update user ${user._id}`, err)
        throw err
    }

}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            { username: txtCriteria, },
            { fullname: txtCriteria, },
            { email: txtCriteria, },
        ]
    }

    if (filterBy.minBalance) {
        criteria.balance = { $gte: filterBy.minBalance }
    }
    return criteria
}