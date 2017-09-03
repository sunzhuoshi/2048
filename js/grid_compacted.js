function GridCompacted(low, high) {
	this.low = low? low: 0; // 32 bits
	this.high = high? high: 0; // 32 bits
}

GridCompacted.prototype.clone = function() {
	return new GridCompacted(this.low, this.high);
}

GridCompacted.prototype.equal = function(other) {
	return this.low == other.low && this.high == other.high;
}

GridCompacted.prototype.toString = function() {
	return this.low.toString() + ':' + this.high.toString();
}

GridCompacted.prototype.emptyCount = function() {
	var result = 0,
		low = this.low,
		high = this.high;
	
	for (var i=0; i<8; ++i) {
		if (!((low >> (4 * i)) & 0xF)) {
			result ++;
		}
	}
	for (var i=0; i<8; ++i) {
		if (!((high >> (4 * i)) & 0xF)) {
			result ++;
		}
	}
	return result;
}

GridCompacted.prototype.xor = function(other) {
	this.low ^= other.low;
	this.high ^= other.high;
	return this;
}

// NOTE: shift: 0-32
GridCompacted.prototype.lshift = function(shift) {
	var low = this.low;
	
	this.low <<= shift;
	this.high <<= shift;
	this.high |= low >> (32 - shift);
	return this;
}

GridCompacted.prototype.getRow = function(index) {
	var row = 0;
	switch (index) {
		case 0:
			row = this.low & 0xFFFF;
			break;
		case 1:
			row = this.low >> 16 & 0xFFFF;
			break;
		case 2:
			row = this.high & 0xFFFF;
			break;
		case 3:
			row = this.high >> 16 & 0xFFFF;
			break;
		default:
			break;
	}
	return row;
}

GridCompacted.prototype.toGrid = function() {
	var grid = new Grid(4, null);
	var low = this.low;
	var high = this.high;
	
	for (var i=0; i<8; ++i) {
		var rank = low & 0xF;
		if (rank) {
			grid.insertTile(new Tile({x: i % 4, y: Math.floor(i / 4)}, Math.pow(2, rank)));			
		}
		low >>= 4;
	}

	for (var i=8; i<16; ++i) {
		var rank = high & 0xF ;
		if (rank) {
			grid.insertTile(new Tile({x: i % 4, y: Math.floor(i / 4)}, Math.pow(2, rank)));			
		}
		high >>= 4;
	}	
	return grid;
}

GridCompacted.prototype.transpose = function() {
	var array = new Array(16);
	var transArray = new Array(16);
	var result = new GridCompacted();
	var low = this.low;
	var high = this.high;
	
	transArray.fill(0);
	for (var i=0; i<8; ++i) {
		array[i] = low & 0xF;
		low >>= 4;
	}
	for (var i=8; i<16; ++i) {
		array[i] = high & 0xF;
		high >>= 4;
	}
	for (var x=0; x<4; ++x) {
		for (var y=0; y<4; ++y) {
			transArray[x + y * 4] = array[x * 4 + y];
		}
	}
	
	for (var i=0; i<8; ++i) {
		result.low += transArray[i] << i * 4;
	}
	for (var i=8; i<16; ++i) {
		result.high += transArray[i] << (i - 8) * 4;
	}
	return result;	
}

// up
GridCompacted.prototype.move0 = function() {
	var result = this.clone();
	var trans = this.transpose();
	result.xor(GridCompacted.columnUpTable[trans.getRow(0)]);
	result.xor(GridCompacted.columnUpTable[trans.getRow(1)].clone().lshift(4));
	result.xor(GridCompacted.columnUpTable[trans.getRow(2)].clone().lshift(8));
	result.xor(GridCompacted.columnUpTable[trans.getRow(3)].clone().lshift(12));
	return result;
}

// right
GridCompacted.prototype.move1 = function() {
	var result = this.clone();
	result.xor(GridCompacted.fromRow(GridCompacted.rowRightTable[this.getRow(0)], 0));
	result.xor(GridCompacted.fromRow(GridCompacted.rowRightTable[this.getRow(1)], 1));
	result.xor(GridCompacted.fromRow(GridCompacted.rowRightTable[this.getRow(2)], 2));
	result.xor(GridCompacted.fromRow(GridCompacted.rowRightTable[this.getRow(3)], 3));	
	return result;
}

