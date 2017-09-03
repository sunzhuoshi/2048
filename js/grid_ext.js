Grid.prototype.transpose = function() {
	var newGrid = new Grid(this.size, null);
	
	for (var x=0; x<this.size; ++x) {
		for (var y=0; y<this.size; ++y) {
			newGrid.cells[x][y] = this.cells[y][x];
		}
	}
	return newGrid;
}

Grid.prototype.clone = function() {
	var serialized = this.serialize();
	return new Grid(serialized.size, serialized.cells);
}

Grid.prototype.insertTile = function (tile) {
  this.cells[tile.x][tile.y] = tile;
  return this;
};

Grid.prototype.print = function() {
	for (var y=0; y<4; ++y) {
		var rows = new Array(4);
		rows.fill(0);
		for (var x=0; x<4; ++x) {
			if (this.cells[x][y]) {
				rows[x] = this.cells[x][y].value;
			}
		}
		debug.log(y + ': ' + '\t' + rows[0] + '\t' + rows[1] + '\t' + rows[2] + '\t' + rows[3]);
	}
}

Grid.prototype.availableCells = function () {
  var cells = [];

  for (var y=0; y<4; ++y) {
	  for (var x=0; x<4; ++x) {
		  if (!this.cells[x][y]) {
			  cells.push({x: x, y: y});
		  }
	  }
  }
  return cells;
};

Grid.prototype.toCompacted = function() {
	var low = 0,
		high = 0;
		
	for (var y=0; y<=1; ++y) {
		for (var x=0; x<4; ++x) {
			var cell = this.cells[x][y];
			if (cell && cell.value) {
				low += Math.log2(cell.value) << ((y * 4 + x) * 4);
			}
		}
	}	
	for (var y=2; y<=3; ++y) {
		for (var x=0; x<4; ++x) {
			var cell = this.cells[x][y];
			if (cell && cell.value) {
				high += Math.log2(cell.value) << ((y * 4 + x) * 4);
			}			
		}
	}
	return new GridCompacted(low, high);
}

Grid.prototype.toCompactedString = function() {
	var compacted = this.toCompacted();
	return compacted.low.toString() + ':' + compacted.high.toString();
}