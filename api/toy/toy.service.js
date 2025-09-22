import { ObjectId } from 'mongodb'

import { loggerService } from "../../services/logger.service.js"
import { utilService } from "../../services/util.service.js"
import { dbService } from '../../services/db.service.js'

import { asyncLocalStorage } from '../../services/als.service.js'

export const toyService = {
    query,
    getById,
    remove,
    add,
    update,
    addToyMsg,
    removeMsg
}
const PAGE_SIZE = 5

async function query(filterBy = {}) {

    try {
        const { filteredCriteria, sort, skip } = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('toy')
        const prmTotalCount = await collection.countDocuments(filteredCriteria)

        const prmFilteredToys = collection.find(filteredCriteria).sort(sort).skip(skip).limit(PAGE_SIZE).toArray()
        const [totalCount, filteredToys] = await Promise.all([prmTotalCount, prmFilteredToys])

        // Check what to do if we have a large data base instead of array
        let toys = await filteredToys.map(toy => {
            toy.createdAt = toy._id.getTimestamp()
            return toy
        })
        const maxPage = Math.ceil(totalCount / PAGE_SIZE)
        return { toys: filteredToys, maxPage }
    } catch (err) {
        loggerService.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })

        return toy
    } catch (err) {
        loggerService.error(`Cannot find toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: creatorId, isAdmin } = loggedinUser
    try {
        const collection = await dbService.getCollection('toy')
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
        if (deletedCount === 0) throw ('Not your toy')
        return toyId
    } catch (err) {
        loggerService.error(`Cannot delete toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        loggerService.error(`Cannot add toy ${toy.name}`, err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToUpdate = {
            name: toy.name,
            price: toy.price,
            inStock: toy.inStock,
            labels: toy.labels
        }
        const collection = await dbService.getCollection('toy')
        collection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: toyToUpdate })
        return toy
    } catch (err) {
        loggerService.error(`Cannot update toy ${toy._id}`, err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {

    msg.id = utilService.makeId()
    try {
        const collection = await dbService.getCollection('toy')
        collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        loggerService.error(`Cannot add message to ${toy._id}`, err)
        throw err
    }
}

async function removeMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) },
            { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        loggerService.error(`Cannot remove message from ${toyId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const filteredCriteria = {}

    if (filterBy.txt) {
        filteredCriteria.name = { $regex: filterBy.txt, $options: 'i' }
    }

    if (filterBy.labels && filterBy.labels.length) {
        filteredCriteria.labels = { $all: filterBy.labels }
    }

    if (filterBy.inStock) {
        filteredCriteria.inStock = JSON.parse(filterBy.inStock)
    }

    if (filterBy.price) {
        filteredCriteria.price = { $gte: filterBy.price }
    }
    let sort = {}

    if (filterBy.sort) {
        const dir = +filterBy.sortDir || 1
        if (filterBy.sort === 'name' || filterBy.sort === 'price' || filterBy.sort === 'createdAt') {
            sort = { [filterBy.sort]: dir }
        }
    }

    const skip = filterBy.pageIdx !== undefined ? filterBy.pageIdx * PAGE_SIZE : 0
    return { filteredCriteria, sort, skip }
}

