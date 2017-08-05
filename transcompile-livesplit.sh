#!/bin/bash

set -e

node ./node_modules/babel-cli/bin/babel.js --presets es2015 ./node_modules/livesplit-core/index.js > index.js
mv index.js ./node_modules/livesplit-core/index.js
