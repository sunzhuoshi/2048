var OriginalKeyboardInputManagerListen = KeyboardInputManager.prototype.listen;

KeyboardInputManager.prototype.getAlgorithm = function() {
	var select = document.getElementById('algorithm');
	return select.options[select.selectedIndex].value;
}

KeyboardInputManager.prototype.directionToSymbol = function(direction) {
	return {
		0: '↑',
		1: '→',
		2: '↓',
		3: '←'
	}[direction];
}

KeyboardInputManager.prototype.listen = function() {
	OriginalKeyboardInputManagerListen.apply(this, arguments);
	this.bindButtonPress(".auto-play-button", this.autoPlay);
	this.bindButtonPress(".hint-button", this.showHint);
	this.bindButtonPress(".watch-replay-button", this.watchReplay);
	this.bindButtonPress(".share-replay-button", this.shareReplay);	
	this.bindButtonPress(".restart-button", this.newGame);
}

KeyboardInputManager.prototype.newGame = function(event) {
	this.restart(event);	
	var index = window.location.href.indexOf('?');
	if (0 <= index) {
		window.location.href = window.location.href.substr(0, index);
	}
}

KeyboardInputManager.prototype.autoPlay = function(event) {
	event.preventDefault();
	GameManager.instance().autoPlay(this.getAlgorithm());
}

KeyboardInputManager.prototype.showHint = function(event) {
	event.preventDefault();	
	var bestMove = GameManager.instance().getBestMove(this.getAlgorithm());
	if (0 <= bestMove) {
		document.getElementById('hint').innerHTML = this.directionToSymbol(bestMove);		
	}
}

KeyboardInputManager.prototype.shareReplay = function() {
	console.log('share replay');
}

KeyboardInputManager.prototype.watchReplay = function() {
	var newSearch = '?' + GameManager.instance().replay.toUrlParameters();
	if (window.location.search != newSearch) {
		window.location.search = newSearch;
	}
	else {
		GameManager.instance().startReplay();
	}	
}

KeyboardInputManager.prototype.emit = function (event, data) {
	if (GameManager.instance().replayMode) {
		// block move event in replay mode
		if (event == 'move') {
			return;
		}
	}
	var callbacks = this.events[event];
		if (callbacks) {
			callbacks.forEach(function (callback) {
			callback(data);
		});
	}		
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
	var buttons = document.querySelectorAll(selector);
	for (var i=0; i<buttons.length; ++i) {
		var button = buttons[i];
		button.addEventListener("click", fn.bind(this));
		button.addEventListener(this.eventTouchend, fn.bind(this));  
	}
};
