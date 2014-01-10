//todo-hack see #https://github.com/firebase/firereader/issues/30
//todo-hack when that issue is fixed, this script will no longer be necessary
var crypto = require("crypto")
   , request = require("request")
   , Parser = require("feedparser")
   , Firebase = require("firebase");

var REFRESH_INTERVAL = 600000;

var url = process.env.FBURL || "https://feedthefire.firebaseio.com/";
var services = process.env.SERVICES? process.env.SERVICES.split(',') : ['persona', 'facebook', 'twitter', 'github'];

new Firebase(url).auth(process.env.SECRET, function(err) {
   if (err) {
      console.error("Firebase authentication failed!", err);
   } else {
      setupServices(services);
   }
});

function setupServices(serviceList) {
   for(var i= 0, len = serviceList.length; i < len; i++) {
      launchService(serviceList[i]);
   }
}

function launchService(service) {
   console.log('launching', service); //debug
   var feeds = {};
   var feedContent = {};
   var ref = new Firebase(url+service);
   setInterval(parseFeeds, REFRESH_INTERVAL);
   setupHandlers();

   function getHash(value) {
      var shasum = crypto.createHash("sha1");
      shasum.update(value);
      return shasum.digest("hex");
   }

   function sanitizeObject(obj) {
      if (typeof obj != typeof {}) {
         return obj;
      }

      var newObj = {};
      var special = [".", "$", "/", "[", "]"];
      for (var key in obj) {
         var sum = -1;
         for (var i in special) {
            sum += (key.indexOf(special[i])) + 1;
         }
         if (sum < 0) {
            if (key == "date" || key == "pubdate" || key == "pubDate") {
               if (obj[key]) {
                  newObj[key] = obj[key].toString();
               }
            } else if (key == "#") {
               newObj["value"] = sanitizeObject(obj[key]);
            } else if (key.indexOf("#") >= 0) {
               newObj["@" + key.replace("#", "")] = sanitizeObject(obj[key]);
            } else if (sanitizeObject(obj[key]) && key != "") {
               newObj[key] = sanitizeObject(obj[key]);
            }
         }
      }
      return newObj;
   }

   function writeStatus(url, data) {
      writeToFirebase(url, data, process.env.SECRET, function(err) {
         if (err) {
            console.error(err);
         }
      });
   }

   function writeToFirebase(url, data, secret, cb) {
      var options = {url: url + ".json", method: "PUT", json: data};
      if (secret) {
         options.qs = {auth: secret};
      }

      request(options, function(err, resp, body) {
         var code;
         if (!resp || !resp.statusCode) {
            code = "500";
         } else {
            code = resp.statusCode;
         }

         if (!err && code == 200) {
            if (cb) {
               cb(null);
            }
         } else {
            var msg;
            if (code == 403) {
               msg = "Error: permission denied while writing to " + url + " (did you specify a secret?)";
            } else if (code == 417) {
               msg = "Error: the specified Firebase " + url + " does not exist.";
            } else {
               msg = "Error: could not write to " + url + ", received status code " + code;
            }
            if (err) {
               msg = url + ": " + err.toString();
            }
            if (cb) {
               cb(msg);
            } else {
               console.error(msg);
            }
         }
      });
   }

   function setupHandlers() {
      var self = this;
      ref.on("child_added", function(snap) {
         var userid = snap.name();
         console.log('setup user', userid); //debug
         if (!feeds[userid]) {
            feeds[userid] = {};
         }
         var childRef = ref.child(userid).child("feeds");
         childRef.on("child_added", editUserFeed.bind(self, userid));
         childRef.on("child_changed", editUserFeed.bind(self, userid));
         childRef.on("child_removed", function(childSnap) {
            delete feeds[userid][childSnap.name()];
         });
      });
      ref.on("child_removed", function(remSnap) {
         var childRef = ref.child(remSnap.name()).child("feeds");
         childRef.off();
      });
   }

   function editUserFeed(userid, snap) {
      var id = snap.name();
      var entry = feeds[userid][id] = {
         statusURL: new Firebase(
            snap.ref().toString()
         ).parent().parent().child("status/" + id).toString(),
         value: snap.val()
      };
      parseFeed(entry);
   }

   function parseFeeds() {
      for (var uid in feeds) {
         var user = feeds[uid];
         for (var index in user) {
            parseFeed(user[index]);
         }
      }
      console.log("Parsed feeds at: " + new Date());
   }

   function parseFeed(feed) {
      try {
         var url = feed.value.url;
         var statusURL = new Firebase(feed.statusURL).toString();

         if (!url || url.indexOf("http") < 0) {
            writeStatus(statusURL, "Error: Invalid feed URL specified: " + url);
            return;
         }
         if (!feed.value.firebase || feed.value.firebase.indexOf("https") < 0) {
            writeStatus(statusURL, "Error: Invalid Firebase URL specified, did you include the https prefix?");
            return;
         }

         var fbURL = feed.value.firebase;
         //todo-hack see #https://github.com/firebase/firereader/issues/30
         //todo-hack we only write back to our own instance here, so just use the server secret directly
         var secret = process.env.SECRET; //feed.value.secret;
         var urlHash = getHash(url);

         if (feedContent[urlHash]) {
            if (new Date().getTime() - feedContent[urlHash].lastSync > REFRESH_INTERVAL) {
               getAndSet(url, urlHash, statusURL, fbURL, secret);
            } else {
               setFeed(feedContent[urlHash].content, statusURL, fbURL, secret);
            }
         } else {
            getAndSet(url, urlHash, statusURL, fbURL, secret);
         }
      } catch(e) {
         writeStatus(statusURL, e.toString());
      }
   }

   function getAndSet(url, hash, statusURL, fbURL, secret) {
      request(url, function(err, resp, body) {
         if (!err && resp.statusCode == 200) {
            feedContent[hash] = {lastSync: new Date().getTime(), content: body};
            setFeed(body, statusURL, fbURL, secret);
         } else {
            if (err) {
               writeStatus(statusURL, err.toString());
            } else {
               writeStatus(statusURL, "Error: got status " + resp.statusCode + " when fetching feed.");
            }
         }
      });
   }

   function setFeed(feed, statusURL, fbURL, secret) {
      Parser.parseString(feed, {addmeta: false}, function(err, meta, articles) {
         if (err) {
            writeStatus(statusURL, err.toString());
            return;
         }
         try {
            writeToFirebase(fbURL + "/meta", sanitizeObject(meta), secret, function(err) {
               if (err) {
                  writeStatus(statusURL, err.toString());
                  return;
               }
               setArticles(articles, 0, articles.length, statusURL, fbURL, secret);
            });
         } catch(e) {
            writeStatus(statusURL, e.toString());
         }
      });
   }

   function setArticles(articles, done, total, statusURL, fbURL, secret) {
      if (total <= 0) {
         writeStatus(statusURL, "Last Sync: " + new Date().toString());
         return;
      }

      var article = articles[done];
      var id = getHash(article.guid || article.link ||
         article.title || article.summary);
      var date = article.pubDate || article.pubdate || article.date ||
         article["rss:pubdate"] || new Date().toString();
      var timestamp = Date.parse(date);

      var arURL = fbURL + "/articles/" + id;
      var articleObj = sanitizeObject(article);
      articleObj[".priority"] = timestamp;

      writeToFirebase(arURL, articleObj, secret, function(err) {
         if (err) {
            writeStatus(statusURL, err);
         } else {
            done++;
            if (done == total) {
               writeStatus(statusURL, "Last Sync: " + new Date().toString());
            } else {
               setArticles(articles, done, total, statusURL, fbURL, secret);
            }
         }
      });
   }

}