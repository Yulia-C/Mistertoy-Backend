import fs from 'fs'

import { loggerService } from "./logger.service.js"
import { utilService } from "./util.service.js"

export const branchService = {
    query,
    getById,
    remove,
    save
}


const branches = utilService.readJsonFile('data/branch.json')

function query() {
    return Promise.resolve(branches)
}

function getById(branchId) {
    const branch = branches.find(branch => branch._id === branchId)
    return Promise.resolve(branch)
}

function remove(branchId, loggedinUser) {

    const idx = branches.findIndex(branch => branch._id === branchId)
    if (idx === -1) return Promise.reject('No Such branch')

    if (!loggedinUser.isAdmin) {
        return Promise.reject('Not allowed to remove branch')
    }
    branches.splice(idx, 1)
    return _saveBranchesToFile()
}

function save(branch, loggedinUser) {
    if (branch._id) {
        let branchToUpdate = branches.find(currBranch => currBranch._id === branch._id)
        if (!loggedinUser.isAdmin) {
            return Promise.reject('Not allowed to update branch')
        }
        branchToUpdate.city = branch.city
        branchToUpdate.address = branch.address
        branchToUpdate.phoneNum = branch.phoneNum
        branchToUpdate.hours = branch.hours
        branch = branchToUpdate
    } else {
        branch._id = utilService.makeId()
        branches.push(branch)
    }
    return _saveBranchesToFile().then(() => branch)

}

function _saveBranchesToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(branches, null, 2)
        fs.writeFile('data/branch.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to branches file', err)
                return reject(err)
            }
            resolve()
        })
    })
}
