require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.static('dist'))
app.use(express.json())

const Persons = require('./models/persons')

const cors = require('cors')
app.use(cors())



const morgan = require('morgan')
morgan.token('JSON', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return ''
  }
})
const customFormat = ':method :url :status :res[content-length] - :response-time ms :JSON'
app.use(morgan(customFormat))

let persons = []

function fetchPersonsFromDatabase() {
  Persons.find({})
    .then(data => {
      persons = data
    })
    .catch(error => {
      console.error('Error fetching persons:', error)
    })
}

app.get('/health', (req, res) => {
  res.send('ok')
})

app.get('/api/info', (request, response) => {
  fetchPersonsFromDatabase()
  const currentDate = new Date()
  const formattedDate = currentDate.toDateString()
  const formattedTime = currentDate.toTimeString()
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  response.send(`
<p>Phonebook has info for ${persons.length} people</p>
<p>${formattedDate + ' ' + formattedTime + timeZone}</p>
`)
})

app.get('/api/persons', (request, response) => {
  fetchPersonsFromDatabase()
  response.json(persons)
})



app.get('/api/persons/:id', (request, response,next) => {
  fetchPersonsFromDatabase()
  Persons.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))

})


app.delete('/api/persons/:id', (request, response, next) => {

  console.log(request.params.id)

  Persons.findByIdAndDelete(request.params.id)
    .then(() => {
      fetchPersonsFromDatabase()
      response.status(204).end()
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {

  const id = request.params.id
  const updatedPerson = request.body

  Persons.findByIdAndUpdate(id, updatedPerson, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))

})

app.post('/api/persons', (request, response,next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'The name or number is missing'
    })
  }

  if (persons.some(person => person.name.toUpperCase() === body.name.toUpperCase())) {
    return response.status(409).json({
      error: 'The name already exists in the phonebook'
    })
  }

  console.log(body.id)
  const person = new Persons({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    persons = persons.concat(savedPerson)
    response.json(persons)
  }).catch(error => next(error))

})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})