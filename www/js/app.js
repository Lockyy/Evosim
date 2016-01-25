//
// js/app.js
//
// Here we set up the PhysicsJS World, the renderer, and start the physics.
// We also set up the CellList and with that get the actual simulation running.
//
define([
  'underscore',
  'collections/cellList',
  'services/utils',
  'physicsjs',
  'libs/physicsjs/bodies/rectangle',
  'libs/physicsjs/bodies/compound',
  'libs/physicsjs/renderers/canvas',
  'libs/physicsjs/behaviors/edge-collision-detection',
  'libs/physicsjs/behaviors/body-collision-detection',
  'libs/physicsjs/behaviors/body-impulse-response',
  'libs/physicsjs/behaviors/sweep-prune',
], function(_, CellList, Utils, Physics){

  var initialize = function() {
    window.maxLogicFPS = 30;
    window.tickSpeed = 1000 / window.maxLogicFPS;

    Physics({
      // set the timestep
      timestep: window.tickSpeed,
      // maximum number of iterations per step
      maxIPF: 16,
      // set the integrator (may also be set with world.add())
      integrator: 'verlet'
    }, function(world) {

      window.world = world
      window.width = width = 500;
      window.height = height = 500;
      viewportBounds = Physics.aabb(0, 0, width, height);

      // create a renderer
      renderer = Physics.renderer('canvas', {
        el: 'viewport',
        width: width,
        height: height,
        autoResize: false
      });

      // add the renderer
      world.add(renderer);
      // render on each step
      world.on('step', function() {
        world.render()
      });

      // some fun colors
      colors = {
        blue: '0x1d6b98',
        blueDark: '0x14546f',
        red: '0xdc322f',
        darkRed: '0xa42222'
      };

      // constrain objects to these bounds
      world.add(Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds,
        restitution: 0.99,
        cof: 0.99
      }));

      // add behaviors
      world.add([
        Physics.behavior('body-impulse-response'),
        Physics.behavior('body-collision-detection'),
        Physics.behavior('sweep-prune')
      ]);

      var cellList = new CellList(25);
      // subscribe to ticker to advance the simulation
      Physics.util.ticker.on(function(time) {
        world.step(time)
      });

      Physics.util.ticker.start()
    })
  }

  return {
    initialize: initialize
  };
});