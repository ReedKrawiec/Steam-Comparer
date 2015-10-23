var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var http = require('http');
var Steam = require("steam-webapi");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use(express.static('public'));

var STEAM_KEY = "8AC387656760D28A82353F9FA2C665E0";
var steam;
Steam.key = STEAM_KEY;
Steam.ready(function(err) {
  steam = new Steam();
  console.log("STEAM CREATED");
  //steamcommunity.com/profiles/76561198032829345
  //http://steamcommunity.com/id/superrd
  //,include_appinfo:true,include_played_free_games:true
});
app.get("/Compare",function(req,res){
  var urls = req.query.urls;
  var ids_to_compare = [];
  var ids_resolved = 0;
  for(var a = 0;a<urls.length;a++){
    var helper;
    if(urls[a].indexOf("steamcommunity.com/profiles/")>-1){
      helper = urls[a].split("steamcommunity.com/profiles/");
      finished_with_id_fetching(helper[1].split("/")[0]);

    }
    else if(urls[a].indexOf("steamcommunity.com/id/")>-1){
      helper = urls[a].split("steamcommunity.com/id/");
      console.log(helper[1].split("/")[0]);
       steam.resolveVanityURLAsync({vanityurl:helper[1].split("/")[0]},function(err,data){
         finished_with_id_fetching(data.steamid);
       });
    }
    // REGEX TO CHECK IF THE 'URL' IS ONLY NUMBERS EX STEAM ID
    else if(/^\d+$/.test(urls[a])){
      console.log("ONLY NUMBERS")
      finished_with_id_fetching(urls[a])
    }
    else if((urls[a]).length>0){
      console.log("PERSONAL ID");
      console.log(urls[a])
      steam.resolveVanityURL({vanityurl:urls[a]},function(err,data){
        if(data.message=="No match"){
          console.log("THIS AINT GOOD");
          finished_with_id_fetching(null,1);
        }
        else{
          console.log("COMING THROUGH")
          finished_with_id_fetching(data.steamid,0);
        }
      });
    }
  }
  function finished_with_id_fetching(data,err){

      ids_to_compare.push(data);
      if(ids_to_compare.length==urls.length){
        get_common_games(ids_to_compare,err);

    }
  }
  function get_common_games(final_ids_compare,err){
    var length = final_ids_compare.length;
    var appinfo_include = false;
    var filter = [];
    getData(0,length,final_ids_compare,filter,appinfo_include,err);
  }
  function getData(b,length,final_ids_compare,filter,appinfo_include,err){
    if(err){
      console.log("FUCK")
      res.send("ERROR");
    }
    else{
      if(b == length-1){
        appinfo_include=true;
        console.log("FINAL DATA");
      }
      steam.getOwnedGames({
        steamid:final_ids_compare[b],
        include_appinfo:appinfo_include,
        include_played_free_games:true,
        appids_filter:filter
      },function(err,data) {
        console.log(data);
        if(err){
          console.log(err);
          res.send("ERROR")
        }
        else{
        filter = [];
            for(var dad = 0;dad<data.games.length;dad++){
              filter.push(data.games[dad].appid)
            }
            b++;
            if(b!=length){
              getData(b,length,final_ids_compare,filter,appinfo_include)
            }
            else{
              console.log(data);
              res.send(JSON.stringify(data.games))
            }
          }
      });
    }



  }

});
// catch 404 and forward to error handler



module.exports = app;
