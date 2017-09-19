HTMLActuator.BUTTON_TEXT_AUTO_PLAY = 'Auto Play';
HTMLActuator.BUTTON_TEXT_STOP = 'Stop';
HTMLActuator.SELECTOR_AUTO_PLAY_BUTTON = '.auto-play-button';
HTMLActuator.HELPER_CONTAINER_TOP = 'helper-container-top';
HTMLActuator.HELPER_CONTAINER_BOTTOM = 'helper-container-bottom';

HTMLActuator.prototype.directionToSymbol = function(direction) {
	return {
		0: '↑',
		1: '→',
		2: '↓',
		3: '←'
	}[direction];
}

HTMLActuator.prototype.updateAutoPlayButtonText = function(aiPlaying) {
	if (!this.autoPlayButtons) {
		this.autoPlayButtons = document.querySelectorAll(HTMLActuator.SELECTOR_AUTO_PLAY_BUTTON);
	}
	this.autoPlayButtons.forEach(function(button) {
		button.innerHTML = aiPlaying? HTMLActuator.BUTTON_TEXT_STOP: HTMLActuator.BUTTON_TEXT_AUTO_PLAY;
	});
}

HTMLActuator.prototype.updateHintDirection = function(direction) {
	var symbol = this.directionToSymbol(direction);
	
	if (!symbol) {
		symbol = '';
	}
	document.querySelectorAll('.hint-text').forEach(function(element) {
		element.innerHTML = symbol;
	});
}

HTMLActuator.prototype.showTopHelperContainer = function(visible) {
	document.getElementById(HTMLActuator.HELPER_CONTAINER_TOP).style.display = visible? 'block': 'none';
}

HTMLActuator.prototype.showBottomHelperContainer = function(visible) {
	document.getElementById(HTMLActuator.HELPER_CONTAINER_BOTTOM).style.display = visible? 'block': 'none';
}