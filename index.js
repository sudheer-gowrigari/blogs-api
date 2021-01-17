const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {pool} = require('./config')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const {body, check} = require('express-validator')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(compression())
app.use(helmet())
const isProduction = process.env.NODE_ENV === 'production'
const origin = {
  origin: isProduction ? 'https://salesforce-blogs.herokuapp.com/' : '*',
}

app.use(cors(origin))



const getBlogs = (request, response) => {
    console.log(" in get blogs");
  pool.query('SELECT * FROM blogs', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const addBlog = (request, response) => {
  const {author, title} = request.body

  pool.query(
    'INSERT INTO blogs (title, text) VALUES ($1, $2)',
    [title, text],
    (error) => {
      if (error) {
        throw error
      }
      response.status(201).json({status: 'success', message: 'blog created.'})
    },
  )
}

const postLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1,
  })
  
  app.post('/blogs/api', postLimiter, addBlog)
  
app
  .route('/blogs/api')
  // GET endpoint
  .get(getBlogs)
  // POST endpoint
  .post(addBlog)

// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening`)
})