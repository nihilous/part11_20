import { useState, useEffect } from 'react'
import Connector from './Connector.jsx'

const Filter = ({ value, onChange }) => {
    return (
        <div>
            filter shown with: <input
            value={value}
            onChange={onChange}
        />
        </div>
    );
};

const PersonForm = ({ onSubmit, newName, onNameChange, newNumber, onNumberChange }) => {
    return (
        <form onSubmit={onSubmit}>
            <div>
                name: <input
                value={newName}
                onChange={onNameChange}
            />
            </div>
            <div>
                number: <input
                value={newNumber}
                onChange={onNumberChange}
            />
            </div>
            <div>
                <button type="submit">add</button>
            </div>
        </form>
    );
};

const Persons = ({ persons, setPersons }) => {

    const handleDelete = (name, id) => {

        if (window.confirm(`Delete ${name}?`)) {
            Connector.remove(id).then().then(() => {
                setPersons(persons.filter(person => person.id !== id));
            }).catch(error => {
                console.error('Error deleting data:', error);
            });
        }
    };

    return (
        <div>
            {persons.map(person =>
                <p key={person.id}>
                    {person.name} {person.number} <button onClick={() => handleDelete(person.name,person.id)}>delete</button>
                </p>
            )}
        </div>
    );
};

const Notification = ({ message }) => {
    if (message === null) {
        return null
    }

    if (message.error === true){
        return (
            <div className='error marginer'>
                {message.message}
            </div>
        )
    }
    else{
        return (
            <div className='success marginer'>
                {message.message}
            </div>
        )
    }

}

const App = () => {
    const [persons, setPersons] = useState([]);

    useEffect(() => {

        Connector.getAll().then(response => {
                setPersons(response)
            }).catch(error => {
            console.error('Error fetching data:', error);
        });
    }, [])

    const [newFilter, setNewFilter] = useState("");
    const [newName, setNewName] = useState("");
    const [newNumber, setNewNumber] = useState("");
    const filteredPersons = newFilter === ""
        ? persons
        : persons.filter(person => person.name.toUpperCase().includes(newFilter.toUpperCase()));

    const [message, setMessage] = useState(null);

    const addContact = (event) => {
        event.preventDefault();

        if (newName === "" || newNumber === "") {
            alert(`Please input both name and number`);
            return;
        }

        if (persons.some(person => person.name === newName && newNumber !== "")) {

            if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)){

                const personToUpdate = persons.find(person => person.name === newName);

                if (personToUpdate) {
                    personToUpdate.number = newNumber;
                    Connector.update(personToUpdate.id, personToUpdate)
                        .then(() => {
                            setPersons([...persons]);


                            setMessage(
                                {message: `Updated ${newName}`,
                                    error: false}
                            )
                            setTimeout(() => {
                                setMessage(null)
                            }, 5000)


                            setNewName("");
                            setNewNumber("");
                        })
                        .catch(error => {

                            setMessage(
                                {message: `Information '${newName}' was already removed from server`,
                                error: true}
                            )
                            setTimeout(() => {
                                setMessage(null)
                            }, 5000)

                            console.error('Error updating data:', error);
                        });
                }

            }

        }else{

            const newPerson = {
                name: newName,
                number: newNumber,
            };

            Connector.create(newPerson).then( () => {

                setMessage(
                    {message: `Added ${newName}`,
                        error: false}
                )
                setTimeout(() => {
                    setMessage(null)
                }, 5000)

                Connector.getAll()
                    .then(response => {
                        setPersons(response);
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                    });
                setNewName("")
                setNewNumber("")

            }).catch(error => {

                setMessage(
                    {message: error.response.data.error,
                        error: true}
                )
                setTimeout(() => {
                    setMessage(null)
                }, 5000)
                console.error('Error creating data:', error);
            });

        }





    };

    const handleFilterChange = (event) => {
        setNewFilter(event.target.value);
    };

    const handleNameChange = (event) => {
        setNewName(event.target.value);
    };

    const handleNumberChange = (event) => {
        setNewNumber(event.target.value);
    };

    return (
        <div>
            <h2>Phonebook</h2>
            {message !== "" ?
                <Notification message={message} />
                :
                ""
            }
            <Filter value={newFilter} onChange={handleFilterChange} />

            <h3>Add a new</h3>

            <PersonForm
                onSubmit={addContact}
                newName={newName}
                onNameChange={handleNameChange}
                newNumber={newNumber}
                onNumberChange={handleNumberChange}
            />

            <h3>Numbers</h3>

            <Persons persons={filteredPersons} setPersons={setPersons} />
        </div>
    );
};

export default App;