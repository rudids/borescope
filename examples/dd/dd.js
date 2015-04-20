/**
 * Example using dd with borescope.
 * dd is command line utility for *NIX environments and so this test is unlikely to work on Windows.
 * See http://en.wikipedia.org/wiki/Dd_%28Unix%29 for more information.
 */

"use strict";

var borescope = require("../../");
var Progress = require("progress");
var spawn = require("child_process").spawn;
var fs = require("fs");
var numeral = require("numeral");
var chalk = require("chalk");

var imageSize = fs.statSync("image.img").size;

borescope.size(imageSize);

var bar = new Progress("  downloading :bar :eta :percent :throughput", {
	complete: chalk.bgCyan(" "),
	incomplete: chalk.bgWhite(" "),
	width: 10,
	total: imageSize
});


spawn("dd", ["if=image.img"]).stdout
	.pipe(borescope)
	.pipe(spawn("dd", ["of=/dev/null"]).stdin);

borescope.on("borescopeData", function(data){
	bar.tick(data.chunkSize, {
		throughput: numeral(data.throughput).format("0.00 b") + "/s"
	});
});

borescope.on("borescopeDone", function(data){
	console.log("Average throughput: " + numeral(data.averageThroughput).format("0.00 b") + "/s");
	console.log("Duration: " + numeral(data.totalTime).format("00:00:00"));
	console.log("Transfered: " + numeral(data.totalVolume).format("0.00 b"));
});
