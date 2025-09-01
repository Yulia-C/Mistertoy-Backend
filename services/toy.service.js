import fs from 'fs'

import { loggerService } from "./logger.service.js"
import { utilService } from "./util.service.js"

export const toyService = {
    query,
    getById,
    remove,
    save,

}

const PAGE_SIZE = 5

const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy = {}) {
    let toysToReturn = toys

    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        toysToReturn = toysToReturn.filter(toy => regExp.test(toy.txt))
    }

    if (filterBy.labels?.length) {
        toysToReturn = toysToReturn.filter(toy =>
            filterBy.labels.every(label => toy.labels.includes(label))
        )
    }

    if (filterBy.price) {
        toysToReturn = toysToReturn.filter(toy => toy.price >= filterBy.price)
    }

    if (typeof filterBy.inStock === 'boolean') {
        toysToReturn = toysToReturn.filter(toy => toy.inStock === filterBy.inStock)
    }

    if (filterBy.sort) {
        const dir = +filterBy.sortDir
        toysToReturn.sort((a, b) => {
            if (filterBy.sort === 'name') {
                return a.txt.localeCompare(b.txt) * dir
            } else if (filterBy.sort === 'price' || filterBy.sort === 'createdAt') {
                return (a[filterBy.sort] - b[filterBy.sort]) * dir
            }
        })
    }

    const filteredToysLength = toysToReturn.length
    if (filterBy.pageIdx !== undefined) {
        let startIdx = filterBy.pageIdx * PAGE_SIZE
        toysToReturn = toysToReturn.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return Promise.resolve(toysToReturn)
}

function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId, loggedinUser) {

    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such toy')
    if (!loggedinUser.isAdmin && toy.creator._id !== loggedinUser._id) {
        return Promise.reject('Not allowed to remove toy')
    }
    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy, loggedinUser) {
    if (toy._id) {
        let toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        if (!loggedinUser.isAdmin && toy.creator._id !== loggedinUser._id) {
            return Promise.reject('Not allowed to update toy')
        }
        toyToUpdate.txt = toy.txt
        toyToUpdate.labels = toy.labels
        toyToUpdate.price = toy.price
        toyToUpdate.inStock = toy.inStock
        toyToUpdate.updatedAt = Date.now()
        toy = toyToUpdate
    } else {
        toy._id = utilService.makeId()
        toy.creator = loggedinUser
        toys.push(toy)
    }
    // delete toy.creator.score
    return _saveToysToFile().then(() => toy)

}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 2)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}

// function getLabels() {
//     const labels = ['On wheels', 'Box game', 'Art', 'Baby', 'Doll', 'Puzzle',
//         'Outdoor', 'Battery Powered']
//     return Promise.resolve(labels)
// }

