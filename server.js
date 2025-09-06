import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'


import { toyService } from './services/toy.service.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/user.service.js'
import { branchService } from './services/branch.service.js'

const app = express()

const corsOptions = {
    origin: [
        'http://127.0.0.1:8080',
        'http://localhost:8080',
        'http://127.0.0.1:5173',
        'http://localhost:5173'
    ],
    credentials: true
}

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.use(cors(corsOptions))
app.set('query parser', 'extended')


app.get('/api/toy', (req, res) => {

    const filterBy = {
        txt: req.query.txt,
        price: +req.query.price,
        inStock: req.query.inStock === 'true' ? true
            : req.query.inStock === 'false' ? false
                : '',
        pageIdx: req.query.pageIdx,
        sort: req.query.sort,
        sortDir: req.query.sortDir,
        labels: req.query.labels
    }

    toyService.query(filterBy)
        .then(toys => {
            res.send(toys)
        })
        .catch(err => {
            loggerService.error('Cannot load toys', err)
            res.status(400).send('Cannot load toys', err)
        })
})


app.get('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params

    toyService.getById(toyId)
        .then(toy => {
            console.log('toy:', req.params)
            res.send(toy)
        })
        .catch(err => {
            loggerService.error('Cannot load toy', err)
            res.status(400).send('Cannot load toy', err)
        })
})

app.post('/api/toy', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot add toy')

    const toy = {
        txt: req.body.txt,
        labels: req.body.labels || [],
        price: +req.body.price,
        inStock: req.body.inStock,
        creator: req.body.creator || {}
    }

    toyService.save(toy, loggedinUser)
        .then(savedToy => res.send(savedToy))
        .catch(err => {
            loggerService.error('Cannot save toy', err)
            res.status(400).send('Cannot save toy', err)
        })
})

app.put('/api/toy/:toyId', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot edit toy')

    const toy = {
        _id: req.params.toyId,
        txt: req.body.txt,
        labels: req.body.labels,
        price: +req.body.price,
        inStock: req.body.inStock,
        updatedAt: req.body.updatedAt
    }

    toyService.save(toy, loggedinUser)
        .then(savedToy => res.send(savedToy))
        .catch(err => {
            loggerService.error('Cannot save toy', err)
            res.status(400).send('Cannot save toy', err)
        })
})

app.delete('/api/toy/:toyId', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot add toy')
    const { toyId } = req.params

    toyService.remove(toyId, loggedinUser)
        .then(() => res.send('Removed!'))
        .catch(err => {
            loggerService.error('Cannot save toy', err)
            res.status(400).send('Cannot save toy', err)
        })

})

// User api

app.get('/api/user', (req, res) => {

    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot load user', err)
            res.status(400).send('Cannot load user')
        })
})

// Login
app.post('/api/auth/login', (req, res) => {
    const credentials = req.body

    userService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        })
        .catch(err => {
            loggerService.error('Cannot login', err)
            res.status(400).send('Cannot login')
        })
})

// check-signup
app.get('/api/auth/check-email', (req, res) => {
    const { email } = req.query

    userService.checkSignup(email)
        .then(() => {
            return res.send({ available: true })
        })
        .catch(err => {
            loggerService.error('Cannot signup', err)
            res.status(400).send({ message: err })
        })
})

// signup
app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    userService.save(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })
        .catch(err => {
            loggerService.error('Cannot signup', err)
            res.status(400).send('Cannot signup')
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})


app.put('/api/user', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(400).send('No logged in user')
    const { diff } = req.body
    if (loggedinUser.balance + diff < 0) return res.status(400).send('No credit')
    loggedinUser.balance += diff
    return userService.save(loggedinUser)
        .then(user => {
            const token = userService.getLoginToken(user)
            res.cookie('loginToken', token)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot edit user', err)
            res.status(400).send('Cannot edit user')
        })
})

// Branches map
app.get('/api/about', (req, res) => {
console.log('getting:')
    branchService.query()
        .then(branches => res.send(branches))
        .catch(err => {
            loggerService.error('Cannot load branches', err)
            res.status(400).send('Cannot load branches')
        })
})


// Fallback route
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)
