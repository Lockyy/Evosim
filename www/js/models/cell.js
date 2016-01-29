//
// js/models/cell.js
//
// A Cell represents one organism in the game. On creation it generates a Body
// and adds it to the World for rendering and physics handling. The Cell object
// handles game logic such as actions to take after a collision and reproduction.
//

define([
  'underscore',
  'physicsjs',
  'models/branch',
  'services/utils',
  'services/logger',
  'services/constants',
], function(_, Physics, Branch, Utils, Logger, Constants){

  function Cell(options) {
    this.gameWorld = options.gameWorld

    this.age = 0

    this.startingEnergy = Constants.STARTING_ENERGY_FOR_CELLS
    this.energy = options.energy || this.startingEnergy

    this.createSelf(options)
  }

  Cell.prototype.handleCollision = function(otherCell, branch, otherCellBranch) {
    this.applyColor(branch, otherCellBranch)
  }

  Cell.prototype.applyColor = function(branch, otherCellBranch) {
    if(branch.color == otherCellBranch.color) {
      return
    }

    if(branch.defensive() && otherCellBranch.offensive()) {
      this.applyTemporaryColor(branch.color)
    } else if(branch.offensive()) {
      this.applyTemporaryColor(branch.color)
      if(!otherCellBranch.defensive()) {
        otherCellBranch.cell.applyTemporaryColor('yellow')
        branch.applyEffect(otherCellBranch.cell)
      }
    }
  }

  Cell.prototype.applyTemporaryColor = function (color) {
    this.colorTimer = Constants.COLOR_CHANGE_TIMER
    this.branch.setRectColorsRecursive(color)
  }

  Cell.prototype.resetColors = function() {
    if(this.colorTimer <= 0) {
      this.branch.resetColorRecursive()
    }
  }

  Cell.prototype.decrementColorTimer = function() {
    this.colorTimer--
  }

  // createSelf
  //
  // Creates the current cell from scratch and adds it to the world
  Cell.prototype.createSelf = function(options) {
    this.reproductionCost = Constants.STARTING_ENERGY_FOR_CELLS
    this.split = options.split || Math.ceil(Math.random() * Constants.MAX_SPLITS)

    this.branch = options.branch ||
      new Branch({
        cell: this,
        depth: 0,
        branch: null,
        color: Constants.COLORS.GREEN
      })

    this.calculateColors()

    this.body = this.createPhysicsBody(options.x, options.y)
    this.createRects()

    window.world.add(this.body)
  }

  Cell.prototype.calculateColors = function() {
    // This keeps track of how much of each color the cell has
    this.colors = {}
    this.colors[Constants.COLORS.GREEN] = 0
    this.colors[Constants.COLORS.RED] = 0
    this.colors[Constants.COLORS.YELLOW] = 0
    this.colors[Constants.COLORS.GREY] = 0
    this.colors[Constants.COLORS.WHITE] = 0
    this.colors[Constants.COLORS.BLUE] = 0

    var branch = this.branch

    while(branch) {
      this.addStatToCell(branch.color, branch.length)
      branch = branch.branch
    }
  }

  Cell.prototype.addStatToCell = function(color, length) {
    switch(color) {
      case Constants.COLORS.YELLOW:
        newVal = this.colors[Constants.COLORS.YELLOW] + this.split
      default:
        newVal = this.colors[color] + length * this.split
    }
    this.colors[color] = newVal
    this.reproductionCost += newVal
  }

  // createPhysicsBody
  //
  // Creates and returns PhysicsJS body
  Cell.prototype.createPhysicsBody = function(x, y) {
    return Physics.body('compound', {
      x: x || Math.random() * window.width,
      y: y || Math.random() * window.height,
      vx: Utils.randPlusOrMinus(Constants.MAX_STARTING_SPEED),
      vy: Utils.randPlusOrMinus(Constants.MAX_STARTING_SPEED),
    })
  }

  Cell.prototype.createRects = function() {
    var _this = this

    var branch = this.branch
    var offset = 0
    var rects, baseSplitAngle, angle, pos, previousPOS;
    var previousPOSArray = Utils.filledArray(this.split, {x:0,y:0})
    var currentPOSArray = [];
    while(branch != undefined) {
      rects = []
      offset += branch.offset
      for(splitNumber = 1; splitNumber <= this.split; splitNumber++) {
        baseSplitAngle = (360 / this.split) * splitNumber
        angle = baseSplitAngle + offset
        previousPOS = previousPOSArray[splitNumber - 1]
        pos = Utils.convertEndToCenter(previousPOS.x, previousPOS.y, angle, branch.length)
        end = Utils.getEndCoordinates(previousPOS.x, previousPOS.y, angle, branch.length)

        rect = Physics.body('rectangle', {
          x: -pos.x, y: pos.y,
          height: branch.length, width: 1,
          angle: Utils.deg2rad(angle),
          branch: branch,
          styles: {
            fillStyle: branch.color,
            lineWidth: 0, },
        });
        branch.rects.push(rect)
        rects.push(rect);
        currentPOSArray.push(end)
      }
      previousPOSArray = currentPOSArray
      currentPOSArray = []
      branch = branch.branch
      this.body.addChildren(rects)
    }
  }

  Cell.prototype.logicTick = function() {
    this.age++
    this.energyTick()
    this.movement()
    this.reproduction()
  }

  // energyTick
  //
  // Manages energy production of cell
  // Currently just done using Math.random()
  Cell.prototype.energyTick = function() {
    this.photosynthesis()
    this.respiration()
  }

  Cell.prototype.photosynthesis = function() {
    idealEnergyProduction = this.colors[Constants.COLORS.GREEN] * Constants.PHOTOSYNTHESIS_MODIFIER
    energyToProduce = Utils.ensureBetween(0, this.gameWorld.CO2, idealEnergyProduction)

    this.gameWorld.carbonDioxideToOxygen(energyToProduce)
    this.energy += energyToProduce
  }

  Cell.prototype.respiration = function() {
    energyNeeded = 0
    energyNeeded += this.colors[Constants.COLORS.GREEN] * Constants.RESPIRATION_MODIFIER.GREEN
    energyNeeded += this.colors[Constants.COLORS.RED] * Constants.RESPIRATION_MODIFIER.RED
    energyNeeded += this.colors[Constants.COLORS.YELLOW] * Constants.RESPIRATION_MODIFIER.YELLOW
    energyNeeded += this.colors[Constants.COLORS.WHITE] * Constants.RESPIRATION_MODIFIER.WHITE
    energyNeeded += this.colors[Constants.COLORS.GREY] * Constants.RESPIRATION_MODIFIER.GREY
    energyNeeded += this.colors[Constants.COLORS.BLUE] * Constants.RESPIRATION_MODIFIER.BLUE

    this.gameWorld.oxygenToCarbonDioxide(Utils.ensureBetween(0, this.energy, energyNeeded))
    this.energy -= energyNeeded
  }

  Cell.prototype.movement = function() {

  }

  // dead
  //
  // Returns whether to cell is dead or not.
  // It's dead if it has 0 or less energy.
  Cell.prototype.dead = function() {
    return this.energy <= Constants.DEATH_THRESHOLD
  }

  // reproduction
  //
  // Checks whether the cell has more energy than the reproductionCost multiplied
  // by the amount of children in each litter, if it does it reproduces.
  Cell.prototype.reproduction = function() {
    if(this.energy > (this.reproductionCost * this.childrenCount())) {
      this.reproduce()
    }
  }

  // reproduce
  //
  // Creates children and takes energy away from cell equivalent to cost of
  // creating them.
  Cell.prototype.reproduce = function() {
    var child;
    this.energy -= this.reproductionCost * this.childrenCount()
    for(var i = 0; i < this.childrenCount(); i++) {
      child = this.createChild()
      this.gameWorld.addCell(child)
    }
    Logger.log(`${this.ID} has given birth to ${i} children`)
  }

  Cell.prototype.childrenCount = function() {
    return (
      Utils.ensureBetween(
        Constants.MINIMUM_CHILDREN,
        Constants.MAXIMUM_CHILDREN,
        this.colors[Constants.COLORS.YELLOW])
    )
  }

  // createChild
  //
  // Clones the current cell, mutates the clone, and returns it.
  Cell.prototype.createChild = function() {
    var newCell = this.clone()
    newCell.mutate()
    return newCell
  }

  // clone
  //
  // Produces an exact copy of the current cell, replaces branch
  // of clone with copies to prevent sharing the same branch object.
  Cell.prototype.clone = function() {
    var newCell = new Cell(this.clonedOptions())
    return newCell
  }

  Cell.prototype.clonedOptions = function() {
    return {
      gameWorld: this.gameWorld,
      energy: (this.reproductionCost - Constants.STARTING_ENERGY_FOR_CELLS) / this.childrenCount(),
      split: this.split,
      branch: this.branch.clone(),
      x: false,
      y: false,
    }
  }

  // mutate
  //
  // Recursively mutates cell's branches.
  Cell.prototype.mutate = function() {
    this.branch.mutate()
  }

  return Cell
})