## v0.7.4

* Removed unnecessary postal subscription constraint on `originId`.
* Update karma and karma-webpack. Start server with newer API. 

## v0.7.3

* Updated babel dependency to 5.x

## v0.7.2

* Improves usefulness of coverage
* Blacklisted `strict` in Babel, to fix UMD
* Detect circular waitFor and incorrect waitFor
* Removed Examples (now see @dcneiner's [lux mail example app](https://github.com/LeanKit-Labs/lux-mail-example))
* Include current year in license header

## v0.7.1

* No longer sending prenotify message if no stores have updated
* Removed deprecated mixin method, changed `initReact` to return the module export to allow chaining

## v0.7.0

* Removed factory function export from CommonJS wrapper.
* Added logo to repo and README
* Separate `initReact` method
* Exposed react mixins
* Added a top level publishAction to call both custom and auto-generated actions

## v0.6.1

* Adding support for plain browser global usage.
* Added check for listenTo array length.
* Added replaceState method to store.
* Appeased jshint. Added test coverage and ignored the print utils code for istanbul.

## v0.6.0

* Use 6to5 by its new name babel.
* Converted tests to Chai assertions and chai-sinon helpers
* Update specs to workaround Number.should babel/chai conflict.

## v0.5.4

* Fixed bug in store dispose method.
* Replaced internal pluck function with lodash pick.
* Added exception if mixin does not contain a setup method.
* Added exception if invalid action names are used when adding actions to an action group.
* Fixed mis-spelled internal function name.
* Added tests to cover new exceptions.
* Fixes to example app.
* Fixing the store dep tree print util.

## v0.5.3

* Ignore handled messages when dispatcher does not have internal context.
* Clear dispatcher subscriptions after unsubscribing in dispose.

## v0.5.2

* Update postal and lodash dependencies

## v0.5.1

* Fixed issue where subscriptions to changes for dot-separated store namespaces were not cleaned up properly.

## v0.5.0

* Removed ActionCoordinator, refactored Dispatcher to be a BehavioralFsm
* Added test to verify that store handler exceptions are not swallowed by lux
* Updated README to remove ActionCoordinator references
* Using 6to5 now for ES5 transpiling
* Updated README with info on 6to5 dependency.

## v0.4.1

* Updated to support machina 1.0. ActionCoordinator is now a BehavioralFsm.
* Updated readme to reflect ActionCoordinator changes
* Updated bower.json to reflect postal.js as the dep name

## v0.4.0

* Updated README with short example of passing multiple args (mixins) to Store constructor.
* Updated example directory's package.json dependencies to latest versions of each.
* Updated lux package.json dependencies to latest versions of each.
* Added Store tests to cover multiple mixins passed to constructor.
* Added merge function to be used internally in lux.
* Updated Store constructor to call merge on args passed in.
* Added @arobson to contributors in package.json
* Added Support (and tests) for extended store constructors and store mixins that allow handler method name collision (each handler is queued and executed in the mixin order).
* Fixed issue where mixins were not being cloned before mutation
* Updated failing specs to get new store instances instead of using factory/global store var
* Updated README to fix spelling, remove version, add notes about store mixins, etc.

## v0.3.3

Updated deps, bumped version to 0.3.3

## v0.3.2

* Adds support for sourcemaps for node/mocha tests
* Upgrade to postal 0.11.0
* get sourceMaps working with Karma for Traceur/Webpack

## v0.3.1

* fix karma setup and webpack config to work properly with sinon
* finish action and dispatcher tests
* fix issue with failures in coordinator transitioning to both failure and success states

## v0.3.0

* Restructured lux's message contracts to use three channels (lux.action, lux.store and lux.dispatcher), and updated the topics.
* Removed when and postal.request-response dependencies.
* Store operations are now synchronous. (Transport-related activities must happen elsewhere).
* Store's can be module dependencies, with read-accessor helper methods, etc.
* Fixed exception that gets raised during teardown of components with the store mixin
* Update to allow React to be passed in to the CommonJS factory method
* Optimization to webpack file and karma config
* Added support for tests from the command line via node
* More tests for luxControllerView, actionCoordinator is now fully synchronous
* Unit tests for store, small fix for removing initial state
* Tests for mixins. Additions of error messaging, fixed issue with stores and empty handlers array.

## v0.2.3

* Updated package.json with reference to published postal.request-response version 0.3
* Refactored loadState to utilize request-response, temporary helpers in example app to verify
* Moved request/response to lux channel, added constant for lux channel name, fixed issue where string syntax of listenTo was breaking array iteration
* Added displayName and node ID to message payload for msgs published by a component (for trace-ability etc)

## v0.2.2

* Fixed issue where full dependency arg wasn't being passed to downstream stores
* moved postal.request-reponse promise config inside lux
* removed redundant check in the pluck helper fn

## v0.2.1

* Added main and files props to package.json and added LICENSE file
* Updated pre-notify message to only indicate stores that have actually changed state during an action
* Updated version number, and modified build to include header in es6 output as well

## v0.2.0

* Added new mixin method to support
* Added queue/prenotify support to pass all state changes from an action cycle through as a single argument
* Whitespace cleanup commit
* Removed Transport Strategy from all the things. Store setState, getState and replaceState are all synchronous now
* Refactored stores mixin to consolidate onChange handlers into one call
* Added display names to components in example dir
* Updating README for v0.2.0
