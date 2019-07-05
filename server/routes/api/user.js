const express = require('express');
const mongodb = require('mongodb');

//store connection string on a file named config
const config = require('./config');

var crypto = require('crypto');

const router = express.Router();

// Get User
router.get('/', async (req, res) => {
    const posts = await loadPostsCollection();
    res.send(await posts.find({}).toArray());
});

// Add User
router.post('/', async (req, res) => {
    const posts = await loadPostsCollection();

    var password = req.body.password
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha512(password, salt);
    console.log(passwordData);

    await posts.insertOne({
        username: req.body.username,
        password: passwordData.passwordHash,
        salt: passwordData.salt,
        createdAt: new Date()
    });
    res.status(201).send();
});

//IN progress, this one verify user login credential, might wanna change the verify part to controllers
// Get User Hashed Password

/*** 
router.post('/login', async (req, res) => {
  const posts = await loadPostsCollection();
  var abc = await posts.findOne({ username: req.body.username }, { password: 1, salt: 1 });

  if(abc){
    console.log("has result");
  }

  console.log(abc);

  //var passwordData = sha512(req.body.password,salt);

  console.log();

  res.status(201).send();
});
***/

// find a user
router.post('/finduser', async (req, res) => {
  const posts = await loadPostsCollection();
  res.send(await posts.findOne({ username: req.body.username }, { password: 1, salt: 1 }));
});



//Delete User
router.delete('/:id', async (req, res) => {
    const posts = await loadPostsCollection();
    await posts.deleteOne({ _id: new mongodb.ObjectID(req.params.id) });

    res.status(200).send();
    //await posts.deleteOne({_id: req.params.id});
});

//update user
router.put('/:id', async (req, res) => {
    const posts = await loadPostsCollection();
    await posts.updateOne(
        {
            _id: new mongodb.ObjectID(req.params.id)
        },
        {
            $set: {
                text: req.body.text,
                updatedAt: new Date()
            }
        }
    );

    res.status(200).send();
});

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length){
  return crypto.randomBytes(Math.ceil(length/2))
          .toString('hex') /** convert to hexadecimal format */
          .slice(0,length);   /** return required number of characters */
};

/**
* hash password with sha512.
* @function
* @param {string} password - List of required fields.
* @param {string} salt - Data to be validated.
*/
var sha512 = function(password, salt){
  var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  var value = hash.digest('hex');
  return {
      salt:salt,
      passwordHash:value
  };
};


async function loadPostsCollection() {
    const client = await mongodb.MongoClient.connect(config.string, {
        useNewUrlParser: true
    });

    return client.db('vue-express').collection('user');
}

module.exports = router;