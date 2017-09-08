var AI_mc = function() {	
}

AI_mc.PLAY_OUT_TIMES = 200;
AI_mc.OPTIMIZE_MOVE_PLAY_OUT_TIMES = 2000;
AI_mc.optimizeMove = true;

AI_mc.getBestMove = function(grid) {
	var bestScore = 0; 
	var bestMove = -1;
	var bestAvgMoves;
	var playoutTime;
	
	if (this.optimizeMove) {
		playoutTimes = this.OPTIMIZE_MOVE_PLAY_OUT_TIMES;
	}
	else {
		playoutTimes = this.PLAY_OUT_TIMES;
	}

	for (var direction=0;direction<4;direction++) {
		var res = this.playPlayouts(grid, direction, playoutTimes);
		var score = res.score;
		
		if (score >= bestScore) {
			bestScore = score;
			bestMove = direction;
			bestAvgMoves = res.avgMoves;
		}		
		debug.log('direction: ' + debug.directionToString(direction) + ", score - " + score);
	}
	console.log('direction: ' + debug.directionToString(bestMove) + ', score: ' + bestScore + ', avg number of moves: ' + bestAvgMoves);					
	return bestMove;
}

AI_mc.playPlayouts = function(grid, direction, playoutTimes) {
	var totalScore = 0.0;
	var totalMoves = 0;
	
	for (var i=0 ; i < playoutTimes ; i++) {
		debug.log('#### random run: ' + i);
		var res;
		if (this.optimizeMove) {
			res = this.optimizeMovePlayPlayout(grid, direction);
		}
		else {
			res = this.playPlayout(grid, direction);
		}
		if (0 == res.moves) {
			break;
		}	
		totalScore += res.score;
		totalMoves += res.moves;
	}	
	return {score: totalScore / playoutTimes, avgMoves: totalMoves / playoutTimes};
}

AI_mc.playPlayout = function(grid, direction) {	
	var gameManager = GameManager.instance();
	var g = grid.clone();
	var score = 0;
	var moves = 0;
	var firstMove = true;
	var moveDirection = direction;
	
	while (true) {
		if (!gameManager.movesAvailableOfGrid(g)) {
			break;
		}
		if (!firstMove) {
			moveDirection = Math.floor(Math.random() * 4);
		}
		var res = gameManager.moveGrid(g, moveDirection);
		if (!res.moved) {
			if (firstMove) {
				break;
			}
			else {
				continue;				
			}
		}
		score += res.score;
		gameManager.addRandomTileInGrid(g);
		moves++;
		firstMove = false;		
	}
	debug.log('## moves: ' + moves);
	return {score: score, moves: moves};
}


AI_mc.optimizeMovePlayPlayout = function(grid, direction) {	
	var gridCompacted = grid.toCompacted();
	var score = 0;
	var moves = 0;
	var firstMove = true;
	var moveDirection = direction;
	
	while (true) {
		if (!gridCompacted.movesAvailable()) {
			break;
		}
		if (!firstMove) {
			moveDirection = Math.floor(Math.random() * 4);
		}
		var gridMoved = gridCompacted.move(moveDirection);
		if (gridMoved.equal(gridCompacted)) {
			if (firstMove) {
				break;
			}
			else {
				continue;				
			}
		}
		score += gridCompacted.score();
		gridMoved.addRandomTile();
		gridCompacted = gridMoved;
		moves++;
		firstMove = false;		
	}
	debug.log('## moves: ' + moves);
	return {score: score, moves: moves};
}
