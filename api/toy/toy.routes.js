import express from 'express'
import { addToy, addToyMsg, deleteToy, getToyId, getToys, removeToyMsg, updateToy } from './toy.controller.js'
import { log } from '../../middlewares/logger.middleware.js'
import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'

export const toyRoutes = express.Router()

toyRoutes.get('/', log, getToys)
toyRoutes.get('/:id', getToyId)
toyRoutes.post('/', requireAuth, addToy)
toyRoutes.put('/:id', requireAdmin, updateToy)
toyRoutes.delete('/:id', requireAdmin, deleteToy)

toyRoutes.post('/:id/msg', requireAuth, addToyMsg)
toyRoutes.delete('/:id/msg/:msgId', requireAuth, removeToyMsg)
