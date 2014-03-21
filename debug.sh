#!/bin/bash
node-inspector &
google-chrome 'http://0.0.0.0:8080/debug?port=5858' &
sudo NODE_OPTIONS='--debug' mrt run

