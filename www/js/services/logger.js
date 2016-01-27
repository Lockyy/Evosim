//
// js/services/Logger.js
//
// Log info to the sidebar
//

define([
  'underscore',
], {

  log: _.throttle(function log(string) {
    clearTimeout(window.logFadeTimeout)
    outputWindow = $('.output')
    outputWindow.fadeIn(200)
    outputWindow.append($("<div>" + string + "</div>"))
    outputWindow[0].scrollTop = outputWindow[0].scrollHeight
    window.logFadeTimeout = setTimeout(function () {
      $('.output').fadeOut(300)
    }, 1000)
  }, 1000),

})