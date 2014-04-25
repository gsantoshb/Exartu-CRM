#!/bin/bash
node-inspector --web-port=3333 &
google-chrome 'http://0.0.0.0:3333/debug?port=5858' &
NODE_OPTIONS='--debug-brk' mrt run


