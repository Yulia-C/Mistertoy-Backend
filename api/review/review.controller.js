import { reviewService } from "./review.service.js"
import { loggerService } from "../../services/logger.service.js"
import { toyService } from "../toy/toy.service.js"

export async function getReviews(req, res) {
    try {
        const reviews = await reviewService.query(req.query)
        res.send(reviews)
    } catch (err) {
        loggerService.error('Failed getting reviews', err)
        res.status(400).send({ err: 'Failed to getting reviews' })
    }
}

export async function addReview(req, res) {
    const { loggedinUser } = req
    try {
        let review = req.body
        const { aboutToyId } = review

        review.byUserId = loggedinUser._id

        review = await reviewService.add(review)

        review.byUser = loggedinUser
        // review.aboutToy = aboutToyId
        // console.log('review:', review)
        // delete review.aboutToy.givenReviews
        // delete review.aboutToyId
        delete review.byUserId

        res.send(review)
    } catch (err) {
        loggerService.error('Failed to add review', err)
        res.status(400).send({ err: 'Failed to add review' })
    }
}

export async function deleteReview(req, res) {
    const { loggedinUser } = req
    const { id: reviewId } = req.params
    try {
        const deletedCount = await reviewService.remove(reviewId)
        if (deletedCount == 1) {

            res.send({ msg: `${deletedCount} review deleted` })
        }
    } catch (err) {
        loggerService.error('Failed to delete review', err)
        res.status(400).send({ err: 'Failed to delete review' })
    }
}