Real-time Mobile Chat
=========================

A simple Chat Room app with [Ionic](http://ionicframework.com/), [Firebase](http://firebase.com/), AngularJS, and Cordova.


Install libraries
-----------------

    npm install -g ionic
  
* download and setup android SDK in path: http://cordova.apache.org/docs/en/3.1.0/guide_platforms_android_index.md.html#Android%20Platform%20Guide
* download and setup ant in path: http://ant.apache.org/bindownload.cgi


Running as a local website (for testing)
----------------------


    cd www
    python -m SimpleHTTPServer 8000


Running the emulator
----------------

    npm install -g ios-sim
    cordova emulate
    cordova emulate ios    
    cordova emulate android    

Running on the device
-------------------

    npm install -g ios-deploy
    cordova run
    cordova run ios 
    cordova run android
    
    
