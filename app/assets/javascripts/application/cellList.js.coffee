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