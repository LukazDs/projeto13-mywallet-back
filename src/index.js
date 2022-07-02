import express from 'express';
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from 'bcrypt';
import dayjs from "dayjs";
import { v4 as uuid } from 'uuid';

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect(() => {
    db = mongoClient.db("api-mywallet");
})

const server = express();

server.use(express.json());
server.use(cors());

const registerUserSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required()
});

const loginSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required()
});

server.post("/sign-up", async (req, res) => {

    const user = req.body;

    const validation = registerUserSchema.validate(user, { abortEarly: true });

    if (validation.error) {
        res.status(422).send("Email ou senha invalidos!");
        return;
    }

    try {

        const users = await db.collection('users').find().toArray();
        const passwordHash = bcrypt.hashSync(user.password, 10);

        if (users.some(v => (v.name === user.name || v.email === user.email))) {
            res.status(409).send("Email ou nome já utilizado!");
            return;
        }

        await db.collection("users").insertOne({ ...user, password: passwordHash });
        console.log(users)
        res.sendStatus(201);

    } catch (error) {
        res.status(500).send("Problema de cadastramento!");
    }

})

server.post("/sign-in", async (req, res) => {

    const user = req.body;

    const validation = loginSchema.validate(user);

    if (validation.error) {
        return res.status(422).send("Email ou senha invalidos!");
    }

    try {
        const userDb = await db.collection('users').findOne({ email: user.email });

        if (userDb && bcrypt.compareSync(user.password, userDb.password)) {
            const token = uuid();

            await db.collection('sessions').insertOne({
                token,
                userId: user._id
            });

            return res.status(201).send({ token });
        } else {
            return res.status(401).send('Senha ou email incorretos!');
        }
    } catch (error) {
        res.status(500).send("Problema de cadastramento!");
    }

});

server.listen(process.env.PORT, () => {
    console.log("Conexão estabelecida");
})
