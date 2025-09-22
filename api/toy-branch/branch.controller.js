import { loggerService } from "../../services/logger.service.js"
import { branchService } from "./branch.service.js"

export async function getBranches(req, res) {
    try {
        const branches = await branchService.query()
        console.log('branches:', branches)
        res.json(branches)
    } catch (err) {
        loggerService.error('Cannot load branches', err)
        res.status(500).send({ err: 'Cannot load branches' })
    }
}

export async function getBranch(req, res) {
    try {
        const { branchId } = req.params
        const branch = await branchService.getById(branchId)
        res.send(branch)
    } catch (err) {
        loggerService.error('Cannot get branch', err)
        res.status(500).send({ err: 'Cannot get branch' })
    }
}

export async function deleteBranch(req, res) {
    try {
        const { branchId } = req.params
        await branchService.remove(branchId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        loggerService.error('Cannot delete branch', err)
        res.status(500).send({ err: 'Cannot delete branch' })
    }
}

export async function updateBranch(req, res) {
    try {
        const branch = req.body
        const savedBranch = await branchService.update(branch)
        res.send(savedBranch)
    } catch (err) {
        loggerService.error('Cannot update branch', err)
        res.status(500).send({ err: 'Cannot update branch' })
    }
}

export async function addBranch(req, res) {
    try {
        const { city, address, phoneNum, hours, position } = req.body
        if (!city || !address || !position) res.status(400).send('Missing dada')

      
        const branch = { city, address, phoneNum, hours, position }
        const addedBranch = await branchService.update(branch)
        res.send(addedBranch)
    } catch (err) {
        loggerService.error('Cannot add toy', err)
        res.status(500).send({ err: 'Cannot add toy' })
    }
}
