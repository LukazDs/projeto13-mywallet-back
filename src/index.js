import express from 'express';
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
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
                userId: new ObjectId(userDb._id),
                name: userDb.name
            });

            return res.status(201).send({ token, name: userDb.name });
        } else {
            return res.status(401).send('Senha ou email incorretos!');
        }
    } catch (error) {
        res.status(500).send("Problema de cadastramento!");
    }

});

server.get('/userdata', async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    try {
        const session = await db.collection('sessions').findOne({ token });
        console.log("session", session)


        if (!session) {
            return res.status(401).send("Usuário não encontrado!");
        }

        const data = await db
            .collection('registers')
            .find({ userId: new ObjectId(session.userId) })
            .toArray();

        res.send({ name: session.name, userData: data });

    } catch (error) {
        res.status(500).send("Problema para puxar dados do usuário!");
    }
});

server.post('/insert-value', async (req, res) => {
    const type = req.query.type;
    const post = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    const postSchema = joi.object({
        value: joi.number().required(),
        description: joi.string().required()
    });

    const validation = postSchema.validate(post);

    if (!["add", "subtract"].find(v => v === type)) {
        return res.status(500).send("Erro na especificação da rota!")
    }

    if (validation.error) {
        return res.status(422).send("Valores inválidos!");
    }

    try {
        const session = await db.collection('sessions').findOne({ token });

        if (!session) {
            return res.status(401).send("Usuário não encontrado!");
        }

        await db.collection('registers').insertOne({ 
            ...post, 
            type, 
            userId: session.userId, 
            time: dayjs().format("DD/MM") });

        res.status(201).send('Post criado com sucesso');

    } catch (error) {
        res.status(500).send("Erro de Requisição!")
    }

});


server.listen(process.env.PORT, () => {
    console.log("Conexão estabelecida");
})
