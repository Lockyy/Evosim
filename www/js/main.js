// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
  baseUrl: 'js',
  urlArgs: "ts="+new Date().getTime(),
  paths: {
    underscore: 'libs/underscore/underscore',
    physicsJS: 'libs/physicsjs/physicsjs-full'
  }
});

require([
  // Load our app module and pass it to our definition function
  'app',
], function(App){
  // The "app" dependency is passed in as "App"
  App.initialize();
});