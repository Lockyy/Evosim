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
], function(_, Physics, Branch){

  function Cell(cellList) {
    this.cellList = cellList

    this.createSelf()

    this.startingEnergy = 10

    this.energy = this.startingEnergy
  }

  // createSelf
  //
  // Creates the current cell from scratch and adds it to the world
  Cell.prototype.createSelf = function() {
    this.split = Math.ceil(Math.random() * 6)
    this.branch = new Branch(this)

    this.rects = this.createRects()
    this.body = this.createBody(rects)

    window.world.add(this.body)
  }

  // createBody
  //
  // Creates and returns PhysicsJS body
  Cell.prototype.createBody = function(rects) {
    return Physics.body('compound', {
      x: Math.random() * window.width,
      y: Math.random() * window.height,
      vx: 0.02,
      vy: 0.02,
      children: rects,
    })
  }

  // addRectToBody
  //
  // Adds a rectangle (typically created by a branch) to the body for use
  // in PhysicsJS collision detection.
  Cell.prototype.addRectToBody = function(rect) {
    this.body.children.push(rect)
  }

  Cell.prototype.createRects = function() {
    _this = this
    rects = []
    xEnd = yEnd = 0
    _.each(new Array(this.split), function(i) {
      i++
      branch = _this.branch
      angle = (360 / i) * _this.split
      while(branch != undefined) {
        angle += branch.offset
        x = xEnd
        y = yEnd
        rect = Physics.body('rectangle', {
          x: x,
          y: y,
          height: branch.length,
          width: 1,
          angle: angle,
          styles: {
            fillStyle: 'red',
            lineWidth: 0,
          },
        });
        rects.push(rect);
        branch = branch.branch
      }
    })

    return rects
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
    newCell = this.clone()
    newCell.mutate()
    return newCell
  }

  // clone
  //
  // Produces an exact copy of the current cell, replaces branch
  // of clone with copies to prevent sharing the same branch object.
  Cell.prototype.clone = function() {
    newCell = $.extend(true, new Cell, this)
    newCell.replaceBranchWithCopy()
    return newCell
  }

  // replaceBranchWithCopy
  //
  // Recursively replaces branches with deep copies using $.extend
  // Used to ensure that cell doesn't share branch objects with it's parent.
  Cell.prototype.replaceBranchWithCopy = function() {
    newBranch = $.extend(true, new Branch, this.branch)
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
      this.branch = new Branch(this, this.branch.branch)
    }
    this.branch.mutate()
  }

  return Cell
})