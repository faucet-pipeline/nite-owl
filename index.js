"use strict";

let chokidar = require("chokidar");
let EventEmitter = require("events");
let path = require("path");

let NORMALIZE_PATH = path.sep !== "/"; // typically indicates Windows

module.exports = (rootDirs, { delay = 50, reportSet, suppressReporting } = {}) => {
	if(!rootDirs.pop) {
		rootDirs = [rootDirs];
	}

	if(!suppressReporting) {
		let separator = rootDirs.length === 1 ? " " : "\n… ";
		console.error("monitoring file system at" + separator + rootDirs.join(separator));
	}

	let patterns = rootDirs.map(dir => {
		let pattern = path.resolve(dir, "**");
		// chokidar expects POSIX path separators
		return NORMALIZE_PATH ? pattern.split(path.sep).join("/") : pattern;
	});
	let watcher = chokidar.watch(patterns);
	let emitter = new EventEmitter();

	let notify = notifier(delay, filepaths => {
		emitter.emit("edit", reportSet ? filepaths : Array.from(filepaths));
	});
	watcher.on("ready", () => {
		watcher.on("add", notify).
			on("change", notify).
			on("unlink", notify);
	}).on("error", err => {
		if(err.code === "ENOSPC") {
			err = new TooManyFilesError("you are watching too many files - " +
					"try limiting the directories being watched");
		}

		if(emitter.listenerCount("error") === 0) {
			throw err;
		}
		emitter.emit("error", err);
	});

	let wrapper = {
		terminate: () => {
			watcher.close();
		}
	};
	return new Proxy(emitter, {
		get: (target, prop, receiver) => wrapper[prop] || target[prop]
	});
};

function notifier(delay, callback) {
	let files = new Set();
	let notify = debounce(delay, () => {
		callback(files);
		files = new Set();
	});

	// NB: potentially invoked multiple times for a single change
	return filepath => {
		files.add(filepath);
		notify();
	};
}

// adapted from uitil <https://github.com/FND/uitil>
function debounce(delay, fn) {
	let timer;
	return (...args) => {
		if(timer) {
			clearTimeout(timer);
			timer = null;
		}
		timer = setTimeout(() => {
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
