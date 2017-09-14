HTMLActuator.BUTTON_TEXT_AUTO_PLAY = 'Auto Play';
HTMLActuator.BUTTON_TEXT_STOP = 'Stop';
HTMLActuator.SELECTOR_AUTO_PLAY_BUTTON = '.auto-play-button';

HTMLActuator.prototype.updateAutoPlayButtonText = function(aiPlaying) {
	if (!this.autoPlayButton) {
		this.autoPlayButton = document.querySelector(HTMLActuator.SELECTOR_AUTO_PLAY_BUTTON);
	}
	this.autoPlayButton.innerHTML = aiPlaying? HTMLActuator.BUTTON_TEXT_STOP: HTMLActuator.BUTTON_TEXT_AUTO_PLAY;
}