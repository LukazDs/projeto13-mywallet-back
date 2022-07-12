import joi from "joi";

export const registerUserSchema = joi.object({
    name: joi
        .string()
        .required(),
    email: joi
        .string()
        //.pattern(/^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$/i)
        .required(),
    password: joi
        .string()
        //.pattern(/[a-zA-Z0-9]{4,8}/)
        .required(),
    confirmPassword: joi
        .string()
        //.pattern(/[a-zA-Z0-9]{4,8}/)
        .required()
});

export const loginSchema = joi.object({
    email: joi
        .string()
        .pattern(/^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$/i)
        .required(),
    password: joi
        .string()
        .pattern(/[a-zA-Z0-9]{4,8}/)
        .required()
});

export const postSchema = joi.object({
    value: joi
        .number()
        .required(),
    description: joi
        .string()
        .required()
});
