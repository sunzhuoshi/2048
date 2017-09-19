var OriginalKeyboardInputManagerListen = KeyboardInputManager.prototype.listen;

KeyboardInputManager.prototype.getAlgorithm = function() {
	/* no select UI
	var select = document.getElementById('algorithm');
	return select.options[select.selectedIndex].value;
	*/
	return 'em';
}

KeyboardInputManager.prototype.listen = function() {
	OriginalKeyboardInputManagerListen.apply(this, arguments);
	this.bindButtonPress('.auto-play-button', this.autoPlay);
	this.bindButtonPress('.hint-button', this.showHint);
	this.bindButtonPress('.helper-arrow-down', this.helperArrowDown);
	this.bindButtonPress('.helper-arrow-up', this.helperArrowUp)
}

KeyboardInputManager.prototype.autoPlay = function(event) {
	event.preventDefault();
	this.emit('autoPlay', this.getAlgorithm());
}

KeyboardInputManager.prototype.showHint = function(event) {
	event.preventDefault();	
	this.emit('showHint', this.getAlgorithm());
}

KeyboardInputManager.prototype.helperArrowDown = function(event) {
	event.preventDefault();
	this.emit('helperArrowDown');
}

KeyboardInputManager.prototype.helperArrowUp = function(event) {
	event.preventDefault();
	this.emit('helperArrowUp');
}