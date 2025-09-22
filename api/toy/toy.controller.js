import { loggerService } from "../../services/logger.service.js"
import { toyService } from "./toy.service.js"

export async function getToys(req, res) {
    try {
        const { txt, price, labels, inStock, sort, sortDir, pageIdx } = req.query
        const filterBy = {
            txt: txt || '',
            price: +price || 0,
            labels: labels || [],
            inStock: inStock || null,
            sort: sort || '',
            sortDir: sortDir || -1,
            pageIdx: pageIdx || 0,
        }

        const toys = await toyService.query(filterBy)
        res.json(toys)
    } catch (err) {
        loggerService.error(`Couldn't get toys`, err)
        res.status(500).send({ err: `Couldn't get toys`, err })
    }
}

export async function getToyId(req, res) {
    try {
        const toy = await toyService.getById(req.params.id)
        res.json(toy)
    } catch (err) {
        loggerService.error('Failed to get toy', err)
        res.status(500).send({ err: 'Failed to get toy' })
    }
}

export async function deleteToy(req, res) {
    try {
        const deletedCount = await toyService.remove(req.params.id)
        res.send(`${deletedCount} toys removed `)
    } catch (err) {
        loggerService.error('Failed to delete toy', err)
        res.status(500).send({ err: 'Failed to delete toy' })
    }
}

export async function addToy(req, res) {
    const { loggedinUser } = req
    try {
        const toy = req.body
        toy.owner = loggedinUser
        const toyToAdd = await toyService.add(toy)
        res.json(toyToAdd)
    } catch (err) {
        loggerService.error('Failed to add toy', err)
        res.status(500).send({ err: 'Failed to add toy' })
    }
}

export async function updateToy(req, res) {
    try {
        const toy = { ...req.body, _id: req.params.id }
        const updatedToy = await toyService.update(toy)
        res.json(updatedToy)
    } catch (err) {
        loggerService.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function addToyMsg(req, res) {
    const { loggedinUser } = req
    try {
        const { _id, fullname } = loggedinUser
        const toyId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: { _id, fullname },
            // createdAt: Date.now(),
        }
        const addedMsg = await toyService.addToyMsg(toyId, msg)
        res.json(addedMsg)
    } catch (err) {
        loggerService.error('Failed to add a message', err)
        res.status(500).send({ err: 'Failed to add a message' })
    }
}

export async function removeToyMsg(req, res) {
    try {
        const { id, msgId } = req.params
        const toyId = id
        await toyService.removeMsg(toyId, msgId)
        res.send(toyId)
    } catch (err) {
        loggerService.error('Failed to remove a message', err)
        res.status(500).send({ err: 'Failed to remove a message' })
    }
}