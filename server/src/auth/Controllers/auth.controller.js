import prisma from "../../prisma.js";
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

export async function login(req, res, next) {
    try {
        const {email, password} = req.validebody;
        const user = await prisma.user.findUnique({where: {
            email: email
        }});

        if(!user) {
            return res.status(404).json({error: "User not found"});
        }
        const isPasswordValid = await argon2.verify(user.password, password);
        if(!isPasswordValid) {
            return res.status(401).json({error: "Invalid credentials"});
        }
        const token = jwt.sign(
            {userId: user.id},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN || '1d'}
        );
        res.json({user: { id:user.id, email: user.email, name: user.name}, token: token});

    } catch(err) {
        next(err);
    }
}

export async function register(req, res, next) {
    try {
        const { email, name, password } = req.validebody;
        //check email exist or not.
        const isExist = await prisma.user.count({
            where: {
                email: email
            }
        }) > 0;
        if(isExist) {
            return res.status(409).json({error: 'This Email is already exist'});
        }
        //hash the password
        const hashPassword = await argon2.hash(password);
        //store inthe db.
        const user = await prisma.user.create({
           data : {
                email: email,
                name: name,
                password: hashPassword
           },
           select: {
                id: true,
                email: true,
                name: true
           }
        });
        //generate token.
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
        //send
        res.status(201).json({user: user, token: token, message:'Registor Successfully.' });
    } catch(err) {
        next(err);
    }
}

