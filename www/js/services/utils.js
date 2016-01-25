//
// js/services/utils.js
//
// Holds small utility function
//

deg2rad = function deg2rad(degrees) {
  var radians = degrees * (Math.PI / 180)
  return radians
}

getEndCoordinates = function getEndCoordinates(xStart, yStart, angle, length) {
  var xDelta = (Math.sin(deg2rad(angle)) * length)
  var xEnd = xStart + xDelta

  var yDelta = (Math.cos(deg2rad(angle)) * length)
  var yEnd = yStart + yDelta

  return { x: xEnd, y: yEnd }
}

define([
  'underscore',
], {

  // Ensures value is between min and max.
  // If value is greater than max, return max.
  // If value is less than min, return min.
  // Otherwise return value.
  ensureBetween: function ensureBetween(min, max, value) {
    return Math.max(Math.min(max, value), min);
  },

  // Calculates the total speed of a cell given its x and y speeds
  calculateSpeed: function calculateSpeed(x, y) {
    return Math.sqrt((x * x) + (y * y))
  },

  // Calculates the angle (in degrees) that the cell is moving given
  // its x and y speeds
  calculateAngle: function calculateAngle(x, y) {
    var angle = Math.atan2(x, y) * window.rad2deg
    if(angle < 0) {
      return 360 + angle
    }
    return angle
  },

  // Calculate end co-ordinates of a line
  //
  // Input:
  //   x: x co-ordinate of line start point
  //   y: y co-ordinate of line start point
  //   angle: angle of the line
  //   length: length of the line
  //
  // Output:
  //   [xEnd, yEnd]: End co-ordinates of the line
  getEndCoordinates: getEndCoordinates,

  // In PhyicsJS a rectangle's position is it's center. However we want to place
  // it so that it's end touches a certain point. This converts that point into
  // the co-ordinates for the center of that rectangle.
  // By using the returned values for positioning the rectangle you will get a
  // rectangle that starts at (x, y) and goes 'length' pixels in the 'angle' direction.
  convertEndToCenter: function convertEndToCenter(x, y, angle, length) {
    return getEndCoordinates(x, y, angle, length / 2)
  },

  rad2deg: function rad2deg(radians) {
    var degrees = radians * (180 / Math.PI)
    return degrees
  },

  deg2rad: deg2rad,

  filledArray: function filledArray(length, val) {
    return Array.apply(null, Array(length)).map(function(){return val})
  }
})