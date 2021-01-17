const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {pool} = require('./config')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

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