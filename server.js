const express = require('express')
const bodyParser = require('body-parser') //middleware
const MongoClient = require('mongodb').MongoClient
const dotevn = require('dotenv')
dotevn.config()

const app = express()

// built in middleware - express.static
app.use(express.static('public'))
// body-parser must go before CRUD handlers/routes
//urlencoded method tells body-parser to extract data from the <form> element and add them to the body property in the request object
app.use(bodyParser.urlencoded({ extended: true })) 
app.use(bodyParser.json())

app.set('view engine', 'ejs')

// view is name of file rendering, file MUST be placed in views folder
// locals is the data passed into the file
// res.render(view, locals)

let connectionString = process.env.MONGODB_URI


// connect to MongoDB through the MongoClient's connect method
MongoClient.connect(connectionString)
    .then(client => {
        console.log('connected to database')
        // naming my database
        const db = client.db('star-wars-quotes')
        const quotesCollection = db.collection('quotes')

        app.post('/quotes', (req, res) => {
            quotesCollection.insertOne(req.body)
            .then(result => {
                console.log(result)
                res.redirect('/')
            })
            .catch(error => console.error(error))
        })

        app.get('/', (req, res) => {
            db.collection('quotes').find().toArray()
            .then(results => {
                console.log(results)
                res.render('index.ejs', { quotes: results })
            }) 
            .catch(error => console.error(error))
            
        })

        app.put('/quotes', (req, res) => {
            quotesCollection.findOneAndUpdate(
                { name: 'test5' },
                {
                    $set: {
                        name: req.body.name,
                        quote: req.body.quote
                    }
                },
                {
                    upsert: true
                }
            )
            .then(result => res.json('Success!'))
            .catch(error => console.error(error))
        })

        app.delete('/quotes', (req, res) => {
            quotesCollection.deleteOne(
                { name: req.body.name }
            )
            .then(result => {
                if (result.deletedCount === 0) {
                    return res.json('No quote to delete')
                }
                res.json("Deleted Darth Vader's quote")
            })
            .catch(error => console.error(error))
        })
    })

app.listen(3000, function() {
    console.log('listening on port 3000')
})