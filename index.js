"use strict";

let chokidar = require("chokidar");
let EventEmitter = require("events");
let path = require("path");

module.exports = (rootDir, delay = 50) => {
	let watcher = chokidar.watch(`${rootDir}/**`, {});
	let emitter = new EventEmitter();

	// NB: potentially invoked multiple times for a single change
	let notify = debounce(delay, filepath => {
		filepath = path.resolve(rootDir, filepath);
		emitter.emit("edit", filepath);
	});

	watcher.on("ready", _ => {
		watcher.on("add", notify).
			on("change", notify).
			on("unlink", notify);
	});
	return emitter;
};

// adapted from uitil <https://github.com/FND/uitil>
function debounce(delay, fn) {
	let timer;
	return function() {
		let args = arguments;
		if(timer) {
			clearTimeout(timer);
			timer = null;
		}
		timer = setTimeout(_ => {
			fn.apply(null, args);
			timer = null;
		}, delay);
	};
};
