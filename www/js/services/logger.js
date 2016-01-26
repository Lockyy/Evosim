//
// js/services/Logger.js
//
// Log info to the sidebar
//

define([
  'underscore',
], {

  log: function log(string) {
    outputWindow = $('.output')
    outputWindow.show()
    outputWindow.append($('<div>' + string + '</div>'))
    outputWindow[0].scrollTop = outputWindow[0].scrollHeight
    $('.output').fadeOut(3000)
  },

})