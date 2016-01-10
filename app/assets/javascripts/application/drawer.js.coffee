class window.Drawer

  drawLine: (xStart, yStart, angle, length, color) ->
    [xEnd, yEnd] = @getEndCoordinates(xStart, yStart, angle, length)

    window.context.beginPath()
    window.context.moveTo(xStart, yStart)
    window.context.lineTo(xEnd, yEnd)
    context.strokeStyle = color
    window.context.stroke()

  getEndCoordinates: (xStart, yStart, angle, length) ->
    xDelta = (Math.sin(angle * window.deg2rad) * length)
    xEnd = xStart + xDelta

    yDelta = (Math.cos(angle * window.deg2rad) * length)
    yEnd = yStart + yDelta

    return [xEnd, yEnd]