#slack-android-uploader

> Slack Android APK upload utility

`sau` is a tool I built to easily generate android apk builds (multiple variants + flavors)
and post them to a Slack channel for testing. (A bare bones CI tool, sort of)

Built on
--------

* **[node](https://nodejs.org)**
* **[bluebird](http://bluebirdjs.com)**
* **[request-promise](https://github.com/request/request-promise)**
* **[slack api](https://github.com/slackhq/slack-api-docs)**

Prerequisites
-------------

* **[Node 6](https://nodejs.org/en/download/current/)**
* **[Gradle](https://gradle.org/)**

Environment
-----------

  Two environment variables can be set to configure the behavior of this script

  * SLACK_TOKEN   - **required** - Your personal Slack token to access the Slack API, more about [token](https://api.slack.com/tokens)
  * SLACK_CHANNEL - **optional** - Slack channel to post to by default **#general**

  To post to multiple channels just seperate the channel name with commas while setting the environment variable.


Install
-------

    git clone https://github.com/shantanuraj/slack-android-uploader
    npm install

Add to Path
-----------

    export PATH=$PATH:<path to directory containing sau file>

Usage
-----

    sau # That's it

The script takes 2 optional arguments the `variant` and the `branch-name` (can be the commit hash or tag name as well).
By default the variant is set to `release` and the current local branch is used to generate the build.

To generate the debug build, from the current branch.

    sau debug

To generate the release build, from the tag 1.4

    sau release 1.4

Similarly for generating the release build, from the master branch

    sau release master


License
-------

    Copyright 2016 Shantanu Raj

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.