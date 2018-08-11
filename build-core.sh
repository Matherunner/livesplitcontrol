#!/bin/bash

set -e

pushd livesplit-core
cargo build --release --target wasm32-unknown-unknown -p cdylib

pushd capi/bind_gen
cargo run
popd

popd

cp livesplit-core/capi/bindings/wasm/livesplit_core.ts src/livesplit.ts
