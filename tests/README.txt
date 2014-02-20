Installation and Setup

    - First install laika from npm
        sudo npm install -g laika
        (you might need to install XCode Command Line Tools if you are on Mac)

    - Download and install phantomJS

    - You need to start a separate mongodb server with following options (It makes testing much speedier)
        mongod --smallfiles --noprealloc --nojournal