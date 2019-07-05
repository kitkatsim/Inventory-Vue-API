const express = require('express');
const mongodb = require('mongodb');

//store connection string on a file named config
const config = require('./config');

const router = express.Router();

// Get Inventories
router.get('/', async (req, res) => {
    const inventories = await loadPostsCollection();
    res.send(await inventories.find({}).toArray());
});

// Add inventory
router.post('/', async (req, res) => {
    const posts = await loadPostsCollection();
    await posts.insertOne({
        item: req.body.item,
        price: req.body.price,
        quantity: req.body.quantity,
        supplier: req.body.supplier,
        createdAt: new Date()
    });
    res.status(201).send();
});


//Delete Post
router.delete('/:id', async (req, res) => {
    const posts = await loadPostsCollection();
    await posts.deleteOne({ _id: new mongodb.ObjectID(req.params.id) });

    res.status(200).send();
    //await posts.deleteOne({_id: req.params.id});
});

//update post
router.put('/:id', async (req, res) => {
    const posts = await loadPostsCollection();
    await posts.updateOne(
        {
            _id: new mongodb.ObjectID(req.params.id)
        },
        {
            $set: {
                item: req.body.item,
                price: req.body.price,
                quantity: req.body.quantity,
                supplier: req.body.supplier,
                updatedAt: new Date()
            }
        }
    );

    res.status(200).send();
});

//reduce quantity by 1
router.put('/dec/:id', async (req, res) => {
    const posts = await loadPostsCollection();
    await posts.updateOne(
        {
            _id: new mongodb.ObjectID(req.params.id)
        },
        {
            $inc: { quantity: -1 }
        }
    );

    res.status(200).send();
});


async function loadPostsCollection() {
    const client = await mongodb.MongoClient.connect(config.string, {
        useNewUrlParser: true
    });

    return client.db('vue-express').collection('inventory');
}

module.exports = router;