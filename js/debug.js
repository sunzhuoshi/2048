var debug = {
	on: false
};

debug.log = function(msg) {
	if (debug.on) {
		console.log(msg);		
	}
}

debug.directionToString = function(direction) {
	return {
		0: 'up',
		1: 'right',
		2: 'down',
		3: 'left'
	}[direction];	
}