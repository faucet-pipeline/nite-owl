"use strict";

let chokidar = require("chokidar");
let EventEmitter = require("events");
let path = require("path");

module.exports = (rootDir, delay = 50) => {
	let watcher = chokidar.watch(`${rootDir}/**`, {});
	let emitter = new EventEmitter();

	let notify = notifier(delay, filepaths => {
		filepaths = Array.from(filepaths).map(fp => path.resolve(rootDir, fp));
		emitter.emit("edit", filepaths);
	});
	watcher.on("ready", _ => {
		watcher.on("add", notify).
			on("change", notify).
			on("unlink", notify);
	});

	return emitter;
};

function notifier(delay, callback) {
	let files = new Set();
	let notify = debounce(delay, callback);

	// NB: potentially invoked multiple times for a single change
	return filepath => {
		files.add(filepath);
		notify(files);
		files.clear();
	};
}

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
