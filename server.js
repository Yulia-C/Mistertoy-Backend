import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { toyRoutes } from './api/toy/toy.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { branchRoutes } from './api/toy-branch/branch.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'

import { setupAsyncLocalStorage } from './middlewares/setupALS.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { loggerService } from './services/logger.service.js'

loggerService.info('server.js loaded...')


const app = express()

if (process.env.NODE_ENV === 'production') {
    // Express serve static files on production environment
    app.use(express.static(path.resolve(__dirname, 'public')))
    console.log('__dirname: ', __dirname)
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:8080',
            'http://localhost:8080',
            'http://127.0.0.1:5173',
            'http://localhost:5173',
            'https://mistertoy-backend-r01c.onrender.com'
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}

app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')
app.use(express.static('public'))

app.all('*all', setupAsyncLocalStorage)

// routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy', toyRoutes)
app.use('/api/review', reviewRoutes)
app.use('/api/about', branchRoutes)


// Fallback route
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)
