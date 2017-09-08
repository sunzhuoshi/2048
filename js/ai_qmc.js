var AI_qmc = function() {	
}

AI_qmc.PLAY_OUT_TIMES = 100;

AI_qmc.getBestMove = function(grid) {
	var bestScore = 0; 
	var bestMove = -1;
	var bestAvgMoves;

	for (var direction=0;direction<4;direction++) {
		var res = playPlayouts(grid, direction, this.PLAY_OUT_TIMES);
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

AI.qmc.playPlayouts = function(grid, direction, playoutTimes) {
	var totalScore = 0.0;
	var totalMoves = 0;
	
	for (var i=0 ; i < playoutTimes ; i++) {
		debug.log('#### random run: ' + i);
		var res = playPlayout(grid, direction);
		if (0 == res.moves) {
			break;
		}	
		totalScore += res.score;
		totalMoves += res.moves;
	}	
	return {score: totalScore / playoutTimes, avgMoves: totalMoves / playoutTimes};	
}

AI.qmc.
