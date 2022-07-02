import express from 'express';
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
//import joi from "joi";
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

server.listen(process.env.PORT, () => {
    console.log("Conexão estabelecida")
})
