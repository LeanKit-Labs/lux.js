var webpack = require( "webpack" ); //jshint ignore:line
var path = require( "path" );

module.exports = {
  context: __dirname,
  entry: "./public/js/app.js",
  output: {
    path: path.join( __dirname, "./public/js-dist" ),
    publicPath: "./js-dist/",
    filename: "main.js"
  },
  module: {
    loaders: [
      { test: /\.jsx$/,  loader: "jsx-loader"  },
      { test: /\.json$/, loader: "json-loader" },
      { test: /\.css$/,  loader: "style-loader!css-loader" },
  	]
  },
  resolve: {
    alias: {
      lodash         : path.join( __dirname, "./node_modules/lodash/dist/lodash.js" ),
      when           : path.join( __dirname, "./node_modules/when/when.js"),
      "when.parallel": path.join( __dirname, "./node_modules/when/parallel.js"),
      "when.pipeline": path.join( __dirname, "./node_modules/when/pipeline.js"),
      react          : path.join( __dirname, "./node_modules/react/dist/react-with-addons.js" ),
      machina        : path.join( __dirname, "./node_modules/machina/lib/machina.js" ),
      conduitjs      : path.join( __dirname, "./node_modules/conduitjs/lib/conduit.js" ),
      postal         : path.join( __dirname, "./node_modules/postal/lib/postal.js" ),
      "postal.request-response" : path.join( __dirname, "./node_modules/postal.request-response/lib/postal.request-response.js" ),
      traceur        : path.join( __dirname, "./node_modules/traceur/bin/traceur-runtime.js"),
      lux            : path.join( __dirname, "../lib/lux.js"),
      jquery         : path.join( __dirname, "./node_modules/jquery/dist/jquery.js"),
      mockjax        : path.join( __dirname, "./node_modules/jquery-mockjax/jquery.mockjax.js"),

      laneParser        : path.join( __dirname, "./public/js/stores/laneParser"),
      boardStore        : path.join( __dirname, "./public/js/stores/boardStore"),
      loggingStore      : path.join( __dirname, "./public/js/stores/loggingStore"),
      pointlessActionCountingStore: path.join( __dirname, "./public/js/stores/pointlessActionCountingStore"),
      fakeNotificationStore  : path.join( __dirname, "./public/js/stores/fakeNotificationStore"),
      otherLogger       : path.join( __dirname, "./public/js/generic/otherLogger"),
      LaneSelector      : path.join( __dirname, "./public/js/components/LaneSelector/LaneSelector.jsx"),
      LaneSelectorTable : path.join( __dirname, "./public/js/components/LaneSelector/LaneSelectorTable.jsx"),
      LaneSelectorRow   : path.join( __dirname, "./public/js/components/LaneSelector/LaneSelectorRow.jsx"),
      LaneSelectorCell  : path.join( __dirname, "./public/js/components/LaneSelector/LaneSelectorCell.jsx"),
      Lane              : path.join( __dirname, "./public/js/components/LaneSelector/Lane.jsx"),
      Notification      : path.join( __dirname, "./public/js/components/Notification/Notification.jsx"),
      ActionCounter     : path.join( __dirname, "./public/js/components/ActionCounter/ActionCounter.jsx")
    }
  },
  debug: true
};