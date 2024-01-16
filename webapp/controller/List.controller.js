sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
/**
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 */
function (Controller) {
    "use strict";

    const cModeDisplay = "display";

    return Controller.extend("zpccompartimento.controller.List", {
        onInit: function () {

        },
        onCriarCompartimentoButtonPress: function (oEvent) {

        },
        onEliminarCompartimentoButtonPress: function (oEvent) {

        },
        onRowActionItemPress: function (oEvent) {
            var oLine = oEvent.getSource().getBindingContext().getObject();

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("details", { TuNumber: oLine.TuNumber });
        },
        onCriarCompartimentoButtonPress: function (oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("details");
        }
    });
});
