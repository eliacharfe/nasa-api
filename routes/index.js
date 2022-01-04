var express = require('express');
var router = express.Router();

const render = require('../controllers/render');
const db = require("../models");

router.get('/', render.get);
//------------------------------
router.post('/', render.post);
//---------------------------
router.get('/homePage', render.get);
//-------------------------------
router.post('/homePage', render.postLogin);
//------------------------
router.get('/logout', render.getLogout);
//----------------------------
router.get('/register', render.getRegister);
//---------------------------------
router.get('/password', render.getRegister);
//---------------------------
router.post('/password', render.postPassword);
//--------------------------
router.post('/register/checkEmail', render.checkEmailExist);
//------------------------------------------
module.exports = router;
//-------------------------------------------------



//////////////////////////////////////////////////////////////
// for Debugging  (only)  !!!
/////////////////////////////////////////////////////////////
router.get("/all", function (req, res) {
    return db.User.findAll() // {where: {email: req.body.email}}
        .then((users) => {
            res.send(users);
            console.log("all users: " + users); // res.send(users)
        })
})
//-----------------------------------
router.get("/erase", function (req, res, next) {
 // will erase all users and all saved photos
     db.User.destroy({
        where: {},
        truncate: true
    }).then(function () {
         return db.Photo.destroy({
             where: {},
             truncate: true
         }).then(function () {
             res.json({ok: "ok"})
         }).catch((err) => {
             console.log('Error clearing all photos', JSON.stringify(err.message))
             return res.status(400).send(err)
         });
       // res.json({ok: "ok"})
    }).catch((err) => {
        console.log('Error clearing all photos', JSON.stringify(err.message))
        return res.status(400).send(err)
    });
});
//-------------------------------

router.get("/allimg", function (req, res) {
    return db.Photo.findAll() // {where: {email: req.body.email}}
        .then((photos) => {
            res.send(photos);
            console.log("all photos: " + photos); // res.send(users)
        })
})