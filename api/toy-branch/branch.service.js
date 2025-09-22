import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'

import { asyncLocalStorage } from '../../services/als.service.js'


export const branchService = {
    query,
    getById,
    remove,
    add,
    update,
}


async function query() {
    try {
        const collection = await dbService.getCollection('branch')
        const branches = await collection.find().toArray()
        return branches
    } catch (err) {
        loggerService.error('cannot find branches', err)
        throw err
    }
}

async function getById(branchId) {
    try {
        const collection = await dbService.getCollection('branch')
        const branch = await collection.findOne({ _id: ObjectId.createFromHexString(branchId) })
        console.log('branch:', branch)
        return branch
    } catch (err) {
        loggerService.error(`Cannot find branch ${branchId}`, err)
        throw err
    }
}

async function remove(branchId) {
    try {
        const collection = await dbService.getCollection('branch')
        await collection.deleteOne({ _id: ObjectId.createFromHexString(branchId) })
    } catch (err) {
        loggerService.error(`Cannot remove branch ${branchId}`, err)
        throw err
    }

}

async function update(branch) {
    try {
        const branchToSave = {
            _id: ObjectId.createFromHexString(branch._id),
            city: branch.city,
            address: branch.address,
            phoneNum: branch.phoneNum,
            hours: branch.hours,
            position: {
                lat: branch.position.lat,
                lng: branch.position.lng
            }
        }

        const collection = await dbService.getCollection('branch')
        await collection.updateOne({ _id: branchToSave._id }, { $set: branchToSave })
        return branchToSave
    } catch (err) {
        loggerService.error(`Cannot update branch ${branch._id}`, err)
        throw err
    }
}

async function add(branch) {
    try {
        const branchToSave = {
            city: branch.city,
            address: branch.address,
            phoneNum: branch.phoneNum,
            hours: branch.hours,
            position: {
                lat: branch.position.lat,
                lng: branch.position.lng
            }
        }

        const collection = await dbService.getCollection('branch')
        await collection.insertOne(branchToSave)
        return branchToSave
    } catch (err) {
        loggerService.error(`Cannot add branch ${branch._id}`, err)
        throw err
    }

}