var OriginalGameManagerSetup = GameManager.prototype.setup;

GameManager.aiMoveInterval = 500;

GameManager.prototype.setup = function() {
	if (!GameManager._instance) {
		GameManager._instance = this;		
	}
	this._setAiPlaying(false);
	this.actuator.updateHintDirection('');		
	
	OriginalGameManagerSetup.apply(this, arguments);		
	if (!this.setupCalled) {
		this.inputManager.on('autoPlay', this.autoPlay.bind(this));
		this.inputManager.on('showHint', this.showHint.bind(this));
		this.inputManager.on('helperArrowDown', this.helperArrowDown.bind(this));
		this.inputManager.on('helperArrowUp', this.helperArrowUp.bind(this));
		this.inputManager.on('confirmYes', this.confirmYes.bind(this));
		this.inputManager.on('confirmNo', this.confirmNo.bind(this));		
		GridCompacted.init();			
		this.setupCalled = true;
	} 
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
	if (this.aiPlaying) {
		var bestMove = this.getBestMove(algorithm);

		if (0 <= bestMove) {
			this.move(bestMove);	  
		}
		else {
			// do the last try, even no sense 
			if (this.movesAvailable()) {
				for (var direction=0; direction<4; ++direction) {
					GameManager.instance().move(direction);
				}
			}
		}
		if (this.over) {
			this._setAiPlaying(false);
		}
		else {
			var self = this;
			setTimeout(function(){
				self.aiPlayNextMove(algorithm);
			}, GameManager.aiMoveInterval);					
		}
		// clear hint content
		this.actuator.updateHintDirection('');
	}
}

GameManager.prototype._setAiPlaying = function(aiPlaying) {
	this.aiPlaying = aiPlaying;
	this.actuator.updateAutoPlayButtonText(this.aiPlaying);	
}

GameManager.prototype.autoPlay = function(algorithm) {
	this._setAiPlaying(!this.aiPlaying);
	this.aiPlayNextMove(algorithm);
}

GameManager.prototype.showHint = function(algorithm) {
	this.actuator.updateHintDirection(this.getBestMove(algorithm));
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

GameManager.prototype.helperArrowDown = function() {
	this.actuator.showTopHelperContainer(false);
	this.actuator.showBottomHelperContainer(true);
}

GameManager.prototype.helperArrowUp = function() {
	this.actuator.showTopHelperContainer(true);
	this.actuator.showBottomHelperContainer(false);	
}

GameManager.prototype.realRestart = GameManager.prototype.restart;

GameManager.prototype.restart = function () {
	// only show confirm UI when score >= 500
	if (this.score >= 500) {
		if (this.aiPlaying) {
			this._setAiPlaying(false);
		}
		this.actuator.confirmRestartGame();		
	}
	else {
		this.realRestart();
	}
};

GameManager.prototype.confirmYes = function() {
	this.realRestart();
}

GameManager.prototype.confirmNo = function() {
	this.actuator.continueGame(); 
}

