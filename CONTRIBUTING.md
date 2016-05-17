# Contributing to Livestreamer Twitch GUI

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


## Developing and building
Livestreamer Twitch GUI is based on [NW.js][NW.js]. This means, that if you want to debug or contribute to this program, NW.js has to be installed on your machine - using a browser does not work. There are grunt tasks (the build tool that's being used) available that will download and start NW.js for you (see below). Also please ensure that you've installed the latest stable version of [Node.js][Node.js] (including [npm][npm]), so all dependencies can be installed as well and the application can be built and compiled.

If you want to know more about NW.js apps in general, head over to the [NW.js website][NW.js-website].

Run these commands to get started:

```bash
# clone the repository
git clone https://github.com/bastimeyer/livestreamer-twitch-gui.git
cd livestreamer-twitch-gui

# globally install grunt-cli and bower - may require administrator privileges
npm install -g grunt-cli bower

# locally install all npm and bower dependencies
npm install
```

If you just want to build and compile the application, do this:

```bash
# build and compile - executable will be created inside the build/releases folder
grunt release
```

To get a list of all available grunt tasks, run `grunt --help`, or just take a look at the files in `build/tasks/{config,custom}`. 

While debugging and developing, you can choose between two methods:

1. **Run the dev build**  
   Simply run `grunt`. This will start the `dev` grunt task, which will then begin building the application (with enabled debug flags) into the `build/tmp` folder. This task will also start a couple of file watchers which rebuild the application as soon as some changes are being made. NW.js will automatically be downloaded and launched.

2. **Run from source**  
   Another way of running the application is by starting it directly from the `src` folder without building/compiling it. This method should be faster than the first one.  
   To do this, run `grunt src`. This will do some preparations first before downloading and launching NW.js and will also start additional file watchers.

Since NW.js is based on Chromium, you will find all the usual debugging tools. These can be accessed by clicking the button in the titlebar of the application, or by launching NW.js with the `--remote-debugging-port=8888` parameter (grunt already does this). The dev tools can then be found in your local browser at `http://localhost:8888/`. There also exist several IDEs with internal NW.js debugging support, too.


## Pull requests

Good pull requests - patches, improvements, new features - are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

**Please ask first** before embarking on any significant pull request (e.g. implementing features, refactoring code, porting to a different language), otherwise you risk spending a lot of time working on something that the project's developers might not want to merge into the project.

Please adhere to the coding conventions used throughout a project (indentation, white space, accurate comments, etc.) and any other requirements (such as test coverage).

Adhering to the following process is the best way to get your work included in the project:

1. [Fork][howto-fork] the project, clone your fork, and configure the remotes:
   ```bash
   # Clone your fork of the repo into the current directory
   git clone git@github.com:<YOUR-USERNAME>/livestreamer-twitch-gui.git
   # Navigate to the newly cloned directory
   cd livestreamer-twitch-gui
   # Assign the original repo to a remote called "upstream"
   git remote add upstream https://github.com/bastimeyer/livestreamer-twitch-gui.git
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


  [license]: https://github.com/bastimeyer/livestreamer-twitch-gui/blob/master/LICENSE
  [issues]: https://github.com/bastimeyer/livestreamer-twitch-gui/issues
  [issue-template]: https://github.com/bastimeyer/livestreamer-twitch-gui/blob/master/ISSUE_TEMPLATE.md
  [howto-fork]: https://help.github.com/articles/fork-a-repo
  [howto-rebase]: https://help.github.com/articles/interactive-rebase
  [howto-format-commits]: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html
  [howto-open-pull-requests]: https://help.github.com/articles/using-pull-requests
  [NW.js]: https://github.com/nwjs/nw.js
  [NW.js-website]: http://nwjs.io
  [Node.js]: https://nodejs.org
  [npm]: https://npmjs.org
  [ref-h5bp]: https://github.com/h5bp/html5-boilerplate/blob/master/CONTRIBUTING.md
