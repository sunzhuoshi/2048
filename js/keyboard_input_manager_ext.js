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
	this.bindButtonPress(".auto-play-button", this.autoPlay);
	this.bindButtonPress(".hint-button", this.showHint);
}

KeyboardInputManager.prototype.autoPlay = function(event) {
	event.preventDefault();
	this.emit('autoPlay', this.getAlgorithm());
}

KeyboardInputManager.prototype.showHint = function(event) {
	event.preventDefault();	
	this.emit('showHint', this.getAlgorithm());
}
