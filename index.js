const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
// const corsOptions = {
//     origin: '*',
//     credentials: true,
//     optionSuccessStatus: 200,
// }

// app.use(cors(corsOptions))
app.use(cors())

app.use(express.json())

app.get('/', (req, res) => {
    res.send('toy shop server is running')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tnrtmhg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const productsCollection = client.db('toyShop').collection('products');
        const addedToysCollection = client.db('toyShop').collection('myToys');
        const categoriesCollection = client.db('toyShop').collection('categories');

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        app.get('/myToys', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await addedToysCollection.find(query).toArray();
            res.send(result);
            console.log(result);
        })

        app.post('/myToys', async (req, res) => {
            const myToy = req.body;
            console.log(myToy);
            const result = await addedToysCollection.insertOne(myToy);
            res.send(result);
        })

        app.post('/categories', async (req, res) => {
            const myCategory = req.body;
            console.log(myCategory);
            const result = await categoriesCollection.insertOne(myCategory);
            res.send(result);
        })

        app.patch('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateMyToy = req.body;
            console.log(updateMyToy);
            const updateDoc = {
                $set: {
                    plot: updateMyToy.status
                },
            };
            const result = await addedToysCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addedToysCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/categories', async (req, res) => {
            const cursor = categoriesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`the toy shop is running on port: ${port}`)
})