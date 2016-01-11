class window.Utils

  maxSpeed = 15

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
