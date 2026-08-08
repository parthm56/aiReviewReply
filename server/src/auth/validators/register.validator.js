import { validateName, validateEmail, validatePassword } from '../../validator/index.js';

export async function validateRigster(req, res, next) {
    try {

        const { email, password, name } = req.body;
        validateName(name);
        validateEmail(email);
        validatePassword(password);

        req.validebody = {
            name: name,
            email: email,
            password: password
        };
        next();
    } catch(err) {
        next(err);
    }
}

export async function validateLogin(req, res, next) {
    try {
        const { email, password } = req.body;
        validateEmail(email);
        validatePassword(password);
        req.validebody = {
            email: email,
            password: password
        };
        next();
    } catch(err) {
        next(err);
    }
}
