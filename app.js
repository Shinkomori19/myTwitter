/**
 * Name: Shin Komori
 * Date: December 7th, 2022

 * This is server-side javascript file, app.js for YIPPER web application.
 * It provides four different endpoints, each for different purpose.
 * With this app.js, it becomes possible for client-side js to get yips data
 * that are stored in database file.
 * Each endpoint interacts with database, and either get data from it or update
 * the data specified by client-side.
 */

'use strict';

const express = require('express');
const app = express();

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const multer = require('multer');

const SERVER_ERR_MSG = 'An error occurred on the server. Try again later.';
const MISSING_PARAMS_MSG = 'Missing one or more of the required params.';

// for application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none());

/*
 * GET endpoint. Without parameter, it simply returns all yip data.
 * With parameter, it searches the yip post that contains the parameter and
 * returns only id in json format.
 */
app.get('/yipper/yips', async (req, res) => {
  try {
    let search = req.query.search;
    let db = await getDBConnection();

    let result;
    if (search) {
      let qry = 'SELECT id FROM yips WHERE yip like ? ORDER BY id;';
      result = await db.all(qry, ['%' + search + '%']);
    } else {
      let qry = 'SELECT * FROM yips ORDER BY datetime(date) DESC;';
      result = await db.all(qry);
    }

    await db.close();
    let resJson = { yips: result };
    res.json(resJson);
  } catch (error) {
    res.type('text');
    res.status(500).send(SERVER_ERR_MSG);
  }
});

/*
 * GET endpoint. Given a user, it gets yip posts posted by the user and responds
 * with json format. If user does not exist, returns an error message.
 */
app.get('/yipper/user/:user', async (req, res) => {
  try {
    let user = req.params.user;
    let db = await getDBConnection();

    let qry =
      'SELECT name, yip, hashtag, date FROM yips \
              WHERE name = ? ORDER BY datetime(date) DESC;';
    let result = await db.all(qry, [user]);

    await db.close();

    if (result.length === 0) {
      res.type('text');
      res.status(400).send('Yikes. User does not exist.');
    } else {
      res.json(result);
    }
  } catch (error) {
    res.type('text');
    res.status(500).send(SERVER_ERR_MSG);
  }
});

/*
 * POST endpoint. Updates the likes for a designated yip.
 * it increments the count of likes of a specific post and returns the updated
 * count in text format.
 */
app.post('/yipper/likes', async (req, res) => {
  try {
    let id = req.body.id;
    if (!id) {
      // when id has no value, err
      res.type('text');
      res.status(400).send(MISSING_PARAMS_MSG);
    } else {
      // id value exists.
      // Checks if id is valid(valid if already exists)
      let db = await getDBConnection();
      let qry = 'SELECT name FROM yips WHERE id = ?;';
      let ifValid = await db.get(qry, [id]);

      if (!ifValid) {
        await db.close();
        res.type('text');
        res.status(400).send('Yikes. ID does not exist.');
      } else {
        let updateQry = 'UPDATE yips SET likes = likes + 1 WHERE id = ?;';
        await db.run(updateQry, [id]);
        let selectQry = 'SELECT likes FROM yips WHERE id = ?;';
        let updatedLikes = await db.get(selectQry, [id]);

        await db.close();
        res.type('text');
        res.send(String(updatedLikes.likes));
      }
    }
  } catch (error) {
    res.type('text');
    res.status(500).send(SERVER_ERR_MSG);
  }
});

/*
 * POST endpoint. Given two parameters, it forms a json of the post, and insert
 * it to database file and then returns the data of the post in json format.
 */
app.post('/yipper/new', async (req, res) => {
  try {
    let name = req.body.name;
    let full = req.body.full;
    if (!name || !full) {
      // when has no value, err
      res.type('text');
      res.status(400).send(MISSING_PARAMS_MSG);
    } else {
      let db = await getDBConnection();

      // Checks if name is valid(valid if already exists)
      let qry = 'SELECT id FROM yips WHERE name = ?;';
      let nameExists = await db.get(qry, [name]);

      if (!nameExists) {
        await db.close();
        res.type('text');
        res.status(400).send('Yikes. User does not exist.');
      } else {
        let insertQry =
          "INSERT INTO yips ('name', 'yip', 'hashtag', 'likes') VALUES (?, ?, ?, 0);";
        let meta = await db.run(insertQry, [
          name,
          fullToYip(full),
          fullToHash(full),
        ]);
        let selectQry = 'SELECT * FROM yips WHERE id = ?;';
        let target = await db.get(selectQry, [meta.lastID]);

        await db.close();
        res.json(target);
      }
    }
  } catch (error) {
    res.type('text');
    res.status(500).send(SERVER_ERR_MSG);
  }
});

/**
 * Takes in full value input by client-side, and returns the string of yip.
 * @param {string} str full value input by user.
 * @returns {Array} yip yip value that comes before '#'. Trims spaces before '#'.
 */
function fullToYip(str) {
  let yip = str.substring(0, str.indexOf('#')).trimEnd();
  return yip;
}

/**
 * Takes in full value input by client-side, and returns the string of hashtag.
 * @param {string} str full value input by user.
 * @returns {string} hashtag hashtag value that comes after '#'
 */
function fullToHash(str) {
  let hashtag = str.substring(str.indexOf('#') + 1);
  return hashtag;
}

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {sqlite3.Database} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'yipper.db', // replace this with your db file name
    driver: sqlite3.Database,
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8001;
app.listen(PORT);
