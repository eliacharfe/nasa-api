var express = require('express');
var router = express.Router();

const renderApi = require('../controllers/renderApi');

router.post('/save', renderApi.postSave);
//------------------------
router.get('/extract', renderApi.getExtract);
//------------------------
router.post('/clear', renderApi.postClear);
//------------------------------------------------
router.delete('/delete/:id', renderApi.deleteDel);

module.exports = router;
