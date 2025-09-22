import { ObjectId } from 'mongodb'

import { asyncLocalStorage } from '../../services/als.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

export const reviewService = { query, add, remove }

async function query(filterBy = {}) {
    try {
        const filteredCriteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('review')
        // var reviews = await collection.find(criteria).toArray()

        let filteredReviews = await collection.aggregate([
            {
                $match: filteredCriteria,
            },
            {
                $lookup: {
                    localField: 'byUserId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'byUser'
                }
            },
            {
                $unwind: '$byUser',
            },
            {
                $lookup: {
                    localField: 'aboutToyId',
                    from: 'toy',
                    foreignField: '_id',
                    as: 'aboutToy'
                }
            },
            {
                $unwind: '$aboutToy'
            },
            {
                $project: {
                    'txt': true,
                    'rating': true,
                    'byUser._id': true, 'byUser.fullname': true, 'byUser.imgUrl': true,
                    'aboutToy._id': true, 'aboutToy.name': true, 'aboutToy.price': true
                }
            }
        ]).toArray()

        filteredReviews = filteredReviews.map(review => {
            review.createdAt = review._id.getTimestamp()
            return review
        })

        return filteredReviews
    } catch (err) {
        loggerService.error('Cannot get reviews', err)
        throw err
    }
}

async function remove(reviewId) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const collection = await dbService.getCollection('review')
        const criteria = { _id: ObjectId.createFromHexString(reviewId) }
        // remove only if admin
        if (!loggedinUser.isAdmin) {
            criteria.byUserId = ObjectId.createFromHexString(loggedinUser._id)
        }
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(reviewId) })
        return deletedCount

    } catch (err) {
        loggerService.error(`Cannot remove review ${reviewId}`, err)
        throw err
    }
}

async function add(review) {
    try {
        const reviewToAdd = {
            byUserId: ObjectId.createFromHexString(review.byUserId),
            aboutToyId: ObjectId.createFromHexString(review.aboutToyId),
            txt: review.txt,
            rating: review.rating,
        }

        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToAdd)
        return reviewToAdd
    } catch (err) {
        loggerService.error(`Cannot add review`, err)
        console.log('review:', review)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const filteredCriteria = {}
    if (filterBy.txt) {
        filteredCriteria.txt = { $regex: filterBy.txt, $options: 'i' }
    }

    if (filterBy.byUserId) {
        filteredCriteria.byUserId = ObjectId.createFromHexString(filterBy.byUserId)
    }

    if (filterBy.aboutToyId) {
        filteredCriteria.aboutToyId = ObjectId.createFromHexString(filterBy.aboutToyId)
    }

    if (filterBy.rating) {
        filteredCriteria.rating = { $gte: +filterBy.rating }
    }

    // let sort = {}
    // let collation = {}

    // const dir = +filterBy.sortDir || -1
    // switch (filterBy.sort) {
    //     case 'rating':
    //         sort = { rating: dir }
    //         break
    //     // case 'byUserId':
    //     //     sort = { 'byUser.fullname': dir }
    //     //     collation = { locale: 'en', strength: 1 }
    //     //     break
    //     // case 'aboutToyId':
    //     //     sort = { 'aboutToy.name': dir }
    //     //     collation = { locale: 'en', strength: 1 }
    //         // break
    //     default:
    //         break
    // }

    return filteredCriteria
}

