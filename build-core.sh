#!/bin/bash

set -e

cd livesplit-core
cargo build --release --target wasm32-unknown-unknown -p cdylib

cd capi/bind_gen
cargo run
