((function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.lux = factory();
  }
}))(this, (function() {
  console.log("hai");
}));
