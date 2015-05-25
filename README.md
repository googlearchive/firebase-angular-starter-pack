# Firebase & AngularJS Starter Pack

> [Firebase](https://www.firebase.com) is a powerful platform for your mobile and web applications that lets you build apps fast without managing servers.

## Introduction
This starter pack is for anyone building a web app with Angular and Firebase. Firebase's realtime database works well with [Angular](http://angularjs.org)'s two-way data binding and content rendering. This repository includes example applications that use some of the common patterns and best practices for integrating the two technologies.

We recommend taking the tutorial on both the [Firebase JavaScript client](https://www.firebase.com/tutorial/) and [AngularJS](http://docs.angularjs.org/tutorial) before proceeding.

There are three key benefits to using Firebase as a backend for your Angular
app:

### No backend code required

Since Firebase is a hosted service, your app can use the Firebase JS library to talk to the Firebase servers directly. In combination with our [flexible security rules](https://www.firebase.com/docs/security/quickstart.html) that control access to data, this means that in many cases you don't need any backend code at all to write a production ready app.

### Authentication

Firebase [Authentication](https://www.firebase.com/docs/web/guide/user-auth.html) makes it easy to add authentication to your app via Facebook, Github, Persona, Twitter, or email / password login. If you already have your own user authentication system, Firebase can integrate with your servers as well.

### Realtime Database

Firebase has a realtime database, which means all data synchronized via the service receives updates in realtime when a change is made. This makes Firebase especially powerful as a backend for collaborative apps where data changes frequently.

## Example Projects

### [Chat](/Chat)

Realtime chat written with AngularJS + Firebase.

[Live Demo](http://www.angularfire.com)

### [Todo](/Todo)

An version of the TodoMVC in AngularJS which has been modified to use Firebase as a backend.

[Live Demo](http://todomvc.com/labs/architecture-examples/firebase-angular/)

### [Crowdsourced Fog](/Crowdsourced-fog)

A crowdsourced weather application for San Francisco fog.

[Live Demo](http://firebase.github.io/crowdsourced-fog/)

### [Ionic-Chatroom](/Ionic-Chatroom)

A basic realtime chatroom application built with the [Ionic](http://ionicframework.com/) frontend framework and Firebase as the backend.

### [angularFire-seed](/angularFire-seed)

An application skeleton for a typical AngularFire web app. This seed allows you to quickly bootstrap realtime apps using Firebase and Angular.

### [Ionic-seed](/Ionic-seed)

An application skeleton for a typical [Ionic](http://ionicframework.com/) cross-platform (Android, iOS, Web) app. This seed provides a basic Ionic application hierarchy with Firebase and Angular.

## Additional Firebase + AngularJS Resources

* [AngularFire.com](http://angularfire.com/)
* [AngularFire Documentation](http://angularfire.com/documentation.html)
* [Firebase + Angular Google Group](https://groups.google.com/forum/#!forum/firebase-angular)
* [Firebase on StackOverflow](http://stackoverflow.com/questions/tagged/firebase)

If you have any technical questions or feedback on integrating Firebase with Angular, email [support@firebase.com](mailto:support@firebase.com).
