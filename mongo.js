require('dotenv').config()
const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}else {

  const url = process.env.MONGODB_URI

  mongoose.set('strictQuery',false)
  mongoose.connect(url)

  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })

  const Persons = mongoose.model('Persons', personSchema)

  if (process.argv.length === 3) {

    Persons.find({}).then(result => {
      console.log('phonebook:')
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()

    })

  }else{

    const new_name = process.argv[3]
    const new_number = process.argv[4]
    const person = new Persons({
      name: new_name,
      number: new_number,
    })

    person.save().then(() => {
      console.log(`added ${new_name} number ${new_number} to phonebook`)
      mongoose.connection.close()
    })
  }
}






