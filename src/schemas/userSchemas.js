import joi from "joi";

export const registerUserSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().required()

});

export const loginSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required()
});

export const postSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().required()
});
