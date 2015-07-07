var _               = require('underscore'),
    path            = require('path'),
    spawn           = require('child_process').spawn,
    exec            = require('child_process').exec,
    util            = require('util'),
    EventEmitter    = require('events').EventEmitter,
    intercept       = true,
    snifferInstance = null;

var scripts = {
  read: 'build/RFSniffer',
  emit: 'build/codesend',
};



var Sniffer = function(pin, debounceDelay) {
  
  EventEmitter.call(this);
  
  pin = pin || 0;
  debounceDelay = debounceDelay || 500;
  
  var self = this;
  var cmd = spawn(path.join(__dirname, scripts.read));

  /**
   * onCode
   */
  cmd.stdout.on('data', _.debounce(function (code) {
    
    if(!intercept) return;
    
    code = parseInt(code);
    
    self.emit('codes', code);
    self.emit(code);
    
  }, debounceDelay, true));

  /**
   * onError
   */
  cmd.stderr.on('data', function (error) {

    self.emit('error', error);

  });
  
};

util.inherits(Sniffer, EventEmitter);

module.exports = {
  
  sniffer: function () {
    
    return snifferInstance || (snifferInstance = new Sniffer());
    
  },
  
  sendCode: function (code, callback) {
    
    callback = callback || function () {};
    intercept = false;
    
    exec(path.join(__dirname, scripts.emit)+' '+code, function (error, stderr, stdout) {
      
      intercept = true;
      callback(error, stderr, stdout);
      
    });
    
  }
  
};