class Main

  constructor: ->
    window.cellList = new CellList
    window.cellList.createCells(25)
  
  startGame: ->
    @iterateSimulation()
    setInterval(_.bind(@iterateSimulation, @), window.tickSpeed)

  iterateSimulation: ->
    window.cellList.removeDead()
    @moveCells()
    @drawCells()

  moveCells: ->
    _.each(window.cellList.toArray(), (cell) ->
      if cell != undefined
        cell.move()
        cell.incrementEnergy()
        cell.reproduce()
    )

  drawCells: ->
    window.context.fillRect(0, 0, canvas.width, canvas.height )
    _.each(window.cellList.toArray(), (cell) ->
      if cell != undefined
        cell.draw()
    )

$(document).ready ->
  window.log = (message) ->
    outputWindow = $('.output')
    outputWindow.append($('<div>' + message + '</div>'))
    outputWindow[0].scrollTop = outputWindow[0].scrollHeight

  window.maxLogicFPS = 30
  window.tickSpeed = 1000 / window.maxLogicFPS
  window.canvas = $('#gameCanvas')[0]
  window.context = canvas.getContext("2d")
  window.canvas.width = 1000
  window.canvas.height = 600
  window.context.fillStyle = 'black'
  main = new Main
  main.startGame()