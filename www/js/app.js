//
// js/app.js
//
// Here we set up the PhysicsJS World, the renderer, and start the physics.
// We also set up the GameWorld and with that get the actual simulation running.
//
define([
  'jquery',
  'underscore',
  'models/gameWorld',
  'services/utils',
  'services/constants',
  'services/logger',
  'physicsjs',
  'libs/physicsjs/bodies/rectangle',
  'libs/physicsjs/bodies/compound',
  'libs/physicsjs/renderers/canvas',
  'libs/physicsjs/behaviors/edge-collision-detection',
  'libs/physicsjs/behaviors/body-collision-detection',
  'libs/physicsjs/behaviors/body-impulse-response',
  'libs/physicsjs/behaviors/sweep-prune',
], function($, _, GameWorld, Utils, Constants, Logger, Physics){

  var initialize = function() {

    Physics({
      // set the timestep
      timestep: 1000 / Constants.PHYSICS_FPS,
      // maximum number of iterations per step
      maxIPF: Constants.MAX_IPF,
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

      // constrain objects to these bounds
      world.add(Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds,
        restitution: Constants.EDGE_COLLISION.RESTITUTION,
        cof: Constants.EDGE_COLLISION.COF,
      }));

      // add behaviors
      world.add([
        Physics.behavior('body-impulse-response'),
        Physics.behavior('body-collision-detection'),
        Physics.behavior('sweep-prune'),
        Physics.integrator('verlet', {
          drag: Constants.VERTLET.DRAG,
          angularDrag: Constants.VERTLET.ANGULAR_DRAG
        }),
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

      var gameWorld = new GameWorld(Constants.START_CELL_COUNT);
      // subscribe to ticker to advance the simulation
      Physics.util.ticker.on(function(time) {
        _.each(gameWorld.list, function(cell) {
          cell.resetColors()
          cell.decrementColorTimer()
          cell.logicTick()
        })
        gameWorld.removeDead()
        world.step(time)
      });

      Physics.util.ticker.start()
    })
  }

  return {
    initialize: initialize
  };
});