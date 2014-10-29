##v0.3.0-RC1

* Restructured lux's message contracts to use three channels (lux.action, lux.store and lux.dispatcher), and updated the topics.
* Removed when and postal.request-response dependencies.
* Store operations are now synchronous. (Transport-related activities must happen elsewhere).
* Store's can be module dependencies, with read-accessor helper methods, etc.
