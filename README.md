# nite-owl

You need to watch a directory for changes, but don't want to be notified all the
time? Try nite-owl.

![Who watches the Nite Owl?](https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Nite_Owl_01.jpg/250px-Nite_Owl_01.jpg)

Before you ask: No, we didn't implement all this hairy file watching business
ourselves. We simply use [chokidar](https://github.com/paulmillr/chokidar).

Using nite-owl basically comes down to this:

```js
let watch = require('nite-owl')

watch(myFavoriteDirectory)
    .on('edit', myFavoriteFunction)
    .on('error', myErrorFunction);
```

Now, whenever something about the files in `myFavoriteDirectory` changes, the
`myFavoriteFunction` will be called with the paths of any files that changed.

This notification is debounced: You only get notified at most once every 50
milliseconds. You can adjust that value by providing a second argument to the
watch function.

The error callback will be called, when watching the files resulted in an
error. The most common error is the `TooManyFilesError` (it has the code
`ERR_TOO_MANY_FILES`). It occurs on Linux when you watch too many files. In this
case you have to either increase the inotify limits or choose to watch less
files. An error handler could look like this:

```js
watch(myFavoriteDirectory).on('error', (err) => {
    if(err.code === 'ERR_TOO_MANY_FILES') {
        console.error('Watching too many files');
        process.exit(1);
    } else {
        throw err;
    }
})
```

## License

Licensed under Apache 2.0.
