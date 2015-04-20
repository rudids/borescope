"use strict";

var test = require("tape");
var borescope = require("../index.js");

test("Check interfaces", function (t) {
    t.equal(typeof borescope.size, "function', 'Size is a function.");
    t.end();
});

test("The size function", function(t) {
	borescope.size("12345");
	t.equal(borescope.size(), "12345", "Sets and returns correct value.");
	t.end();
});
