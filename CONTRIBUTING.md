# Contributing to Streamlink Twitch GUI

Want to get involved? Thanks! There are plenty of ways to help!


## Reporting issues

A bug is a *demonstrable problem* that is caused by the code in the repository. Good bug reports are extremely helpful - thank you!

Please read the following guidelines before you [report an issue][issues]:

1. **Use the GitHub issue search** — check if the issue has already been reported. If it has been, please comment on the existing issue.

2. **Check if the issue has been fixed** — the latest `master` or development branch may already contain a fix.

3. **Isolate the demonstrable problem** — make sure that the code in the project's repository is *definitely* responsible for the issue.

Please try to be as detailed as possible in your report too. What is your environment? What steps will reproduce the issue? What would you expect to be the outcome? All these details will help people to assess and fix any potential bugs. You can also consider using the [issue template][issue-template] when reporting an issue.


## Feature requests

Feature requests are welcome. But take a moment to find out whether your idea fits with the scope and aims of the project. It's up to *you* to make a strong case to convince the project's developers of the merits of this feature. Please provide as much detail and context as possible.


## Translating

Please see the detailed translation guidelines on the project's [wiki][wiki].


## Developing and building

Streamlink Twitch GUI is based on [NW.js][NW.js].  
Please visit the [NW.js website][NW.js-website] if you want to know more about NW.js apps.

Building the application is simple. Please make sure that the latest stable versions of [Git][Git], [Node.js][Node.js] and [Yarn][yarn] (or [Npm][npm]) are installed on your system, so all dependencies can be installed and the application can be built and compiled.

### Setup

```bash
# clone the repository
git clone https://github.com/streamlink/streamlink-twitch-gui.git
cd streamlink-twitch-gui

# install dependencies via yarn (preferred way)
yarn global add grunt-cli # may require administrator privileges
yarn install
# or use npm instead (discouraged)
npm install --global grunt-cli # may require administrator privileges
npm install
```

Streamlink Twitch GUI uses [Gruntjs][Gruntjs] and [Webpack][Webpack] as build tools. This is different from Ember.js based projects that are using ember-cli.  
To get a list of all available grunt tasks, run `grunt --help`.  
All task configs can be found in `build/tasks/{configs,custom}`.

### Developing

```bash
grunt build
```

This will create a development build and will run it afterwards. If NW.js has not been downloaded yet, it will do this automatically.  
Since NW.js is based on Chromium, you will find all the usual debugging tools. These can be accessed by clicking the button in the titlebar of the application or by opening `http://localhost:8888/` in your web browser. IDEs with internal NW.js debugging support can be used as well.  
Once NW.js has been launched, file watchers will look for any changes being made to the source files and will then rebuild those parts of the application.

### Testing

```bash
# run tests
grunt test

# keep running NW.js, show its window and rebuild tests on change
grunt test:dev
```

### Building and compiling

```bash
# create a production build and compile it afterwards
grunt release
# or run both build steps explicitly
grunt build:prod compile
```

The final build can be found in the `build/releases` directory.

Both `release` and `compile` tasks support multiple *targets* for different platforms. Targets can be set by appending `:target` to the task name (eg. `grunt release:linux64:osx64`). See `build/tasks/common/platforms.js` for all available targets. By default, the currently used platform will be used.


## Pull requests

Good pull requests - patches, improvements, new features - are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

**Please ask first** before embarking on any significant pull request (e.g. implementing features, refactoring code, porting to a different language), otherwise you risk spending a lot of time working on something that the project's developers might not want to merge into the project.

Please adhere to the coding conventions used throughout a project (indentation, white space, accurate comments, etc.) and any other requirements (such as test coverage).

Adhering to the following process is the best way to get your work included in the project:

1. [Fork][howto-fork] the project, clone your fork, and configure the remotes:
   ```bash
   # Clone your fork of the repo into the current directory
   git clone git@github.com:<YOUR-USERNAME>/streamlink-twitch-gui.git
   # Navigate to the newly cloned directory
   cd streamlink-twitch-gui
   # Assign the original repo to a remote called "upstream"
   git remote add upstream https://github.com/streamlink/streamlink-twitch-gui.git
   ```

2. If you cloned a while ago, get the latest changes from upstream
   ```bash
   git checkout master
   git pull upstream master
   ```

3. Create a new topic branch (off the main project branch) to contain your feature, change, or fix:
   ```bash
   git checkout -b <TOPIC-BRANCH-NAME>
   ```

4. Commit your changes in logical chunks. Please adhere to these [git commit message guidelines][howto-format-commits] or your code is unlikely be merged into the project. Use git's [interactive rebase][howto-rebase] feature to tidy up your commits before making them public.

5. Locally merge (or rebase) the upstream branch into your topic branch:
   ```bash
   git pull [--rebase] upstream master
   ```

6. Push your topic branch up to your fork:
   ```bash
   git push origin <TOPIC-BRANCH-NAME>
   ```

7. [Open a Pull Request][howto-open-pull-requests] with a clear title and description.

**IMPORTANT**: By submitting a patch, you agree to allow the project owners to license your work 
under the terms of the [MIT License][license].


## Acknowledgements

This contributing guide has been adapted from [HTML5 boilerplate's guide][ref-h5bp].


  [license]: https://github.com/streamlink/streamlink-twitch-gui/blob/master/LICENSE
  [issues]: https://github.com/streamlink/streamlink-twitch-gui/issues
  [issue-template]: https://github.com/streamlink/streamlink-twitch-gui/blob/master/ISSUE_TEMPLATE.md
  [wiki]: https://github.com/streamlink/streamlink-twitch-gui/wiki
  [howto-fork]: https://help.github.com/articles/fork-a-repo
  [howto-rebase]: https://help.github.com/articles/interactive-rebase
  [howto-format-commits]: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html
  [howto-open-pull-requests]: https://help.github.com/articles/using-pull-requests
  [NW.js]: https://github.com/nwjs/nw.js
  [NW.js-website]: http://nwjs.io
  [Git]: https://git-scm.com
  [Node.js]: https://nodejs.org
  [yarn]: https://yarnpkg.com
  [npm]: https://npmjs.org
  [Gruntjs]: http://gruntjs.com
  [Webpack]: https://webpack.github.io
  [ref-h5bp]: https://github.com/h5bp/html5-boilerplate/blob/master/CONTRIBUTING.md
