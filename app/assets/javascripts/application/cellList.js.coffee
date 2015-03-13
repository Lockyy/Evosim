class window.CellList
  
  constructor: ->
    @list = []

    @latestID = 0

  toArray: ->
    return @list

  createCells: (quantity) ->
    for i in [0..(quantity - 1)]
      newCell = new window.Cell()
      @addCell(newCell)

  addCell: (cell) ->
    @list.push(cell)

    cell.ID = @latestID
    @latestID = @latestID + 1

    return cell

  removeCell: (cellToRemove) ->
    cellToRemoveID = cellToRemove.ID
    lastIndex = @list.length - 1
    for i in [lastIndex..0]
      if @list[i] != undefined && @list[i].ID == cellToRemoveID
        delete @list[i]

  removeDead: ->
    lastIndex = @list.length - 1
    for i in [lastIndex..0]
      if @list[i] != undefined && @list[i].dead()
        window.log(@list[i].ID + ' has died')
        @removeCell(@list[i])

  getPossibleCollisions: (x, y, range, id) ->
    possibleCollisions = []

    lastIndex = @list.length - 1

    for i in [0..lastIndex]
      currentCell = @list[i]
      
      currentCellMaxLength = currentCell.calculateMaximumPossibleWidth()

      if currentCell.ID == id
        continue

      # Checks whether a line with length 'maxLength' and center co-ordinates 'center'
      # collides with two co-ordinates
      pointWithinRadius = (center, maxLength, min, max) ->
        startOfLine = center - maxLength
        endOfLine = center + maxLength
        # If the upper bounded position of currentCell is within
        # the bounds of the min and max bounds of the cell being checked
        endOfLine >= min && center + maxLength <= max ||
        # If the lower bounded position of currentCell is within
        # the bounds of the min and max bounds of the cell being checked
        startOfLine >= min && startOfLine <= max

      if pointWithinRadius(currentCell.xPosition, currentCellMaxLength, (x - range), (x + range))
        if pointWithinRadius(currentCell.yPosition, currentCellMaxLength, (y - range), (y + range))
          possibleCollisions.push(currentCell)

    return @list