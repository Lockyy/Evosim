class window.Drawer

  drawLine: (xStart, yStart, angle, length, color) ->
    [xEnd, yEnd] = window.utils.getEndCoordinates(xStart, yStart, angle, length)

    window.context.beginPath()
    window.context.moveTo(xStart, yStart)
    window.context.lineTo(xEnd, yEnd)
    context.strokeStyle = color
    window.context.stroke()