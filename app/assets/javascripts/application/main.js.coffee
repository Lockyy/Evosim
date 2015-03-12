class Branch
  
  constructor: ->
    @length = 10

    @color = _.sample(['green', 'red', 'blue', 'cyan', 'grey', 'white'], 1)[0]

    @offset = Math.floor(Math.random() * 180 - 180)

    if Math.random() > 0.5
      @branch = new Branch

    @split = _.sample([1,2,3,4,5,6], 1)[0]

  draw: (xStart, yStart, angle) ->
    for i in [0...@split]
      rotation = (360 / @split) * i + angle + @offset

      xDelta = (Math.sin(rotation * (Math.PI / 180)) * @length)
      xEnd = xStart + xDelta

      yDelta = (Math.cos(rotation* (Math.PI / 180)) * @length)
      yEnd = yStart + yDelta

      window.context.beginPath()
      window.context.moveTo(xStart, yStart)
      window.context.lineTo(xEnd, yEnd)
      context.strokeStyle = @color
      window.context.stroke()

      if @branch
        @branch.draw(xEnd, yEnd, rotation)

class Cell
  
  constructor: ->
    @branch = new Branch

    @branches = []
  
    @xPosition = Math.random() * window.canvas.width
    @yPosition = Math.random() * window.canvas.height

    @startingHealth = 5

    @health = @startingHealth

    @orientation = 0

  draw: ->
    @branch.draw(@xPosition, @yPosition, @orientation)

  move: ->
    @moveForwards()
    @turn()

  moveForwards: ->
    previousX = @xPosition
    previousY = @yPosition

    @xPosition = @xPosition + Math.random() * 10 - 5
    @yPosition = @yPosition + Math.random() * 10 - 5

    if @xPosition > window.canvas.width || @xPosition < 0
      @xPosition = previousX

    if @yPosition > window.canvas.height || @yPosition < 0
      @yPosition = previousY

  turn: ->
    @orientation = @orientation + (Math.random() * 10) - 5


class Main

  constructor: ->
    @cells = [new Cell]
  
  startGame: ->
    @iterateSimulation()
    setInterval(_.bind(@iterateSimulation, @), window.tickSpeed)

  iterateSimulation: ->
    @drawCells()
    @moveCells()

  moveCells: ->
    _.each(@cells, (cell) ->
      cell.move()
    )

  drawCells: ->
    window.context.fillRect(0, 0, canvas.width, canvas.height )
    _.each(@cells, (cell) ->
      cell.draw()
    )

$(document).ready ->
  window.maxLogicFPS = 30
  window.tickSpeed = 1000 / window.maxLogicFPS
  window.canvas = $('#gameCanvas')[0]
  window.context = canvas.getContext("2d")
  window.canvas.width = 1000
  window.canvas.height = 800
  window.context.fillStyle = 'black'
  main = new Main
  main.startGame()