// down
GridCompacted.prototype.move2 = function() {
	var result = this.clone();
	var trans = this.transpose();		
	result.xor(GridCompacted.columnDownTable[trans.getRow(0)]);
	result.xor(GridCompacted.columnDownTable[trans.getRow(1)].clone().lshift(4));
	result.xor(GridCompacted.columnDownTable[trans.getRow(2)].clone().lshift(8));
	result.xor(GridCompacted.columnDownTable[trans.getRow(3)].clone().lshift(12));		
	return result;
}

// left
GridCompacted.prototype.move3 = function() {
	var result = this.clone();
	result.xor(GridCompacted.fromRow(GridCompacted.rowLeftTable[this.getRow(0)], 0));
	result.xor(GridCompacted.fromRow(GridCompacted.rowLeftTable[this.getRow(1)], 1));
	result.xor(GridCompacted.fromRow(GridCompacted.rowLeftTable[this.getRow(2)], 2));
	result.xor(GridCompacted.fromRow(GridCompacted.rowLeftTable[this.getRow(3)], 3));	
	return result;
}

GridCompacted.prototype.move = function(direction) {
	var result = this.clone();
	debug.log('>>>> ' + direction + ' <<<<');
	this.print();
	switch (direction) {
		case 0:
			result = this.move0();
			break;
		case 1:
			result = this.move1();
			break;
		case 2:
			result = this.move2();
			break;
		case 3:
			result = this.move3();
			break;
		default:
			break;
	}
	if (!result.equal(this)) {
		debug.log('');
		result.print();
	}
	debug.log('--------');
	return result;
}

GridCompacted.prototype.print = function() {
	this.toGrid().print();
}

GridCompacted.fromRow = function(row, index) {
	var low = 0, 
		high = 0;
	switch (index) {
		case 0:
			low = row;
			break;
		case 1:
			low = row << 16;
			break;
		case 2:
			high = row;
			break;
		case 3:
			high = row << 16;
			break;
		default:
			break;
	}	
	return new GridCompacted(low, high);
}


GridCompacted.unpackColumn = function(row) {
	var result = new GridCompacted();
	
	result.low  |= (row & 0x000F) << 0;
	result.low  |= (row & 0x00F0) << 12;
	result.high |= (row & 0x0F00) >> 8;
	result.high |= (row & 0xF000) << 4;
	return result;
}

GridCompacted.reverseRow = function(row) {
	return ((row >> 12) | ((row >> 4) & 0x00F0) | ((row << 4) & 0x0F00) | (row << 12)) & 0xFFFF;
}

GridCompacted.init = function() {
	this.heuristicScoreTable = [];
	this.rowLeftTable = [];
	this.rowRightTable = [];
	this.columnUpTable = [];
	this.columnDownTable = [];
	
	for (var row=0; row < 65536; ++row) {
		var line = [
			(row >> 0 ) & 0xF,
			(row >> 4 ) & 0xF,
			(row >> 8 ) & 0xF,
			(row >> 12) & 0xF
		];
		
		this.heuristicScoreTable[row] = AI.heuristicEvaluationRow(row);
		
		for (var i=0; i<3; ++i) {
			var j;
			for (j=i+1; j<4; ++j) {
				if (line[j] != 0) {
					break;
				}
			}
			if (j == 4) {
				break;
			}
			if (line[i] == 0) {
				line[i] = line[j];
				line[j] = 0;
				i--;
			}
			else if (line[i] == line[j]) {
				if (line[i] != 0xF) {
					line[i] ++;
				}
				line[j] = 0;
			}
		}
		var result = (line[0] << 0) | 
					(line[1] << 4) | 
					(line[2] << 8) | 
					(line[3] << 12);
		var reverseResult = this.reverseRow(result);
		var reverseRow = this.reverseRow(row);
		
		this.rowLeftTable	[row		] = row 						^ result;
		this.rowRightTable	[reverseRow	] = reverseRow 					^ reverseResult;
		this.columnUpTable	[row		] = this.unpackColumn(row).xor(this.unpackColumn(result));
		this.columnDownTable[reverseRow	] = this.unpackColumn(reverseRow).xor(this.unpackColumn(reverseResult));		
	}
}
