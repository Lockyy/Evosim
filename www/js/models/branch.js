//
// js/models/cell.js
//
// A Cell represents one organism in the game. On creation it generates a Body
// and adds it to the World for rendering and physics handling. The Cell object
// handles game logic such as actions to take after a collision and reproduction.
//

define([
  'underscore',
], function(_){

  function Branch(cell, depth, branch) {
    this.cell = cell
    this.length = Math.random() * 15
    this.color = _.sample(['green', 'red', 'blue', 'cyan', 'white', 'yellow'], 1)[0]
    this.offset = Math.floor(Math.random() * 180)
    this.rects = []

    this.branch = branch
    if(this.branch == undefined && Math.random() > 0.5) {
      this.branch = new Branch(this.cell, depth + 1)
    }
  }

  Branch.prototype.replaceBranchWithCopy = function() {
    if(this.branch != undefined) {
      newBranch = $.extend(true, new Branch, this.branch)
      newBranch.replaceBranchWithCopy()
      this.branch = newBranch
    }
  }

  Branch.prototype.mutate = function() {
    if(Math.random() > 0.9) {
      this.branch = new Branch(this.cell, this.branch)
    }
    if(this.branch != undefined) {
      this.branch.mutate()
    }
  }

  Branch.prototype.setRectColors = function(color, supressGeometryReset) {
    if(supressGeometryReset == undefined) { var supressGeometryReset = false }

    _.each(this.rects, function(rect) {
      newStyles = $.extend({}, rect.styles)
      newStyles.fillStyle = color
      rect.options({styles: newStyles})
    })

    if(!supressGeometryReset) {
      this.cell.body.refreshGeometry()
    }
  }

  Branch.prototype.setRectColorsRecursive = function(color) {
    this.setRectColors(color, true)
    if(this.branch != undefined) {
      this.branch.setRectColorsRecursive(color, true)
    }

    this.cell.body.refreshGeometry()
  }

  Branch.prototype.resetColor = function() {
    this.setRectColors(this.color)
  }

  Branch.prototype.resetColorRecursive = function() {
    this.resetColor()
    if(this.branch != undefined) {
      this.branch.resetColorRecursive()
    }
  }

  Branch.prototype.offensive = function() {
    return _.indexOf(['red', 'white', 'grey'], this.color) > -1
  }

  Branch.prototype.defensive = function() {
    return _.indexOf(['blue'], this.color) > -1
  }

  Branch.prototype.applyEffect = function(targetCell) {
    return true
  }

  return Branch
})