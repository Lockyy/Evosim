class Main

  constructor: ->
    window.cellList = new CellList
    for i in [0..1]
      window.cellList.createCell()
  
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
  window.maxLogicFPS = 15
  window.tickSpeed = 1000 / window.maxLogicFPS
  window.canvas = $('#gameCanvas')[0]
  window.context = canvas.getContext("2d")
  window.canvas.width = 1000
  window.canvas.height = 800
  window.context.fillStyle = 'black'
  main = new Main
  main.startGame()