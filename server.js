var express = require('express');
var hbs = require('hbs');
var expressHbs = require('express-handlebars');
var app = express();
var fs = require('fs');
app.set('view engine', 'html');
app.engine('html', expressHbs({extname:'html', defaultLayout:'app.html'}))
app.use(express.static('public'));

app.get('/', function (req, res) {
  fs.readFile('json/sounds.json', 'utf8', function(err, sounds) {
      res.render("home.html", {
        sounds: JSON.parse(sounds).sounds
      });
  });
});
app.get('/sound/:id', function (req, res) {
  let id = req.params.id;
  fs.readFile('json/sounds.json', 'utf8', function(err, sounds) {
          sounds = JSON.parse(sounds).sounds;
      let sound = {};
      sounds.map(function(element){
        if (element.id == id) {
          sound = element;
          return;
        }
      });
      res.render("sound.html", {
        sound: sound
      });
  });
});

app.listen(process.env.PORT || 5000);
