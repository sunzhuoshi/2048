HTMLActuator.BUTTON_TEXT_AUTO_PLAY = 'Auto Play';
HTMLActuator.BUTTON_TEXT_STOP = 'Stop';
HTMLActuator.SELECTOR_AUTO_PLAY_BUTTON = '.auto-play-button';
HTMLActuator.SELECTOR_REPLAY_CONTAINER = '.replay-container';
HTMLActuator.SELECTOR_AI_CONTAINER = '.ai-container';

HTMLActuator.prototype.updateAutoPlayButtonText = function(aiPlaying) {
	if (!this.autoPlayButton) {
		this.autoPlayButton = document.querySelector(HTMLActuator.SELECTOR_AUTO_PLAY_BUTTON);
	}
	this.autoPlayButton.innerHTML = aiPlaying? HTMLActuator.BUTTON_TEXT_STOP: HTMLActuator.BUTTON_TEXT_AUTO_PLAY;
}

HTMLActuator.prototype.showReplayContainer = function(visible) {
	if (!this.replayContainer) {
		this.replayContainer = document.querySelector(HTMLActuator.SELECTOR_REPLAY_CONTAINER);
	}
	this.replayContainer.style.display = visible? 'block': 'none';
}

HTMLActuator.prototype.showAiContainer = function(visible) {
	if (!this.aiContainer) {
		this.aiContainer = document.querySelector(HTMLActuator.SELECTOR_AI_CONTAINER);
	}
	this.aiContainer.style.display = visible? 'block': 'none';
}

	