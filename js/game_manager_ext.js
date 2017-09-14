GameManager.AI_STEP_INTERVAL = 500;
GameManager.replayStepInterval = 500;

var GameReplay = function() {
	this.version = '1.0'; // WARNING: toFixed(1)
	this.sequences = '';
	this.reset = function() {
		this.sequences = '';
	}
	this.saveAddTile = function(cell, value) {
		var index = cell.y * GameManager.instance().grid.size + cell.x;
		this.sequences += 'a' + index;
		this.sequences += 'v' + value;
	}
	this.saveMove = function(direction) {
		this.sequences += 'm' + direction;
	}
	this.toUrlParameters = function() {
		return 'rv=' + this.version + '&rs=' + 'd' + this.sequences + 'b';
	}
	this.parse = function(replayVersion, replaySequences) {
		var version = parseFloat(replayVersion).toFixed(1);
		var sequences;

		// lazy parse, no regex used		
		if ('string' == typeof replaySequences && replaySequences.length > 2) {
			if (replaySequences[0] == 'd' && replaySequences[replaySequences.length - 1] == 'b') {
				sequences = replaySequences.substr(1, replaySequences.length - 2);
			}
		}		
		if (version > 0 && sequences.length) {
			this.version = version;
			this.sequences = sequences;
			return true;
		}
		return false;
	}
}

GameManager.prototype.setup = function() {
	if (!GameManager._instance) {
		GameManager._instance = this;		
	}
	this.aiPlaying = false;
	this.events = {};	
	this.replay = new GameReplay();
	GridCompacted.init();

	// check if deplay mode via URL search params
	var urlParams = new URLSearchParams(window.location.search);
	var replayVersion = urlParams.get('rv');
	var replaySequences = urlParams.get('rs');
	var replayParsed = new GameReplay();
	
	if (replayVersion && replaySequences) {
		if (replayParsed.parse(replayVersion, replaySequences)) {
			this.replayMode = true;
			this.replaySequenceStringIndex = 0;	
			this.replaySequenceStringIndexLock = false;
		}
		else {
			alert('invalid replay data, check console log for detail');
			console.log('replayVersion: ' + replayVersion + ', replaySequences: ' + replaySequences);
		}
	}	
	
	this.actuator.showReplayContainer(this.replayMode);
	this.actuator.showAiContainer(!this.replayMode);
	
	if (this.replayMode && !this.isRestarting) {
		this.grid = new Grid(this.size);
		this.over = false;
		this.won = false;
		this.keepPlaying = false;
		this.replay = replayParsed;
		this.addReplayNextStepTiles();
		this.score = this.grid.score();
	}
	// not in replay mode, load replay data from local storage	
	else {
		var previousState = this.storageManager.getGameState();				
		// Reload the game from a previous game if present
		if (previousState) {
			var replay = previousState.replay;
			this.grid        = new Grid(previousState.grid.size,
										previousState.grid.cells); // Reload grid
			this.score       = previousState.score;
			this.over        = previousState.over;
			this.won         = previousState.won;
			this.keepPlaying = previousState.keepPlaying;
			for (var p in replay) {
				this.replay[p] = replay[p];
			}			
		} else {
			this.grid        = new Grid(this.size);
			this.score       = 0;
			this.over        = false;
			this.won         = false;
			this.keepPlaying = false;

			// Add the initial tiles
			this.addStartTiles();
		}
	}
	// Update the actuator
	this.actuate();	
}

GameManager.prototype.restart = function () {
	this.storageManager.clearGameState();
	this.actuator.continueGame(); // Clear the game won/lost message
	this.isRestarting = true;
	this.setup();
	this.isRestarting = false;
};
	
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
			this.aiMoves ++; 
			console.log('ai moves: ' + this.aiMoves);
		}
		else {
			// eat the last empty cell, even no sense 
			if (this.grid.cellsAvailable()) {
				for (var direction=0; direction<4; ++direction) {
					GameManager.instance().move(direction);
				}
				this.aiMoves ++;
			}
		}
		if (this.over) {
			console.log('Total AI moves: ' + this.aiMoves);
			this._setAiPlaying(false);
		}
		else {
			var self = this;
			setTimeout(function(){
				self.aiPlayNextMove(algorithm);
			}, GameManager.AI_STEP_INTERVAL);					
		}
		// clear hint content
		document.getElementById('hint').innerHTML = '';		
	}
}

GameManager.prototype._setAiPlaying = function(aiPlaying) {
	this.aiPlaying = aiPlaying;
	this.actuator.updateAutoPlayButtonText(this.aiPlaying);
}

GameManager.prototype.autoPlay = function(algorithm) {
	this._setAiPlaying(!this.aiPlaying);
	this.aiMoves = 0;
	this.aiPlayNextMove(algorithm);
}

GameManager.prototype.ifReplayEnds = function() {
	return this.replaySequenceStringIndex >= this.replay.sequences.length;
}

