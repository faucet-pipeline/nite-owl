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
```

Now, whenever something about the files in `myFavoriteDirectory` changes, the
`myFavoriteFunction` will be called with the path to the file that changed.

This notification is debounced: You only get notified at most once every 10
milliseconds. You can adjust that value by providing a second argument to the
watch function.

## License

Licensed under Apache 2.0.
