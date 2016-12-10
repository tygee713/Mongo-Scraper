var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require("request");
var cheerio = require("cheerio");

var app = express();
//Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/3000");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

//renders the index page
app.get('/', function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.send(doc);
    }
  });
});

//scrapes Kotaku's website
app.get('/scrape', function(req, res) {
  request("http://www.kotaku.com/", function(error, response, html) {
    var $ = cheerio.load(html);

    $("article h1").each(function(i, element){
      var result = {};

      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      result.body = "";

      request(result.link, function(error, response, html) {
        $("article div").each(function(i, element) {
          result.body += $(this).children("p").text();
        });
        var entry = new Article(result);

        entry.save(function(err, doc) {
          if (err) {
          console.log(err);
          }
          else {
            console.log(doc);
          }
        });
      });
    });
  });
  res.send("Scrape Complete");
});

//gets the individual article along with its notes
app.get('/articles/:id', function(req, res) {

});

//posts a new note
app.post('/articles/:id/post', function(req, res) {

});

var port = 3000;
app.listen(port, function() {
  console.log('App listening on PORT: ' + port);
});