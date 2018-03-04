var express = require('express');
var router = express.Router();
var path = require('path');
var db = require('../db')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.resolve('public/views/index.html'));
});

module.exports = router;

router.get('/testDB',function (req, res, next) {
  db.query("SELECT * FROM kasutaja", [], function (error, result) {
    console.log(result, error);
    res.render("index", {title: result.rows[0].name})
  });

} )