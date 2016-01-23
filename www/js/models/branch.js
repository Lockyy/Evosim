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

  function Branch(cell, branch) {
    this.cell = cell
    this.length = 10
    this.color = _.sample(['green', 'red', 'blue', 'cyan', 'white', 'yellow'], 1)[0]
    this.offset = Math.floor(Math.random() * 180 - 180)
    this.rects = []

    this.branch = branch
    if(this.branch == undefined && Math.random() > 0.5) {
      this.branch = new Branch(this.cell)
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

  return Branch
})