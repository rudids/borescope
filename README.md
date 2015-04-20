# Borescope

Borescope is a module used to get information about pipes such as throughput, total data sent etc...  It is very similar to the amazing UNIX utility pipe viewer or 'pv'.

## Installation

Borescope is an NPM module and can be installed using the stock standard method below:

```
npm install borescope
```

## Usage

When you want to pipe a stream into borescope you should if you can give it the size of the stream (eg: an image file that you are using dd to write to an SD card), you can do this by calling the size function and passing int the size of the stream in bytes:

```
borescope.size(40960000);
```

> This is not mandatory but will impact the data coming out of the 'borescopeData' event.

## Events

#### borescopeData
This is emitted every time data flows through the stream being piped into borescope.  This will return the following data:

Name | Description 
--- | --- 
volume | Total amount of data passed through the pipe so far (in bytes).
throughput | Speed of throughput (in bytes).
elapsedTime | Total amount of time elapsed so far (in seconds).
chunkSize | Total amount of data passed through since last event of borescopeData (in bytes).
chunkSize | Total amount of data passed through since last event of borescopeData (in bytes).
size | Total size of the stream (in bytes, only is size specified).
eta | Estimated time of arrival for completion of stream (in seconds, only is size specified).
percent | Percentage completed. (in percent, only is size specified).

#### borescopeDone
This is emitted when the stream being piped through borescope ends and is flushed.  This will return the following data:

Name | Description 
--- | --- 
averageThroughput | The average throughput of the data throughout the life of the stream (in bytes).
totalTime | The total amount of time taken to complete the stream (in seconds).
totalVolume | Total amount of volume processed in the stream (in bytes).

## Example

```javascript
"use strict";

var borescope = require("../../");
var Progress = require("progress");
var spawn = require("child_process").spawn;
var fs = require("fs");
var numeral = require("numeral");
var chalk = require("chalk");

// image.img needs to exist on disk.
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
```