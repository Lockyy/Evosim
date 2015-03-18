class window.Branch
  
  constructor: (cell) ->
    @cell = cell

    @length = 10

    @color = _.sample(['green', 'red', 'blue', 'cyan', 'grey', 'white'], 1)[0]

    @offset = Math.floor(Math.random() * 180 - 180)

    if Math.random() > 0.5
      @branch = new window.Branch(@cell)

    @split = _.sample([1,3,4,5,6], 1)[0]

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
  # These functions need refactoring

  # Checks for whether the branch this is called on is colliding with a given cell at any point
  # Takes in the origin of this branch, it's angle and the target cell.
  checkForCollision: (xStart, yStart, angle, cell, BranchID) ->
    # Iterate through all the different splits of the given branch
    for i in [0...@split]
      # Calculate the rotation of the current split
      rotation = (360 / @split) * i + angle + @offset

      # Get the end co-ordinates of the split
      [xEnd, yEnd] = @getEndCoordinates(xStart, yStart, rotation)

      # Pass the co-ordinates of this branch through to the other cell to check whether it collides at any point
      collisionBranch = cell.branch.checkForBranchCollision(cell.xPosition, cell.yPosition, cell.orientation, xStart, xEnd, yStart, yEnd, 1)

      # If the other cell passed back a collision branch, return it and the current branch back to the caller
      if collisionBranch
        #console.log collisionBranch.cell.ID
        #console.log @.cell.ID
        return [collisionBranch, @]
      # If there was no collision we need to recursively check the branch attached to the end of this split of the current branch
      else
        # If there is no branch at the end, move onto the next split for this branch 
        if @branch == undefined
          #console.log 'hit last branch of main cell'
          continue
        # If there is a branch then call this function on that branch with the end point of this split
        else
          collisionBranch = @branch.checkForCollision(xEnd, yEnd, rotation, cell, BranchID + 1)
          # If there is a collision pass it back
          if collisionBranch
            return collisionBranch
          # If not, move onto the next split
          else
            continue

    # If we've not exited by now then there is no split on this branch or any sub-branch of it, return false
    return false

  # Take in the start and end co-ords of a line and check whether any of the splits for this branch collide with it
  checkForBranchCollision: (xStart, yStart, angle, otherXStart, otherXEnd, otherYStart, otherYEnd, BranchID) ->
    # Iterate through all the splits for this branch
    for i in [0...@split]
      # Calculate the rotation for this branch
      rotation = (360 / @split) * i + angle + @offset

      # Get the end co-ordinates for this branch
      [xEnd, yEnd] = @getEndCoordinates(xStart, yStart, rotation)

      # Check whether there is a collision between the line formed by the current split and the line passed into the function
      collision = @checkForLineCollision(xStart, yStart, xEnd, yEnd, otherXStart, otherYStart, otherXEnd, otherYEnd)

      # If there is a collision then we pass the current branch back
      if collision
        return @
      # If there is not then we need to recursively check the branch attached to the end of this branch split
      else
        # If there is no branch attached to the end of this one, move to the next split for the current branch
        if @branch == undefined
          continue
        # If there is a branch attached to the end of this current branch then pass the end of this branch 
        # and the co-ordinates of the line being checked to the function we are in on that branch
        else
          collisionBranch = @branch.checkForBranchCollision(xEnd, yEnd, rotation, otherXStart, otherXEnd, otherYStart, otherYEnd, BranchID + 1)
          # If there is a collision then pass it back
          if collisionBranch
            return collisionBranch
          # Otherwise move onto the next split
          else
            continue

    # If we've not exited by now then there is no split on this branch or any sub-branch of it, return false
    return false

  # Checks for a collision between (a,b) -> (c,d) and (p,q) -> (r,s)
  # Credit to http://stackoverflow.com/a/24392281
  checkForLineCollision: (a,b,c,d,p,q,r,s) ->
    det = (c - a) * (s - q) - (r - p) * (d - b)
    if det == 0
      return false
    else
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)

  # Take in the starting co-ordinates of a line and it's direction
  # Use the branches length to calculate it's end co-ordinates
  getEndCoordinates: (xStart, yStart, rotation) ->
    xDelta = (Math.sin(rotation * (Math.PI / 180)) * @length)
    xEnd = xStart + xDelta

    yDelta = (Math.cos(rotation * (Math.PI / 180)) * @length)
    yEnd = yStart + yDelta

    return [xEnd, yEnd]