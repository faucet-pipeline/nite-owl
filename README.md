# nite-owl

[![package version](https://img.shields.io/npm/v/nite-owl.svg?style=flat)](https://www.npmjs.com/package/nite-owl)
[![build status](https://github.com/faucet-pipeline/nite-owl/workflows/tests/badge.svg)](https://github.com/faucet-pipeline/nite-owl/actions)

You need to watch a directory for changes, but don't want to be notified all the
time? Try nite-owl.

![Who watches the Nite Owl?](https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Nite_Owl_01.jpg/250px-Nite_Owl_01.jpg)

Before you ask: No, we didn't implement all this hairy file watching business
ourselves. We simply use [chokidar](https://github.com/paulmillr/chokidar).

Using nite-owl basically comes down to this:

```js
let watch = require("nite-owl");

watch(myFavoriteDirectories). // either a single directory path or an array thereof
    on("edit", myFavoriteFunction).
    on("error", myErrorFunction);
```

Whenever one of the files in any of `myFavoriteDirectory` changes,
`myFavoriteFunction` will be invoked with the paths of all files which changed
within a short interval.

This notification is debounced: You only get notified at most once every 50
milliseconds. You can adjust that value by providing a second argument to the
watch function.

The error callback will be called, when watching the files resulted in an
error. The most common error is the `TooManyFilesError` (it has the code
`ERR_TOO_MANY_FILES`). It occurs on Linux when you watch too many files. In this
case you have to either increase the inotify limits or choose to watch less
files. An error handler could look like this:

```js
watch(myFavoriteDirectories).
    on("error", err => {
        if(err.code === "ERR_TOO_MANY_FILES") {
            console.error("Watching too many files");
            process.exit(1);
        } else {
            throw err;
        }
    });
```

The process can also be terminated programmatically:

```js
let watcher = watch(…);
…
watcher.terminate();
```

## License

Licensed under Apache 2.0.
