//
// js/app.js
//
// Here we set up the PhysicsJS World, the renderer, and start the physics.
// We also set up the CellList and with that get the actual simulation running.
//
define([
  'jquery',
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
], function($, _, CellList, Utils, Physics){

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
      window.width = width = $(window).width();
      window.height = height = window.innerHeight;
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
        Physics.behavior('sweep-prune'),
        Physics.integrator('verlet', { drag: 0.02, angularDrag: 0.02 }),
      ]);

      world.on('collisions:detected', function( data ){
        for (var i = 0, l = data.collisions.length; i < l; i++){
          _.each(data.collisions, function(collision) {
            if(collision.bodyA.treatment == 'dynamic' && collision.bodyB.treatment == 'dynamic') {
              branchA = collision.colliderBodyA.branch
              cellA = branchA.cell
              branchB = collision.colliderBodyB.branch
              cellB = branchB.cell
              cellA.handleCollision(cellB, branchA, branchB)
              cellB.handleCollision(cellA, branchB, branchA)
            }
          })
        }
      });

      var cellList = new CellList(50);
      // subscribe to ticker to advance the simulation
      Physics.util.ticker.on(function(time) {
        _.each(cellList.list, function(cell) {
          cell.resetColors()
          cell.decrementColorTimer()
        })
        world.step(time)
      });

      Physics.util.ticker.start()
    })
  }

  return {
    initialize: initialize
  };
});