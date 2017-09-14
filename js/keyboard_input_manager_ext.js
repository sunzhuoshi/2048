var OriginalKeyboardInputManagerListen = KeyboardInputManager.prototype.listen;

KeyboardInputManager.BUTTON_TEXT_AUTO_PLAY = 'Auto Play';
KeyboardInputManager.BUTTON_TEXT_STOP = 'Stop';
KeyboardInputManager.SELECTOR_AUTO_PLAY_BUTTON = '.auto-play-button';

KeyboardInputManager.prototype.getAlgorithm = function() {
	/* no select UI
	var select = document.getElementById('algorithm');
	return select.options[select.selectedIndex].value;
	*/
	return 'em';
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