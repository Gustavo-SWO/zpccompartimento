/*global QUnit*/

sap.ui.define([
	"zpc_compartimento/controller/List.controller"
], function (Controller) {
	"use strict";

	QUnit.module("List Controller");

	QUnit.test("I should test the List controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
