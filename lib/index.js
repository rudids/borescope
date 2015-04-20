/**
 * Load the module's dependencies.
 */

"use strict";

var Transform = require("stream").Transform;
var util = require("util");
var _ = require("lodash");

util.inherits(Borescope, Transform);

function Borescope() {

	if (!(this instanceof Borescope)) {
		return new Borescope();
	}
	Transform.call(this);
	this._reset();
}

Borescope.prototype._reset = function() {
	this._volume = 0;
	this._throughput = 0;
	this._startTime = null;
	this._throughputValue = 0;
	this._elapsed = 0;
	this._ratio = 0;
	this._percent = 0;
	this._averageThroughput = {
		total: 0,
		ticks: 0
	};
};

Borescope.prototype._transform = function(data, encoding, callback) {

	if (this._volume === 0) {
		this._startTime = new Date();
	}

	this._volume += data.length;
	this._elapsed = new Date() - this._startTime;
	this._throughput = this._volume / (this._elapsed / 1000);

	if (this._size) {
		this._ratio = this._volume / this._size;
		this._ratio = Math.min(Math.max(this._ratio, 0), 1);
		this._percent = this._ratio * 100;
		this._eta = (this._percent === 100) ? 0 : this._elapsed * (this._size / this._volume - 1);
	}

	if (isFinite(this._throughput)) {
		this._averageThroughput.total += this._throughput;
		this._averageThroughput.ticks++;
	}

	this.emit("borescopeData", this._getTransformData(data.length));

	callback(null, data);
};

Borescope.prototype._getTransformData = function(chunkSize) {

	var emitData = {
		volume: this._volume,
		throughput: isFinite(this._throughput) ? this._throughput : 0,
		elapsedTime: isNaN(this._elapsed) ? 0.0 : (this._elapsed / 1000).toFixed(1),
		chunkSize: chunkSize
	};

	if (this._size) {
		_.assign(emitData, {
			size: this._size,
			eta: isNaN(this._eta) ? 0.0 : (this._eta / 1000).toFixed(1),
			percent: this._percent.toFixed(0)
		});
	}

	return emitData;

};

Borescope.prototype._flush = function(callback) {
	this.emit("borescopeDone", {
		averageThroughput: this._averageThroughput.total / this._averageThroughput.ticks,
		totalTime: isNaN(this._elapsed) ? 0.0 : (this._elapsed / 1000).toFixed(1),
		totalVolume: this._volume
	});

	this._reset();
	callback();
};

Borescope.prototype.size = function(str) {
	if (arguments.length === 0){
		return this._size;
	}
	this._size = str;
};

exports = module.exports = new Borescope();
