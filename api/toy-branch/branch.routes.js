import express from 'express'

import { addBranch, deleteBranch, getBranch, getBranches, updateBranch } from './branch.controller.js'
import { requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

export const branchRoutes = express.Router()

branchRoutes.get('/', log, getBranches)
branchRoutes.get('/:branchId', getBranch)
branchRoutes.post('/', requireAdmin, addBranch)
branchRoutes.put('/:branchId', requireAdmin, updateBranch)
branchRoutes.delete('/:branchId', requireAdmin, deleteBranch)
