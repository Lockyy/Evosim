//
// js/models/gameWorld.js
//
// A GameWorld holds the game's Cells, these are separate objects to the
// World's Bodys, although the game's Cells are physically represented in the
// World by their corresponding Bodys.
//

define([
  'underscore',
  'models/cell',
  'services/constants',
], function(_, Cell, Constants){

  function GameWorld(length) {
    this.age = 0
    this.list = [];
    this.latestID = 1;
    this.createCells(length)
    this.CO2 = Constants.INITIAL_CO2
    this.O2 = Constants.INITIAL_O2
  }

  GameWorld.prototype.carbonDioxideToOxygen = function(amount) {
    if(this.CO2 < amount) {
      return false
    }

    this.CO2 -= amount
    this.O2 += amount
  }

  GameWorld.prototype.oxygenToCarbonDioxide = function(amount) {
    if(this.O2 < amount) {
      return false
    }

    this.O2 -= amount
    this.CO2 += amount
  }

  GameWorld.prototype.toArray = function() {
    return this.list;
  }

  GameWorld.prototype.createCells = function(quantity) {
    for(i = 0; i < quantity; i++) {
      newCell = new Cell({ gameWorld: this });
      this.addCell(newCell);
    }
  }

  GameWorld.prototype.addCell = function(cell) {
    this.list.push(cell);
    cell.ID = this.latestID++;
    return cell;
  }

  GameWorld.prototype.removeCell = function(cellToRemove) {
    cellToRemoveID = cellToRemove.ID;
    this.list = _.reject(this.list, function(cell) {
      return cell.id == cellToRemove.ID;
    })
  }

  GameWorld.prototype.removeDead = function() {
    deadCells = []
    this.list = _.reject(this.list, function(cell) {
      dead = cell.dead();
      if(dead) {
        deadCells.push(cell);
      }
      return dead;
    }.bind(this))
  }

  return GameWorld
})