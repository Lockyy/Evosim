class window.Cell
  
  constructor: ->
    @branch = new window.Branch(@)
  
    @xPosition = Math.random() * window.canvas.width
    @yPosition = Math.random() * window.canvas.height

    @startingHealth = 10

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

    xDelta = Math.sin(@orientation * (Math.PI / 180))
    yDelta = Math.cos(@orientation * (Math.PI / 180))

    @xPosition = @xPosition + xDelta
    @yPosition = @yPosition + yDelta

    if @xPosition > window.canvas.width || @xPosition < 0
      @xPosition = previousX
      @orientation = @orientation - 180

    if @yPosition > window.canvas.height || @yPosition < 0
      @yPosition = previousY
      @orientation = @orientation - 180

    collisionCell = @checkForCollisions()

    if collisionCell != undefined && collisionCell != false
      @xPosition = previousX
      @yPosition = previousY
      @orientation = @orientation - 180

  turn: (magnitude) ->
    @orientation = @orientation + (Math.random() * 2 * magnitude) - magnitude

  turnAwayFrom: (x, y) ->
    @orientation = Math.atan((x - @xPosition) / (y - @yPosition))
    @moveForwards

  randomiseOrientation: ->
    @orientation = Math.random() * 360

  incrementEnergy: ->
    if Math.random() > 0.9
      @health = @health + 1
    if Math.random() < 0.1
      @health = @health - 1

  dead: ->
    false
    #@health < 1

  reproduce: ->
    return false
    #if @health > @startingHealth + 5
    #  window.log(@ID + ' has reproduced')
    #  @health = @startingHealth
    #  window.cellList.addCell(@produceChild())

  produceChild: ->
    newCell = @copySelf()
    newCell.mutate()
    newCell.randomiseOrientation()

    return newCell

  copySelf: ->
    newCell = $.extend(true, new window.Cell, @)
    newCell.replaceBranchWithCopy()
    return newCell

  replaceBranchWithCopy: ->
    if @branch != undefined
      newBranch = $.extend(true, new window.Branch, @branch)
      newBranch.replaceBranchWithCopy()
      @branch = newBranch

  mutate: ->
    if Math.random() > 0.5
      @branch = new window.Branch
    @branch.mutate()

  checkForCollisions: ->
    maximumPossibleWidth = @calculateMaximumPossibleWidth()

    possibleCollisions = window.cellList.getPossibleCollisions(@xPosition, @yPosition, maximumPossibleWidth * 2, @ID)

    if possibleCollisions.length > 0
      for i in [0..(possibleCollisions.length - 1)]
        collision = @checkForCollisionWithCell(possibleCollisions[i])
        if collision
          return possibleCollisions[i]

  checkForCollisionWithCell: (cell) ->
    collision = @branch.checkForCollision(@xPosition, @yPosition, @orientation, cell, 0)

    if collision != false && collision != undefined
      return true

    return false


  calculateMaximumPossibleWidth: ->
    length = 0
    branch = @branch
    while branch != undefined
      length = length + branch.length
      branch = branch.branch

    return length