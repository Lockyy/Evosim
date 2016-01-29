//
// js/services/constants.js
//
// App constants
//

define([], {

  // Cell Constants
  /////////////////

  STARTING_ENERGY_FOR_CELLS: 50,

  START_CELL_COUNT: 2,

  COLOR_CHANGE_TIMER: 10,

  MAX_SPLITS: 6,

  DEATH_THRESHOLD: 0,

  MAX_STARTING_SPEED: 0,

  // Branch Constants
  ///////////////////

  COLORS: {
    RED: 'red',
    GREEN: '#70FE3D',
    YELLOW: 'yellow',
    GREY: 'grey',
    WHITE: 'white',
    BLUE: 'blue',
  },

  BRANCH_CHANCE: 0.5,

  MUTATION_CHANCE: 0.1,

  MAX_BRANCH_LENGTH: 15,

  MAX_BRANCH_OFFSET: 180,


  // Physics Constants
  ////////////////////

  VERTLET: {
    DRAG: 0.02,
    ANGULAR_DRAG: 0.04,
  },

  EDGE_COLLISION: {
    RESTITUTION: 0.99,
    COF: 0.99,
  },

  PHYSICS_FPS: 30,

  MAX_IPF: 16,



})