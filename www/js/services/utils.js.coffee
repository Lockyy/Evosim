class window.Utils

  constructor: ->
    @MAXSPEED = 15 # Max X and Y speed
    @MAXROTATIONSPEED = 15
    @TOLERANCE = 0.0000001 # Smaller numbers are considered equal to 0.
    @RUBBING = 0.98
    @ELASTICITY = 0.8

  # Ensures value is between min and max.
  # If value is greater than max, return max.
  # If value is less than min, return min.
  # Otherwise return value.
  ensureBetween: (min, max, value) ->
    return Math.max(Math.min(max, value), min);

  # Calculates the total speed of a cell given its x and y speeds
  calculateSpeed: (x, y) ->
    return Math.sqrt((x * x) + (y * y))

  # Calculates the angle (in degrees) that the cell is moving given
  # its x and y speeds
  calculateAngle: (x, y) ->
    angle = Math.atan2(x, y) * window.rad2deg
    if angle < 0
      return 360 + angle
    return angle

  # Calculate end co-ordinates of a line
  #
  # Input:
  #   x: x co-ordinate of line start point
  #   y: y co-ordinate of line start point
  #   angle: angle of the line, with 0 pointing directly down
  #   length: length of the line
  #
  # Output:
  #   [xEnd, yEnd]: End co-ordinates of the line
  getEndCoordinates: (xStart, yStart, angle, length) ->
    xDelta = (Math.cos(angle * (Math.PI / 180)) * length)
    xEnd = xStart + xDelta

    yDelta = (Math.sin(angle * (Math.PI / 180)) * length)
    yEnd = yStart + yDelta

    return [xEnd, yEnd]

  # Calculate whether two lines collide
  #
  # Input:
  #   a,b: x and y starting co-ordinates of line 1
  #   c,d: x and y end co-ordinates of line 1
  #   p,q: x and y starting co-ordinates of line 2
  #   r,s: x and y end co-ordinates of line 2
  #
  # Output:
  #   Boolean: Whether the two lines collide
  #
  # Credit to http://stackoverflow.com/a/24392281
  checkForLineCollision: (a,b,c,d,p,q,r,s) ->
    det = (c - a) * (s - q) - (r - p) * (d - b)
    if det == 0
      return false
    else
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)

  deg2rad: (deg) ->
    deg * (Math.PI / 180)

  rad2deg: (rad) ->
    rad * (180 / Math.PI)