var OriginalGameManagerSetup = GameManager.prototype.setup;

GameManager.prototype.setup = function() {
	OriginalGameManagerSetup.apply(this, arguments);
	if (!GameManager._instance) {
		GameManager._instance = this;		
	}
	GridCompacted.init();
}
	
GameManager.instance = function () {
	return GameManager._instance;
}

GameManager.prototype.aiPlay = function() {
	var bestMove = AI.getBestMove(this.grid);
	if (0 <= bestMove) {
		this.move(bestMove);	  
	}
	else {
		console.log('no further move');
		this.over = true;
	}
	if (!this.over) {
		var self = this;
		setTimeout(function(){
			self.aiPlay();
		}, 150);
	}	
}