GameManager.prototype.replayNextMove = function() {
	var nextMove = this.getReplayNextStepMove();
	if (0 <= nextMove) {
		console.log('replay move: ' + nextMove);
		this.move(nextMove);
	}
	else {
		// bad move and not ends
		if (!this.ifReplayEnds()) {
			this.addReplayNextStepTiles();
		}
	}
	if (this.ifReplayEnds()) {
		// TODO: show replay ends menu
		console.log('replay ends');
	}
	else {
		var self = this;
		setTimeout(function() {
			self.replayNextMove();
		}, GameManager.replayStepInterval);		
	}
}

GameManager.prototype.startReplay = function() {
	this.replayNextMove();
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

// Copied from game_manager, but removed won logic
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2: down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

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

          // Update the score
          self.score += merged.value;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

	if (moved) {
		if (this.replayMode) {
			this.addReplayNextStepTiles();
		}
		else {
			// save move replay 
			this.replay.saveMove(direction);
			this.addRandomTile();		
		}
		
		if (!this.movesAvailable()) {
		  this.over = true; // Game over!
		}
		this.actuate();
	}
	console.log('moved: ' + moved);
};

GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
	var cell = this.grid.randomAvailableCell();
	
	var tile = new Tile(cell, value);
    this.grid.insertTile(tile);
	if (!this.replayMode || this.isRestarting) {
		// save add tile replay
		this.replay.saveAddTile(cell, value);		
	}
  }
};

GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying,
	replay: 	 this.replay
  };
};

GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  // Clear the state when the game is over (game over only, not win)
  if (this.over) {
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated(),
	aiPlaying:  this.aiPlaying
  });
};

GameManager.prototype.addReplayNextStepTiles = function() {
	var index = -1,
		value = 0,
		innerStep = 0;
		stop = false;
	
	while (this.replaySequenceStringIndex < this.replay.sequences.length && !stop) {
		var curChar = this.replay.sequences[this.replaySequenceStringIndex];
		switch (innerStep) {
			case 0:
				if (curChar == 'a') {
					innerStep ++;
					this.replaySequenceStringIndex ++;
				}
				else {
					stop = true;
				}
				break;
			case 1:
			case 3:
				var intString = '';
				while ('0' <= curChar && '9' >= curChar) {
					intString += curChar;
					curChar = this.replay.sequences[++this.replaySequenceStringIndex];
				}
				var res = parseInt(intString);
				if (0 <= res) {
					if (innerStep == 1) {
						if (16 > res) {
							index = res;
							innerStep ++;
						}
						else {
							stop = true;
						}
					}
					else {
						if (res == 2 || res == 4) {
							value = res;
							innerStep ++;
						}
						else {
							stop = true;
						}
					}
				}
				else {
					stop = true;
				}
				break;
			case 2:
				if (curChar == 'v') {
					innerStep ++;
					this.replaySequenceStringIndex ++;
				}
				else {
					stop = true;
				}
				break;
			default:
				break;
		}
		if (stop) {
			if (innerStep != 0) {
				console.log('replaySequenceStringIndex: ' + this.replaySequenceStringIndex + ', innerStep: ' + 
					innerStep + '\nreplay sequences: ' +  JSON.stringify(this.replay.sequences));				
			}
		}
		else if (innerStep == 4) {
			var x = index % 4,
				y = Math.floor(index / 4);				
			this.grid.insertTile(new Tile({x: x, y: y}, value));
			console.log('replay insert tile(x: ' + x + ', y: ' + y + ', value: ' + value + ')');
			innerStep = 0;			
		}
	}	
}

GameManager.prototype.getReplayNextStepMove = function() {
	var direction = -1, 
		innerStep = 0,
		stop = false;
	
	while (this.replaySequenceStringIndex < this.replay.sequences.length && !stop) {
		var curChar = this.replay.sequences[this.replaySequenceStringIndex];
		switch (innerStep) {
			case 0:
				if (curChar == 'm') {
					innerStep ++;
					this.replaySequenceStringIndex ++;
				}
				else {
					stop = true;
				}
				break;
			case 1:
				var intString = '';
				while ('0' <= curChar && '9' >= curChar) {
					intString += curChar;
					curChar = this.replay.sequences[++this.replaySequenceStringIndex];
				}
				var res = parseInt(intString);
				if (0 <= res && 4 > res) {
					direction = res;
					innerStep ++;
				}
				else {
					stop = true;
				}
				break;
			default:
				break;
		}
		if (stop) {
			console.log('replaySequenceStringIndex: ' + this.replaySequenceStringIndex + ', innerStep: ' + 
				innerStep + '\nreplay sequences: ' +  JSON.stringify(this.replay.sequences));				
		}
		else if (innerStep == 2) {
			stop = true;
		}
	}
	return direction;
}