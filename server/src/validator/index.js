import validator from 'validator';

function createError(message, code){
    const err = new Error(message);
    err.statusCode = code;
    return err
}

export function validateName(name) {
    if(!name || name.trim().length === 0) {
        throw createError('Name is requried.',422);
    }
}

export function validateEmail(email) {
    if(!email || email.trim().length === 0) {
        throw createError('Email is requried.',422);
    }
}

export function validatePassword(password) {
    if(!password || password.trim().length === 0) {
        throw createError('Password is requried.',422);
    }
}