"use strict";

let chokidar = require("chokidar");
let EventEmitter = require("events");
let path = require("path");

module.exports = (rootDirs, { delay = 50, suppressReporting } = {}) => {
	if(!rootDirs.pop) {
		rootDirs = [rootDirs];
	}

	if(!suppressReporting) {
		let separator = rootDirs.length === 1 ? " " : "\n… ";
		console.error("monitoring file system at" + separator + rootDirs.join(separator));
	}

	let patterns = rootDirs.map(dir => path.resolve(dir, "**"));
	let watcher = chokidar.watch(patterns);
	let emitter = new EventEmitter();

	let notify = notifier(delay, filepaths => {
		filepaths = Array.from(filepaths);
		emitter.emit("edit", filepaths);
	});
	watcher.on("ready", _ => {
		watcher.on("add", notify).
			on("change", notify).
			on("unlink", notify);
	}).on("error", err => {
		if(err.code === "ENOSPC") {
			err = new TooManyFilesError("you are watching too many files");
		}

		// Emit the error if someone is listening. Otherwise throw it.
		if(emitter.listenerCount("error") > 0) {
			emitter.emit("error", err);
		} else {
			throw err;
		}
	});

	let wrapper = {
		terminate: function() {
			watcher.close();
		}
	};
	return new Proxy(emitter, {
		get: (target, prop, receiver) => wrapper[prop] || target[prop]
	});
};

function notifier(delay, callback) {
	let files = new Set();
	let notify = debounce(delay, callback);

	// NB: potentially invoked multiple times for a single change
	return filepath => {
		files.add(filepath);
		notify(files);
		files = new Set();
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
}

class TooManyFilesError extends Error {
	constructor(...params) {
		super(...params);
		this.code = "ERR_TOO_MANY_FILES";
	}
}
