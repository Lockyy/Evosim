class window.Branch
  
  constructor: ->
    @length = 10

    @color = _.sample(['green', 'red', 'blue', 'cyan', 'grey', 'white'], 1)[0]

    @offset = Math.floor(Math.random() * 180 - 180)

    if Math.random() > 0.9
      @branch = new Branch

    @split = _.sample([1,2,3,4,5,6], 1)[0]

  # Drawing

  draw: (xStart, yStart, angle) ->
    for i in [0...@split]
      rotation = (360 / @split) * i + angle + @offset

      [xEnd, yEnd] = @getEndCoordinates(xStart, yStart, rotation)

      window.context.beginPath()
      window.context.moveTo(xStart, yStart)
      window.context.lineTo(xEnd, yEnd)
      context.strokeStyle = @color
      window.context.stroke()

      if @branch
        @branch.draw(xEnd, yEnd, rotation)

  getEndCoordinates: (xStart, yStart, rotation) ->
    xDelta = (Math.sin(rotation * (Math.PI / 180)) * @length)
    xEnd = xStart + xDelta

    yDelta = (Math.cos(rotation * (Math.PI / 180)) * @length)
    yEnd = yStart + yDelta

    return [xEnd, yEnd]

  # Reproduction

  replaceBranchWithCopy: ->
    if @branch != undefined
      newBranch = $.extend(true, new window.Branch, @branch)
      newBranch.replaceBranchWithCopy()
      @branch = newBranch

  mutate: ->
    if Math.random() > 0.9
      @branch = new Branch
    if @branch
      @branch.mutate()

  # Collision Detection

  checkForBranchCollision: (xStart, yStart, angle, cell) ->
    for i in [0...@split]
      rotation = (360 / @split) * i + angle + @offset

      [xEnd, yEnd] = @getEndCoordinates(xStart, yStart, rotation)

      collisionBranch = cell.branch.checkForCollision(cell.xPosition, cell.yPosition, cell.orientation, xStart, xEnd, yStart, yEnd)

      if collisionBranch
        @color = 'yellow'
        return [collisionBranch, @]
      else
        if @branch == undefined
          return false
        else
          @branch.checkForBranchCollision(xEnd, yEnd, rotation, cell)

  checkForCollision: (xStart, yStart, angle, otherXStart, otherXEnd, otherYStart, otherYEnd) ->
    for i in [0...@split]
      rotation = (360 / @split) * i + angle + @offset

      [xEnd, yEnd] = @getEndCoordinates(xStart, yStart, rotation)

      collision = @checkForLineCollision(xStart, yStart, xEnd, yEnd, otherXStart, otherYStart, otherXEnd, otherYEnd)

      if collision
        @color = 'yellow'
        return @
      else
        if @branch != undefined
          return @branch.checkForCollision(xEnd, yEnd, rotation, otherXStart, otherXEnd, otherYStart, otherYEnd)
        else
          return false

  checkForLineCollision: (a,b,c,d,p,q,r,s) ->
    det = (c - a) * (s - q) - (r - p) * (d - b)
    if det == 0
      return false
    else
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)