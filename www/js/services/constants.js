//
// js/services/constants.js
//
// App constants
//

define([], {

  // World Constants
  //////////////////

  INITIAL_CO2: 30000,
  INITIAL_O2: 30000,

  // Cell Constants
  /////////////////

  STARTING_ENERGY_FOR_CELLS: 50,

  START_CELL_COUNT: 1,

  COLOR_CHANGE_TIMER: 10,

  MAX_SPLITS: 6,

  DEATH_THRESHOLD: 0,

  MAX_STARTING_SPEED: 0,

  MINIMUM_CHILDREN: 1,
  MAXIMUM_CHILDREN: 8,

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

  PHOTOSYNTHESIS_MODIFIER: 0.001,

  RESPIRATION_MODIFIER: {
    RED: 0.005,
    GREEN: 0,
    YELLOW: 0.005,
    GREY: 0.01,
    WHITE: 0.01,
    BLUE: 0.005,
  },

  BRANCH_CHANCE: 0.5,

  MUTATION_CHANCE: 0.1,

  MIN_BRANCH_LENGTH: 10,
  MAX_BRANCH_LENGTH: 20,

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