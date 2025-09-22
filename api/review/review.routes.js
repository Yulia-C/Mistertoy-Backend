import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { addReview, deleteReview, getReviews } from './review.controller.js'

export const reviewRoutes  = express.Router()

reviewRoutes.get('/',log, getReviews)
reviewRoutes.post('/', log, requireAuth, addReview)
reviewRoutes.delete('/:id', requireAuth, deleteReview)

