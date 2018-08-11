# SourceRuns Marathon Official Timekeeper

Contact the relevant people at SourceRuns to understand the purpose of this project.

## Usage notes

To be used in conjunction with [LiveSplit.NetControlClient](https://github.com/YaLTeR/LiveSplit.NetControlClient) and [network-relay](https://github.com/YaLTeR/network-relay).

Upon launching, type in the server password. After a successful authentication, there may be some delay in loading up the timer due to the size of the WebAssembly Livesplit core. The timer shows up in presentation mode by default. Double click on the timer text to toggle between presentation and controller mode.

Certain aspects of the timer can be customised/modified from their defaults via URL query parameters. Remember to **percent encode** the input values, especially for ``wsUrl``.

| Query Parameter   | Input                        |  Description                              |
|:----------------- |:---------------------------- |:----------------------------------------- |
| password          | String                       | Password for server authentication        |
| textAlign         | left, right, or center       | Set the text alignment of the timer       |
| fontSizeScale     | Positive number              | Scale the timer font size by input        |
| fontColor         | RGB in hex (e.g. acff83)     | Set the timer font colour                 |
| offset            | Positive integer in ms       | Set the command time offset               |
| wsUrl             | WebSockets server URL        | Connect to the specified URL              |

For example, ``?fontSizeScale=3&offset=5030`` scales the timer font 3 times and sets the command time offset to 5030 milliseconds. This rather inconvenient way of customisation is needed because there is no easy way to do this interactively when the timer is rendered in, say, OBS Studio.

## Build and deployment

Start by making sure `rustup` is installed. Then,

    $ rustup target add wasm32-unknown-unknown
    $ yarn build:core
    $ yarn install

Decide on the server URL you want to deploy this app on. Then edit the ``homepage`` field in ``package.json`` and run

    $ yarn build

The generated files will be in ``build``. Simply copy the files to the server and you're done.

For development, it may be more convenient to run

    $ yarn start
