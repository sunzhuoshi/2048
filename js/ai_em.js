var SCORE_LOST_PENALTY = 200000.0;
var SCORE_MONOTONICITY_POWER = 4.0;
var SCORE_MONOTONICITY_WEIGHT = 47.0;
var SCORE_SUM_POWER = 3.5;
var SCORE_SUM_WEIGHT = 11.0;
var SCORE_MERGES_WEIGHT = 700.0;
var SCORE_EMPTY_WEIGHT = 270.0;

var SEARCH_DEPTH = 2;
var CUMULATIVE_PROBABILITY_THRESHOLD_BASE = 0.0001;
var CACHE_DEPTH_LIMIT = 3;

var AI_em = function() {
}

function State() {
	var self = this;
	this.depthLimit = SEARCH_DEPTH;
	this.curDepth = 0;
	this.movesEvaluated = 0;
	this.maxDepth = 0;
	this.transTable = [];
	this.toString = function() {
		return '{' + 
			'depthLimit: ' + self.depthLimit + 
			', curDepth: ' + self.curDepth + 
			', movesEvaluated: ' + self.movesEvaluated + 
			', maxDepth: ' + self.maxDepth + 
			'}';		
	}
}

AI_em.getBestMove = function(grid) {
	var bestScore = 0;
	var bestMove = -1;
	var gridCompacted = grid.toCompacted();
	
	for (var direction in [0, 1, 2, 3]) {
		direction = parseInt(direction, 10);
		var score = 0;
		var gridMoved = gridCompacted.move(direction);
		var state = new State();
		if (!gridMoved.equal(gridCompacted)) {
			score = this.scoreCpuNode(gridMoved, state, 1.0);
			if (score > bestScore) {
				bestScore = score;
				bestMove = direction;
			}
		}
		console.log('direction: ' + direction + ', state: ' + state + ', score: ' + score);				
	}
	return bestMove;
}

AI_em.scoreCpuNode = function(gridCompacted, state, cumulativeProbability) {
	var score = 0.0;
	if (cumulativeProbability < CUMULATIVE_PROBABILITY_THRESHOLD_BASE || state.curDepth >= state.depthLimit) {
		score = this.heuristicEvaluationGrid(gridCompacted); 
		state.maxDepth = Math.max(state.maxDepth, state.curDepth);
		debug.log('#### grid: ' + gridCompacted + ', score: ' + score + ', ' + state);
		gridCompacted.print();
		return score;
	}
	if (state.curDepth < CACHE_DEPTH_LIMIT) {
		var entry = state.transTable[gridCompacted.toString()];
		if (entry && entry.depth <= state.curDepth) {
			return entry.heuristic;
		}
	}

	var emptyCount = gridCompacted.emptyCount();
	var low = gridCompacted.low;
	var high = gridCompacted.high;
	cumulativeProbability /= emptyCount;
	
	var tile2 = 1;	
	while (tile2) {
		if (0 == (low & 0xF)) {
			debug.log('new tile 2');
			new GridCompacted(gridCompacted.low | tile2, 0).print();
			score += this.scorePlayerNode(new GridCompacted(gridCompacted.low | tile2, gridCompacted.high), state, cumulativeProbability * 0.9) * 0.9;
			debug.log('new tile 4');
			new GridCompacted(gridCompacted.low | tile2 << 1, 0).print();			
			score += this.scorePlayerNode(new GridCompacted(gridCompacted.low | tile2 << 1, gridCompacted.high), state, cumulativeProbability * 0.1) * 0.1;
		} 
		tile2 <<= 4;
		low >>= 4;
	}
	tile2 = 1;
	while (tile2) {
		if (0 == (high & 0xF)) {
			debug.log('new tile 2');			
			new GridCompacted(0, gridCompacted.high | tile2).print();			
			score += this.scorePlayerNode(new GridCompacted(gridCompacted.low, gridCompacted.high | tile2), state, cumulativeProbability * 0.9) * 0.9;
			debug.log('new tile 4');
			new GridCompacted(0, gridCompacted.high | tile2 << 1).print();			
			score += this.scorePlayerNode(new GridCompacted(gridCompacted.low, gridCompacted.high | tile2 << 1), state, cumulativeProbability * 0.1) * 0.1;
		} 
		tile2 <<= 4;
		high >>= 4;
	}	
	
	score /= emptyCount;
	if (state.curDepth < CACHE_DEPTH_LIMIT) {
		state.transTable[gridCompacted.toString()] = {
			depth: state.curDepth,
			heuristic: score
		}
	}
	return score;
}

AI_em.scorePlayerNode = function(gridCompacted, state, cumulativeProbability) {
	var bestScore = 0.0;
	state.curDepth ++;
	for (var direction in [0, 1, 2, 3]) {
		direction = parseInt(direction);
		state.movesEvaluated ++;
		var gridMoved = gridCompacted.move(direction);
		if (!gridMoved.equal(gridCompacted)) {
			bestScore = Math.max(bestScore, this.scoreCpuNode(gridMoved, state, cumulativeProbability));
		}
	}
	state.curDepth --;
	return bestScore;
}

AI_em.heuristicEvaluationRow = function(row) {
	var sum = 0, 
		emptyCount = 0,
		mergeCount = 0;
	
	var previousValue = 0, 
		counter = 0;
		
	var rowRankValues = [
		(row >> 0) & 0xF,
		(row >> 4) & 0xF,
		(row >> 8) & 0xF,
		(row >> 12) & 0xF
	];
		
	for (var i=0; i<4; ++i) {
		var value = rowRankValues[i];
		if (value) {
			sum += Math.pow(value, SCORE_SUM_POWER);
			if (previousValue == value) {
				counter ++;
			}
			else if (counter > 0) {
				mergeCount += 1 + counter;
				counter = 0;
			}
			previousValue = value;
		}
		else {
			emptyCount ++;
		}
	}
	if (counter > 0) {
		mergeCount += 1 + counter;
	}
	
	var monotonicityLeft = 0, 
		monotonicityRight = 0;
		
	for (var i=1; i<4; ++i) {
		if (rowRankValues[i-1] > rowRankValues[i]) {
			monotonicityLeft += Math.pow(rowRankValues[i-1], SCORE_MONOTONICITY_POWER) - Math.pow(rowRankValues[i], SCORE_MONOTONICITY_POWER);
		}
		else {
			monotonicityRight += Math.pow(rowRankValues[i], SCORE_MONOTONICITY_POWER) - Math.pow(rowRankValues[i-1], SCORE_MONOTONICITY_POWER);			
		}
	}
	return SCORE_LOST_PENALTY + 
		SCORE_EMPTY_WEIGHT * emptyCount +
		SCORE_MERGES_WEIGHT * mergeCount -
		SCORE_MONOTONICITY_WEIGHT * Math.min(monotonicityLeft, monotonicityRight) -
		SCORE_SUM_WEIGHT * sum;
}

AI_em.heuristicEvaluationRows = function(gridCompacted) {
	var score = 0;
	
	score += this.heuristicEvaluationRow(gridCompacted.low & 0xFFFF);
	score += this.heuristicEvaluationRow(gridCompacted.low >> 16 & 0xFFFF);	
	score += this.heuristicEvaluationRow(gridCompacted.high & 0xFFFF);
	score += this.heuristicEvaluationRow(gridCompacted.high >> 16 & 0xFFFF);		
	return score;
}

AI_em.heuristicEvaluationGrid = function(gridCompacted) {
	return this.heuristicEvaluationRows(gridCompacted) + 
		this.heuristicEvaluationRows(gridCompacted.transpose());
}
