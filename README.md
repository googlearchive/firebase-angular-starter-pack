# Firebase & AngularJS Starter Pack

> [Firebase](https://www.firebase.com) is a scalable realtime backend that lets you build apps fast without managing servers.

## Introduction
This starter pack is for anyone building a web app with Angular and Firebase. Firebase's realtime data store works well with [Angular](http://angularjs.org)'s two-way data binding and content rendering. This repository includes example applications that use some of the common patterns and best practices for integrating the two technologies.

We recommend taking the tutorial on both [Firebase](https://www.firebase.com/tutorial/) and [AngularJS](http://docs.angularjs.org/tutorial) before proceeding.

There are three key benefits to using Firebase as a backend for your Angular
app:

### No backend code required 

Since Firebase is a hosted service, your app can use the Firebase JS library to talk to the Firebase servers directly in order to store and retrieve data. In combination with our [flexible security rules](https://www.firebase.com/docs/security-quickstart.html), this means you don't need any backend code at all to write a production ready web app.

### Realtime by default

Firebase is a realtime data store, which means all data synchronized via the service changes in realtime. When a change occurs on one of your clients, the change propogates to all other clients using your app nearly instantly. This makes Firebase ideal for collaborative web apps where data changes frequently.

### Authentication 

Firebase provides a [Simple Login](https://www.firebase.com/docs/security/simple-login-overview.html) service to add authentication to your app via Facebook, Github, Persona, Twitter, or email / password login. 

## Example Projects

### [Chat](/Chat)

Realtime chat written with AngularJS + Firebase.

[Live Demo](http://www.angularfire.com)

### [Todo](/Todo)

An version of the TodoMVC in AngularJS which has been modifed to use Firebase as a backend. 

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
