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
], function(_, Physics, Branch, Utils, Logger){

  function Cell(cellList) {
    this.cellList = cellList

    this.createSelf()

    this.startingEnergy = 10

    this.energy = this.startingEnergy
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
    this.colorTimer = 10
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
  Cell.prototype.createSelf = function() {
    this.split = Math.ceil(Math.random() * 6)
    this.branch = new Branch(this, 0)

    this.body = this.createPhysicsBody()
    this.createRects()

    window.world.add(this.body)
  }

  // createPhysicsBody
  //
  // Creates and returns PhysicsJS body
  Cell.prototype.createPhysicsBody = function() {
    return Physics.body('compound', {
      x: Math.random() * window.width,
      y: Math.random() * window.height,
      vx: 0.2,
      vy: 0.2,
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
    this.energyTick()
    this.reproduction()
  }

  // energyTick
  //
  // Manages energy production of cell
  // Currently just done using Math.random()
  Cell.prototype.energyTick = function() {
    if(Math.random() > 0.9) {
      this.energy++
    }
    if(Math.random() < 0.1) {
      this.energy--
    }
  }

  // dead
  //
  // Returns whether to cell is dead or not.
  // It's dead if it has 0 or less energy.
  Cell.prototype.dead = function() {
    return this.energy <= 0
  }

  // reproduction
  //
  // Checks whether the cell has more energy than the reproductionCost multiplied
  // by the amount of children in each litter, if it does it reproduces.
  Cell.prototype.reproduction = function() {
    if(this.energy > (this.reproductionCost() * this.childrenCount())) {
      this.reproduce()
    }
  }

  // reproduce
  //
  // Creates children and takes energy away from cell equivalent to cost of
  // creating them.
  Cell.prototype.reproduce = function() {
    this.energy -= (this.reproductionCost * this.childrenCount())
    _.each(new Array(this.childrenCount()), function() {
      child = this.createChild()
      this.cellList.addCell(child)
    })
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
    var newCell = $.extend(true, new Cell, this)
    newCell.replaceBranchWithCopy()
    return newCell
  }

  // replaceBranchWithCopy
  //
  // Recursively replaces branches with deep copies using $.extend
  // Used to ensure that cell doesn't share branch objects with it's parent.
  Cell.prototype.replaceBranchWithCopy = function() {
    var newBranch = $.extend(true, new Branch, this.branch)
    newBranch.replaceBranchWithCopy()
    this.branch = newBranch
  }

  // mutate
  //
  // Recursively mutates cell's branches. Each branch has a chance to mutate of
  // 0.5
  // Currently mutation just consists of completely replacing the branch.
  // TODO: Increase complexity of mutation to allow mutations of specific
  //       attributes
  Cell.prototype.mutate = function() {
    if(Math.random() > 0.5) {
      this.branch = new Branch(this, this.branch.depth, this.branch.branch)
    }
    this.branch.mutate()
  }

  return Cell
})