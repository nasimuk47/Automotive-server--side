const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Fix the typo here
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qtgfrql.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();

        const cardCollection = client.db("cardDB").collection("card");
        const myCartCollection = client.db("cardDB").collection("myCart");

        app.get("/card", async (req, res) => {
            const cursor = cardCollection.find();

            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/myCart", async (req, res) => {
            const cursor = myCartCollection.find();

            const result = await cursor.toArray();
            console.log(result, "mycart result");
            res.send(result);
        });

        app.get("/card/:id", async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            const result = await cardCollection.findOne(query);
            res.send(result);
        });

        app.post("/Cards", async (req, res) => {
            const NewCard = req.body;
            console.log(NewCard);

            const result = await cardCollection.insertOne(NewCard);
            res.send(result);
        });
        app.post("/myCart", async (req, res) => {
            const myCart = req.body;
            console.log(myCart);

            const result = await myCartCollection.insertOne(myCart);
            res.send(result);
        });

        app.put("/card/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const option = { upsert: true };

            const updateCar = req.body;

            const updateForm = {
                $set: {
                    name: updateCar.name,
                    brand: updateCar.brand,
                    type: updateCar.type,
                    price: updateCar.price,
                    description: updateCar.description,
                    rating: updateCar.rating,
                    photo: updateCar.photo,
                },
            };

            const result = await cardCollection.updateOne(
                filter,
                updateForm,
                option
            );

            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("driverzen server is running");
});

app.listen(port, () => {
    console.log(`driverzen server running on port: ${port}`);
});
