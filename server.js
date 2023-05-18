const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();

const connectionString =
  'mongodb+srv://yoda:thestarwarsmann@cluster0.caxfqv4.mongodb.net/?retryWrites=true&w=majority';

MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then((client) => {
    console.log('Connected to the Database...');
    const db = client.db('star-wars-quotes');
    const quotesCollection = db.collection('quotes');

    app.set('view engine', 'ejs');

    // make sure you place body-parser before your CRUD handlers
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'));
    app.use(bodyParser.json());

    // all your handlers here...
    app.get('/', (req, res) => {
      const cursor = db
        .collection('quotes')
        .find()
        .toArray()
        .then((results) => {
          res.render('index.ejs', { quotes: results });
        })
        .catch((err) => console.log(err));
    });

    app.post('/quotes', (req, res) => {
      quotesCollection
        .insertOne(req.body)
        .then((result) => {
          res.redirect('/');
        })
        .catch((err) => console.log(err));
    });

    app.put('/quotes', (req, res) => {
      quotesCollection
        .findOneAndUpdate(
          { name: 'Yoda' },
          {
            $set: {
              name: req.body.name,
              quote: req.body.quote,
            },
          },
          {
            upsert: true,
          }
        )
        .then((result) => res.json('Success'))
        .catch((err) => console.log(err));
    });

    app.delete('/quotes', (req, res) => {
      quotesCollection
        .deleteOne({ name: req.body.name })
        .then((result) => {
          if (result.deletedCount === 0) {
            return res.json('No quote to delete.');
          }
          res.json('Deleted a Darth Vader quote.');
        })
        .catch((err) => console.log(err));
    });
  })
  .catch((err) => console.log(err));

app.listen(3000, () => {
  console.log('Listening on port 3000...');
});
