// Require Libraries
const express = require('express')
const fetch = require('node-fetch')

// App Setup
const app = express()
app.use(express.static('public'))

// Middleware
const exphbs = require('express-handlebars')

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// Fake db
let gifs = []

// Track query history
let lastQuery = 'dumbass'
let range = 9
let offset = 0

// Routes
app.get('/', async (req, res) => {
  // Handle the home page when we haven't queried yet
  let term = ''
  const numRequests = (gifs.length > 0) ? 9 : 18
  if (req.query.term) {
    term = req.query.term
  }

  if (term === lastQuery) {
    range += 9
  } else {
    range = 9
    lastQuery = term
    offset = 0
    gifs = []
  }

  if (req.query.range) {
    range = req.query.range
  }

  const response = await fetch('https://api.tenor.com/v1/search?key=IS6NH5YK3WV5&q=' + term + '&media_filter=minimal&limit=' + numRequests + '&pos=' + offset)
  const data = await response.json()

  offset = data.next

  data.results.forEach((item, i) => {
    gifs.push(item)
  })

  // pass the gifs as an object into the home page
  const subGifs = gifs.slice(0, range)
  res.render('home', { subGifs })
})

app.get('/puppy', (req, res) => {
  // set the url of the gif
  const gifUrl = 'https://media1.tenor.com/images/561c988433b8d71d378c9ccb4b719b6c/tenor.gif?itemid=10058245'
  // render the hello-gif view, passing the gifUrl into the view to be displayed
  res.render('hello-gif', { gifUrl })
})

app.get('/greetings/:name', (req, res) => {
  // grab the name from the path provided
  const name = req.params.name
  // render the greetings view, passing along the name
  res.render('greetings', { name })
})

// Start Server

app.listen(3000, () => {
  console.log('Gif Search listening on port localhost:3000!')
})
