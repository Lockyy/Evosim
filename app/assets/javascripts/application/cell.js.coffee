class window.Cell
  
  constructor: ->
    @branch = new window.Branch

    @branches = []
  
    @xPosition = Math.random() * window.canvas.width
    @yPosition = Math.random() * window.canvas.height

    @startingHealth = 15

    @health = @startingHealth

    @randomiseOrientation()

  draw: ->
    @branch.draw(@xPosition, @yPosition, @orientation)

  move: ->
    @moveForwards()
    @turn(5)

  moveForwards: ->
    previousX = @xPosition
    previousY = @yPosition

    xDelta = (Math.sin(@orientation * (Math.PI / 180)) * 5)
    yDelta = (Math.cos(@orientation * (Math.PI / 180)) * 5)

    @xPosition = @xPosition + xDelta
    @yPosition = @yPosition + yDelta

    if @xPosition > window.canvas.width || @xPosition < 0
      @xPosition = previousX
      @orientation = @orientation - 180

    if @yPosition > window.canvas.height || @yPosition < 0
      @yPosition = previousY
      @orientation = @orientation - 180

  turn: (magnitude) ->
    if Math.random() > 0.8
      @orientation = @orientation + (Math.random() * 10 * magnitude) - 5 * magnitude

  randomiseOrientation: ->
    @orientation = Math.random() * 360

  incrementEnergy: ->
    if Math.random() > 0.9
      @health = @health + 1
    if Math.random() < 0.1
      @health = @health - 1

  dead: ->
    @health < 1

  reproduce: ->
    if @health > @startingHealth + 5
      @health = @startingHealth
      window.cellList.addCell(@produceChild())

  produceChild: ->
    console.log @.ID + ' has given birth'
    newCell = $.extend({}, @)
    newCell.mutate()
    newCell.randomiseOrientation()

    return newCell

  mutate: ->
    if Math.random() > 0.5
      @branch = new window.Branch
    @branch.mutate()