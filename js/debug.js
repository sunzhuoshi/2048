var debug = {
	on: false
};

debug.log = function(msg) {
	if (debug.on) {
		console.log(msg);		
	}
}