class window.Branch
  
  constructor: ->
    @length = 10

    @color = _.sample(['green', 'red', 'blue', 'cyan', 'grey', 'white'], 1)[0]

    @offset = Math.floor(Math.random() * 180 - 180)

    if Math.random() > 0.9
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