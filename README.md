# SourceRuns Marathon Timer

SourceRuns Official Timekeeper

## Build

    $ yarn install
    $ node ./node_modules/babel-cli/bin/babel.js --presets es2015 ./node_modules/livesplit-core/index.js > index.js
    $ mv index.js ./node_modules/livesplit-core
    $ yarn build

Running ``yarn install`` is not enough. As ``livesplit-core`` is distributed as ES2015 files, it will not work with UglifyJS when running ``yarn build``. The above is just one workaround -- there's no promise that it's the best way to deal with this.

For development, it may be more convenient to run

    $ yarn start
