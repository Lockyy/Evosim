//
// js/models/cell.js
//
// A Cell represents one organism in the game. On creation it generates a Body
// and adds it to the World for rendering and physics handling. The Cell object
// handles game logic such as actions to take after a collision and reproduction.
//

define([
  'underscore',
  'services/utils',
  'services/constants',
], function(_, Utils, Constants){

  function Branch(cell, depth, branch) {
    this.cell = cell
    this.length = Math.random() * Constants.MAX_BRANCH_LENGTH
    this.color = _.sample(_.map(Constants.COLORS, function(val) { return val }), 1)[0]
    this.offset = Utils.randPlusOrMinus(Constants.MAX_BRANCH_OFFSET)
    this.rects = []

    this.branch = branch
    if(this.branch == undefined && Math.random() <= Constants.BRANCH_CHANCE) {
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
    if(Math.random() < Constants.MUTATION_CHANCE) {
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
    return _.indexOf([
      Constants.COLORS.RED,
      Constants.COLORS.GREY,
      Constants.COLORS.WHITE,
    ], this.color) > -1
  }

  Branch.prototype.defensive = function() {
    return _.indexOf([
      Constants.COLORS.BLUE,
    ], this.color) > -1
  }

  Branch.prototype.applyEffect = function(targetCell) {
    return true
  }

  return Branch
})