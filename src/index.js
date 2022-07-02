import express from 'express';
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
//import dayjs from "dayjs";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect(() => {
    db = mongoClient.db("api-mywallet");
})

const server = express();

server.use(express.json());
server.use(cors());

const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().required()
});

server.post("/users", async (req, res) => {

    const user = req.body;

    const validation = userSchema.validate(user, { abortEarly: true });

    if (validation.error) {
        res.status(422).send("Email ou senha invalido!");
        return;
    }

    try {

        const users = await db.collection('users').find().toArray();

        if (users.some(v => (v.name === user.name || v.email === user.email))) {
            res.status(409).send("Email ou nome já utilizado!");
            return;
        }

        await db.collection("users").insertOne({ ...user, userId: new ObjectId()});

        console.log(users)

        res.sendStatus(201);

    } catch (error) {
        res.status(500).send("Problema de cadastramento!");
    }

})



server.listen(process.env.PORT, () => {
    console.log("Conexão estabelecida");
})
