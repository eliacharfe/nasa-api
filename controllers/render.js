const db = require("../models");

const CREATION_ERR = 'There was an error creating the user',
    EXPIRED = 'Your time is expired',
    REGISTER = 'You are register!',
    NOT_REGISTER = 'This email is not registered',
    PWD_ERR = 'Incorrect password',
    FIND_ERR = 'There was an error find the user', NONE = '';
/**
 * if user is connected will render his home page, if not connected will render the login page
 * @param req
 * @param res  - will render login page / home page
 * @returns {*}
 */
exports.get = (req, res) => {
    if (!funcModule.userConnected(req, res))
        return res.render('login', {
            title: 'Login', msg: NONE, emailError: NONE, passwordError: NONE,
            firstname: req.body.firstName, lastname: req.body.lastName, script: 'loginValidation'
        });
};
//--------------------------------------------
/**
 * if 1 minute passed from submission of the email+name will render register again
 * else will search the user (by email) in the database and if is not exist yet will create the new
 * user and his data in the database (get here only after client side validation)
 * @param req - email, 1st name, last name
 * @param res - will render register page / login page
 * @returns {*}
 */
exports.post = (req, res) => {
    const mail = req.body.email.toLowerCase().trim();
    const firstName = req.body.first.trim();
    const lastName = req.body.last.trim();

    if (!req.cookies.submitFirstFormCookie)
        return res.render('register', {title: 'Sign up', msg: EXPIRED, script: 'registerValidation'});

    db.User.findOne({where: {email: mail}})
        .then(function (user) {
            if (!user) {
                return db.User.create({
                    email: mail, firstName: firstName, lastName: lastName, password: req.body.pwd
                }).then(
                    res.render('login', {
                        title: "Login", msg: REGISTER, emailError: NONE, passwordError: NONE,
                        firstname: firstName, lastname: lastName, script: 'loginValidation'
                    })
                ).catch((err) => {
                    funcModule.catchError(res, err.message, CREATION_ERR, 400);
                })
            }
        })
};
//-----------------------------
/**
 * if the email is not register / password is incorrect, will render the login page with a msg accordingly
 * else will log in the user and show him his home page with his saved photos (get here only after client side validation)
 * @param req - email, password, 1st name, last name
 * @param res - login page / home page
 */
exports.postLogin = (req, res) => {
    const mail = req.body.loginEmail.toLowerCase().trim();
    const pwd = req.body.loginPwd;

    db.User.findOne({
        where: {email: mail}
    }).then(function (email) {
        if (!email) {
            return res.render('login', {
                title: 'Login', msg: NONE, emailError: NOT_REGISTER, passwordError: NONE,
                firstname: req.body.firstName, lastname: req.body.lastName, script: 'loginValidation'
            });
        } else {
            return db.User.findOne({
                where: {email: mail, password: pwd}
            }).then(function (password) {
                if (!password) {
                    return res.render('login', {
                        title: 'Login', msg: NONE, emailError: NONE, passwordError: PWD_ERR,
                        firstname: req.body.firstName, lastname: req.body.lastName, script: 'loginValidation'
                    });
                } else {
                    req.session.connected = true;
                    req.session.email = mail;
                    // req.session.firstName = req.body.firstName;
                    // req.session.lastName = req.body.lastName;

                    return res.render('homePage', {
                        email: mail, firstname: email.firstName, lastname: email.lastName,
                        title: "NASA API - Mars Photos", script: 'funcs'
                    });
                }
            })
                .catch((err) => {
                    funcModule.catchError(res, err.message, FIND_ERR, 400);
                })
        }
    });
};
//------------------------
/**
 *  when the user log out will render the login page and remember it by setting the boolean session to false
 * @param res - login page
 * @returns {*}
 */
exports.getLogout = (req, res) => {
    req.session.connected = false;
    return res.render('login', {
        title: 'Login', msg: NONE, emailError: NONE, passwordError: NONE,
        firstname: req.session.firstName, lastname: req.session.lastName, script: 'loginValidation'
    });
}
//--------------------------------
/**
 * if user is not connected will render the 1st register page  else render his home page
 * @param res - register page / home page
 * @returns {*}
 */
exports.getRegister = (req, res) => {
    if (!funcModule.userConnected(req, res))
        return res.render('register', {title: 'Sign up', msg: NONE, script: 'registerValidation'});
};
//----------------
/**
 * setting a cookie to 1 minute long and render the password page (get here only after client side validation)
 * @param req - email, 1st name, last name
 * @param res - password page
 * @returns {*}
 */
exports.postPassword = (req, res) => {
    res.cookie('submitFirstFormCookie', 'value', {maxAge: 60 * 1000});

    return res.render('password', {
        msg1: NONE, msg2: NONE, title: 'Register password', email: req.body.email.toLowerCase(),
        firstname: req.body.firstName, lastname: req.body.lastName, script: 'passwordValidation'
    });
};
//----------------------
/**
 * check if user exist in the database (by email)
 * @returns {Promise<Model[] | *>}
 */
exports.checkEmailExist = (req, res) => {
    return db.User.findAll({ where: { email: req.body.email }})
        .then((email) => {
            res.send(email)
        }).catch((err) => {
            funcModule.catchError(res, err.message, FIND_ERR, 400);
        });
};
//---------------------------------------
const funcModule = (() => {
    /**
     * if user is connected will render his home page else return false
     * @param req - email (in session)
     * @param res - home page
     * @returns {boolean}
     */
    const userConnected = function (req, res) {
        if (req.session.connected) {
            db.User.findOne({
                where: {email: req.session.email}
            }).then(function (user) {
                res.render('homePage', {
                    email: req.session.email, firstname: user.firstName, lastname: user.lastName,
                    title: "NASA API - Mars Photos", script: 'funcs'
                });
            }).catch((err) => {
                catchError(res, err.message, FIND_ERR, 400);
            })
            return true;
        }
        return false;
    }

    const catchError = function (res, errMessage, kindError, numError) {
        console.log(kindError, JSON.stringify(errMessage));
        return res.status(numError).send(errMessage)
    }

    return {
        userConnected: userConnected,
        catchError: catchError
    }
})();