const express = require('express');
const mongodb = require('mongodb');

//store connection string on a file named config
const config = require('./config');

const router = express.Router();

// Get Inventories
router.get('/', async (req, res) => {
    const inventories = await loadInventoryCollection();
    res.send(await inventories.find({}).toArray());
});

// Add inventory
router.post('/', async (req, res) => {
    const posts = await loadInventoryCollection();
    await posts.insertOne({
        item: req.body.item,
        price: Number(req.body.price),
        quantity: Number(req.body.quantity),
        supplier: req.body.supplier,
        createdAt: new Date(),
        category: req.body.category
    });
    res.status(201).send();
});

// Search Inventory
router.post('/search', async (req, res) => {
    try{
        const posts = await loadInventoryCollection();
        var inventories = [];
        if (req.body.searchType === "name") {
            inventories = await posts.find({ item: { $regex: new RegExp(".*" + req.body.query + ".*", "i") } }).toArray()
        }else if (req.body.searchType === "category") {
            inventories = await posts.find({ category: { $regex: new RegExp(".*" + req.body.query + ".*", "i") } }).toArray()
        }else if (req.body.searchType === "price") {
            inventories = await posts.find({ price: { $gte: Number(req.body.query) } }).toArray()
        }else if (req.body.searchType === "quantity") {
            inventories = await posts.find({ quantity: { $gte: Number(req.body.query) } }).toArray()
        }
        res.send(inventories);
    }
    catch (err){
        console.log("API error");
        console.log(err);
    }
    
})



//Delete Post
router.delete('/:id', async (req, res) => {
    const posts = await loadInventoryCollection();
    await posts.deleteOne({ _id: new mongodb.ObjectID(req.params.id) });

    res.status(200).send();
    //await posts.deleteOne({_id: req.params.id});
});

//update item
router.put('/:id', async (req, res) => {
    const posts = await loadInventoryCollection();
    await posts.updateOne(
        {
            _id: new mongodb.ObjectID(req.params.id)
        },
        {
            $set: {
                item: req.body.item,
                price: Number(req.body.price),
                quantity: Number(req.body.quantity),
                supplier: req.body.supplier,
                updatedAt: new Date(),
                category: req.body.category
            }
        }
    );

    res.status(200).send();
});

//reduce quantity by 1
router.put('/dec/:id', async (req, res) => {
    const posts = await loadInventoryCollection();
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


async function loadInventoryCollection() {
    const client = await mongodb.MongoClient.connect(config.string, {
        useNewUrlParser: true
    });

    return client.db('vue-express').collection('inventory');
}

module.exports = router;