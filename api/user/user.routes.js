import express from 'express'
import { getUser, getUsers, updateUser, deleteUser } from './user.controller.js'
import { log } from '../../middlewares/logger.middleware.js'

export const userRoutes = express.Router()

userRoutes.get('/', getUsers)
userRoutes.get('/:id', getUser)
userRoutes.put('/:id', log, updateUser)
userRoutes.delete('/:id', deleteUser)
// requireAuth