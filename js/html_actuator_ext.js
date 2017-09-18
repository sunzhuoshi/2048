HTMLActuator.BUTTON_TEXT_AUTO_PLAY = 'Auto Play';
HTMLActuator.BUTTON_TEXT_STOP = 'Stop';
HTMLActuator.SELECTOR_AUTO_PLAY_BUTTON = '.auto-play-button';

HTMLActuator.prototype.directionToSymbol = function(direction) {
	return {
		0: '↑',
		1: '→',
		2: '↓',
		3: '←'
	}[direction];
}

HTMLActuator.prototype.updateAutoPlayButtonText = function(aiPlaying) {
	if (!this.autoPlayButton) {
		this.autoPlayButton = document.querySelector(HTMLActuator.SELECTOR_AUTO_PLAY_BUTTON);
	}
	this.autoPlayButton.innerHTML = aiPlaying? HTMLActuator.BUTTON_TEXT_STOP: HTMLActuator.BUTTON_TEXT_AUTO_PLAY;
}

HTMLActuator.prototype.updateHintDirection = function(direction) {
	var symbol = this.directionToSymbol(direction);
	
	if (!symbol) {
		symbol = '';
	}
	document.getElementById('hint').innerHTML = symbol;	
}