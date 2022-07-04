import { db, objectId } from '../dbStrategy/mongo.js';
import dayjs from "dayjs";
import { postSchema } from "../schemas/userSchemas.js";

export async function getRegisters(_req, res) {

    const session = res.locals.session;

    try {
        const data = await db
            .collection('registers')
            .find({ userId: new objectId(session.userId) })
            .toArray();

        res.send({ name: session.name, userData: data });

    } catch (error) {
        res.status(500).send("Problema para puxar dados do usuário!");
    }
}

export async function postRegister(req, res) {
    const type = req.query.type;
    const post = req.body;

    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

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
            time: dayjs().format("DD/MM")
        });

        res.status(201).send('Post criado com sucesso');

    } catch (error) {
        res.status(500).send("Erro de Requisição!")
    }

}