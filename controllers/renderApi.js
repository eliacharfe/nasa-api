const db = require("../models");

const DATABASE_ERR = 'Error in database: ';
const DISCONNECT_ERR = 'User disconnected: ';
const DISCONNECT_ERR_MSG = 'you are no longer connected';
/**
 * save a photo to the particular user list that want to save it
 * @param req - email, image id, image url, earth date, sol, camera
 * @param res
 * @returns {Promise<T | *>|*}
 */
exports.postSave = (req, res) => {
    if (req.session.connected) {
        db.Photo.findOne({
            where: {
                email: req.session.email,
                img_src: req.body.img_src
            }
        }).then((exist) => {

            console.log("exist: " + exist)
            if (!exist) {
                return db.Photo.create({
                    email: req.session.email, img_id: req.body.img_id, img_src: req.body.img_src,
                    earth_date: req.body.earth_date, sol: req.body.sol, camera: req.body.camera
                })
                    .then(() => {
                        return res.json({createNew: "createNew"});
                    })
                    .catch((err) => {
                        catchError(res, err.message, DATABASE_ERR, 400);
                    });
            } else {
                return res.json({createNew: "notCreateNew"});
            }
        })
            .catch((err) => {
                catchError(res, err.message, DATABASE_ERR, 400);
            });
    } else catchError(res, DISCONNECT_ERR_MSG, DISCONNECT_ERR, 404);
}
//----------------------
/**
 * extarct the user's saved photos
 * @param req - email
 * @param res - user's saved photos
 * @returns {Promise<Model[] | *>}
 */
exports.getExtract = (req, res) => {
    if (req.session.connected) {
        return db.Photo.findAll({where: {email: req.session.email}}) // {where: {email: req.body.email}}
            .then((photos) => {
                res.send(photos);
            }).catch((err) => {
                catchError(res, err.message, DATABASE_ERR, 400);
            });
    } else catchError(res, DISCONNECT_ERR_MSG, DISCONNECT_ERR, 404);
};
//---------------------
/**
 *  clear all the saved images of the user
 * @param req - email
 * @param res
 * @returns {Promise<T | *>}
 */
exports.postClear = (req, res) => {
    if (req.session.connected) {
        return db.Photo.destroy({
            where: {email: req.session.email},
        }).then(function () {
            res.json({ok: "ok"})
        }).catch((err) => {
            catchError(res, err.message, DATABASE_ERR, 400);
        });
    } else catchError(res, DISCONNECT_ERR_MSG, DISCONNECT_ERR, 404);
};
//---------------------
/**
 * delete a particular photo that user want to delete
 * @param req - email, image url
 * @param res
 * @returns {Promise<T | *>}
 */
exports.deleteDel = (req, res) => {
    if (req.session.connected) {
        return db.Photo.findOne({
            where: {
                email: req.session.email,
                img_id: req.params.id
            }
        }).then((img) => img.destroy({force: true}))
            .then(function () {
                res.json({ok: "ok"})
            })
            .catch((err) => {
                catchError(res, err.message, DATABASE_ERR, 400);
            });
    } else catchError(res, DISCONNECT_ERR_MSG, DISCONNECT_ERR, 404);
};

//-----------------------------
const catchError = function (res, errMsg, kindErr, numErr) {
    console.log(kindErr, JSON.stringify(errMsg));
    return res.status(numErr).send(errMsg);
}
