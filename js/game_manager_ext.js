var OriginalGameManagerSetup = GameManager.prototype.setup;

GameManager.prototype.setup = function() {
	OriginalGameManagerSetup.apply(this, arguments);
	if (!GameManager._instance) {
		GameManager._instance = this;		
	}
	this.aiPlayFlag = false;
	this.events = {};	
	GridCompacted.init();
	
	this.on('start_ai_play', function() {
		document.querySelector(KeyboardInputManager.SELECTOR_AUTO_PLAY_BUTTON).innerHTML = KeyboardInputManager.BUTTON_TEXT_STOP;
	});
	this.on('stop_ai_play', function() {
		document.querySelector(KeyboardInputManager.SELECTOR_AUTO_PLAY_BUTTON).innerHTML = KeyboardInputManager.BUTTON_TEXT_AUTO_PLAY;		
	});	
}
	
GameManager.instance = function () {
	return GameManager._instance;
}

GameManager.prototype.getBestMove = function(algorithm) {
	var bestMove = -1;
	var startTime, endTime;
	
	switch (algorithm) {
		case 'em':
			startTime = new Date().getTime();		
			bestMove = AI_em.getBestMove(this.grid);
			endTime = new Date().getTime();
			break;
		case 'mc':
			AI_mc.optimizeMove = false;
			startTime = new Date().getTime();			
			bestMove = AI_mc.getBestMove(this.grid);
			endTime = new Date().getTime();
			break;
		case 'omc':
			AI_mc.optimizeMove = true;
			startTime = new Date().getTime();
			bestMove = AI_mc.getBestMove(this.grid);
			endTime = new Date().getTime();
			break;
		default:
			break;
	}
	console.log('search time: ' + (endTime - startTime));	
	return bestMove;
}

GameManager.prototype.aiPlayNextMove = function(algorithm) {
	if (this.aiPlayFlag) {
		var bestMove = this.getBestMove(algorithm);

		if (0 <= bestMove) {
			this.move(bestMove);	  
		}
		else {
			// eat the last empty cell, even no sense 
			if (this.grid.cellsAvailable()) {
				for (var direction=0; direction<4; ++direction) {
					GameManager.instance().move(direction);
				}
			}
		}
		if (this.over) {
			this._setAIPlayFlag(false);
		}
		else {
			var self = this;
			setTimeout(function(){
				self.aiPlayNextMove(algorithm);
			}, 500);					
		}
		// clear hint content
		document.getElementById('hint').innerHTML = '';		
	}
}

GameManager.prototype._setAIPlayFlag = function(flag) {
	var oldFlag = this.aiPlayFlag;
	this.aiPlayFlag = flag;
	if (oldFlag != flag) {
		if (flag) {
			this.emit('start_ai_play');
		}
		else {
			this.emit('stop_ai_play');
		}
	}
}

GameManager.prototype.autoPlay = function(algorithm) {
	this._setAIPlayFlag(!this.aiPlayFlag);
	this.aiPlayNextMove(algorithm);
}

GameManager.prototype.moveGrid = function (grid, direction) {
  var originalGrid = this.grid;
  var self = this;
  var cell, tile;
   
  debug.log('## move grid, direction: ' + direction);
  grid.print('\n');
  this.grid = grid;
  
  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);
		} else {
          self.moveTile(tile, positions.farthest);			
		}
		if (!self.positionsEqual(cell, tile)) {
		  moved = true; // The tile moved from its original cell!
		}
      }
    });
  });
  grid.print();
  this.grid = originalGrid;
  //console.log('score1: ' + grid.score() + ', score2: ' + grid.toCompacted().score());
  return { moved: moved, score: grid.score() };
};

GameManager.prototype.addRandomTileInGrid = function(grid) {
	var originalGrid = this.grid;
	debug.log('## add random tile:');
	this.grid = grid;
	this.addRandomTile();
	this.grid = originalGrid;
	grid.print();
}

GameManager.prototype.movesAvailableOfGrid = function(grid) {
	var originalGrid = this.grid;
	var result = false;
	
	this.grid = grid;
	result = this.movesAvailable();
	this.grid = originalGrid;
	return result;
}

GameManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

GameManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};
