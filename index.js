const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.corsq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
     const database = client.db("ghurifiriPackage");
     const packageCollection = database.collection("packages");
     const orderCollection = database.collection("orders");

  // GET API
    app.get('/packages', async (req, res) => {
      const cursor = packageCollection.find({});
      const allPackage = await cursor.toArray();
      res.send(allPackage);
    });

  // GET Single Service
     app.get('/packages/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const singlePackage = await packageCollection.findOne(query);
        res.json(singlePackage);
        })

    //  insert a package
    app.post('/packages', async(req, res)=>{
        const packages = req.body;
        const result = await packageCollection.insertOne(packages);
        res.json(result)

    })
      //add order in database

  app.post("/addOrders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result)
  });

    // get all order by email query
  app.get("/myOrders/:email", async (req, res) => {
    const cursor = orderCollection.find({email: req.params.email});
     const allOrders = await cursor.toArray();
     res.send(allOrders);

  });
    // get all order by email query
  app.get("/myOrders", async (req, res) => {
    const cursor = orderCollection.find({});
     const allOrders = await cursor.toArray();
     res.send(allOrders);

  });

    // Delete Order Item
    app.delete('/myOrders/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.deleteOne(query);
        res.json(result);
    })
            //UPDATE API
        app.put('/myOrders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedUser.name,
                    email: updatedUser.email
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result)
        })
    }

     finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Its working fine`, port)
})