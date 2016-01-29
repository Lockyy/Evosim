//
// js/services/Logger.js
//
// Log info to the sidebar
//

define([
  'underscore',
  'services/utils',
], function(_, Utils) {
  return {

    log: _.throttle(function log(string) {
      clearTimeout(window.logFadeTimeout)
      outputWindow = $('.output')
      outputWindow.fadeIn(200)
      outputWindow.append($("<div>" + string + "</div>"))
      outputWindow[0].scrollTop = outputWindow[0].scrollHeight
      window.logFadeTimeout = setTimeout(function () {
        $('.output').fadeOut(300)
      }, 1000)
    }, 5),

    updateStats: _.throttle(function updateStats(gameWorld) {
      var stats = {
        Time: Utils.ticksToAge(gameWorld.age),
        CO2: gameWorld.CO2.toFixed(2),
        O2: gameWorld.O2.toFixed(2),
        'Total Cells': gameWorld.list.length,
      }
      var output = "<span class='world'>"
      _.each(stats, function(value, key) {
        output += `<span>${key}: ${value}</span>`
      })
      output += '</span>'

      if(gameWorld.focusedCell) {
        output += "<span class='cell'>"
        var cell = gameWorld.focusedCell
        var cellStats = {
          ID: cell.ID,
          Age: Utils.ticksToAge(cell.age),
          Energy: Math.floor(cell.energy),
          'Reproduction Cost': Math.ceil(cell.reproductionCost * cell.childrenCount()),
        }

        _.each(cellStats, function(value, key) {
          output += `<span>${key}: ${value}</span>`
        })
        output += '</span>'
      }

      $('.info-bar').html(output)
    }, 50),
  }
})