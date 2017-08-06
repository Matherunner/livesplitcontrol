# SourceRuns Marathon Official Timekeeper

Contact the relevant people at SourceRuns to understand the purpose of this project.

## Usage notes

To be used in conjunction with [LiveSplit.NetControlClient](https://github.com/YaLTeR/LiveSplit.NetControlClient) and [network-relay](https://github.com/YaLTeR/network-relay).

Certain aspects of the timer can be customised/modified from their defaults via URL query parameters. Remember to **percent encode** the input values, especially for ``wsUrl``.

| Query Parameter   | Input                        |  Description                              |
|:----------------- |:---------------------------- |:----------------------------------------- |
| password          | String                       | Password for server authentication        |
| fontSizeScale     | Positive number              | Scale the timer font size by input        |
| fontColor         | RGB in hex (e.g. acff83)     | Set the timer font colour                 |
| offset            | Positive integer in ms       | Set the command time offset               |
| wsUrl             | WebSockets server URL        | Connect to the specified URL              |

For example, ``?fontSizeScale=3&offset=5030`` scales the timer font 3 times and set the command time offset to 5030 milliseconds.

## Build and deployment

Initialise by

    $ yarn install
    $ ./transcompile-livesplit.sh

Running ``yarn install`` is not enough. As ``livesplit-core`` is distributed as ES2015 files, it will not work with UglifyJS when running ``yarn build``. The ``transcompile-livesplit.sh`` script fixes this, but must be run every time packages are updated (e.g. by ``yarn add``) before building.

Decide on the server URL you want to deploy this app on. Then edit the ``homepage`` field in ``package.json`` and run

    $ yarn build

The generated files will be in ``build``. Simply copy the files to the server and you're done.

For development, it may be more convenient to run

    $ yarn start
