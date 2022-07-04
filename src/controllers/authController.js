import { db, objectId } from '../dbStrategy/mongo.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { loginSchema, registerUserSchema } from "../schemas/userSchemas.js";


export async function createUser(req, res) {

    const user = req.body;

    const validation = registerUserSchema.validate(user, { abortEarly: true });

    if (validation.error) {
        res.status(422).send("Email ou senha invalidos!");
        return;
    }

    try {

        const passwordHash = bcrypt.hashSync(user.password, 10);
        const userDb = await db.collection('users').findOne({ email: user.email });

        if (userDb) {
            res.status(409).send("Email ou nome já utilizado!");
            return;
        }

        if (user.confirmPassword !== user.password) {
            res.status(409).send("Erro ao confirmar senha!");
            return;
        }

        await db.collection("users").insertOne({ ...user, password: passwordHash });

        res.sendStatus(201);

    } catch (error) {
        res.status(500).send("Problema de cadastramento!");
    }

}

export async function loginUser(req, res) {

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
                userId: new objectId(userDb._id),
                name: userDb.name
            });

            return res.status(201).send({ token, name: userDb.name });
        } else {
            return res.status(401).send('Senha ou email incorretos!');
        }
    } catch (error) {
        res.status(500).send("Problema de cadastramento!");
    }

}