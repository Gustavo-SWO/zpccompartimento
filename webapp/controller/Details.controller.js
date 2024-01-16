sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    'sap/m/BusyDialog',
    'sap/m/MessageBox'
], function (
    Controller,
    History,
    BusyDialog,
    MessageBox
) {
    "use strict";

    return Controller.extend("zpccompartimento.controller.Details", {
        _key: "",
        _modeCreate: false,
        onInit: function () {
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("details").attachPatternMatched(this.onRouteMatched, this);

            var oModel = this.getOwnerComponent().getModel();
            oModel.setDefaultBindingMode("TwoWay");

            this.getView().setModel(oModel);
        },
        onRouteMatched: function (oEvent) {
            var args = oEvent.getParameter("arguments");

            this._key = args["TuNumber"];

            if (this._key) {
                this._modeCreate = false;
                this._loadData(this._key);
            } else {
                this._modeCreate = true;
                this._switchFormCreate();
                var oModel = this.getView().getModel();
                // oModel.attachMetadataLoaded(function () {
                // var oContextChild = oModel.createEntry("/CompartimentoTextSet", {
                //     success: function (params) {

                //     },
                //     error: function (params) {

                //     }
                // });
                var oContext = oModel.createEntry("/CompartimentoSet", {
                    success: function (params) {

                    },
                    error: function (params) {

                    }
                });

                this.getView().setBindingContext(oContext);

                this.getView().byId("idSmartForm").bindElement(oContext.getPath());

                // });
            }
        },
        onSmartFormEditToggled: function () {
            var oElement = this.byId("idGravarButton");

            if (oElement.getVisible()) {
                oElement.setVisible(false);
                this.getView().byId("idSmartForm").setTitle("Exibir unid. Transporte " + this._key);
            } else {
                oElement.setVisible(true);

                if (!this._key) {
                    this.getView().byId("idSmartForm").setTitle("Criar unid. Transporte");
                } else {
                    this.getView().byId("idSmartForm").setTitle("Modif. unid. Transporte " + this._key);
                }
            }
        },
        navBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteList", {}, true);
            }
        },
        _loadData: function (tuNumber) {
            var that = this;
            var oDataModel = this.getOwnerComponent().getModel();

            this.getView().byId("idSmartForm").setTitle("Exibir unid. Transporte " + this._key);

            this.getView().getModel().getMetaModel().loaded().then(function () {
                that.getView().byId("idSmartForm").bindElement("/CompartimentoSet('" + that._key + "')");
            });
            // var oFilter = new Filter("('" + x + "')");

            try {
                oDataModel.read("/CompartimentoSet('" + tuNumber + "')", {
                    urlParameters: {
                        "$expand": "CompartimentoText"
                    },
                    filters: [],
                    success: function (oData, response) {
                        that.getView().byId("idSmartForm").bindElement("/CompartimentoSet('" + tuNumber + "')");
                    },
                    error: function (e) {
                        if (e.responseText) {
                            var responseObj = JSON.parse(e.responseText);
                            MessageBox.error(responseObj.error.message);
                        }
                    }
                });
            } catch (e) {
                MessageBox.error(e);
            }
        },
        onGravarButtonPress: function (oEvent) {
            if (this._modeCreate) {
                this._saveCreate();
            } else {
                this._saveUpdate();
            }
        },
        _switchFormCreate: function () {
            var oSmartForm = this.getView().byId("idSmartForm");

            if (this._modeCreate && !oSmartForm.getEditable()) {
                //Create mode
                oSmartForm._toggleEditMode();
                oSmartForm.setEditTogglable(false);
            }
        },
        _saveCreate: function () {
            var that = this;
            var oDataModel = this.getOwnerComponent().getModel();
            var sEntityPath = this.getView().byId("idSmartForm").getBindingContext().getPath();
            var oData = oDataModel.getData(sEntityPath);
            let oSendData = { ...oData };
            oSendData.CompartimentoText = { ...oDataModel.getData(sEntityPath + "/CompartimentoText") };

            try {
                // oDataModel.submitChanges({
                oDataModel.create("/CompartimentoSet", oSendData, {
                    success: function (oData, response) {
                        MessageBox.success("Dados gravados com sucesso!", {
                            onClose: function () {
                                // var oSmartForm = that.getView().byId("idSmartForm");
                                // oSmartForm._toggleEditMode();
                                that.navBack();
                            }
                        });
                    },
                    error: that._saveError
                });
            } catch (e) {
                MessageBox.error(e);
            }
        },
        _saveUpdate: function () {
            var that = this;
            var oDataModel = this.getOwnerComponent().getModel();
            var sEntityPath = "/CompartimentoSet('" + this._key + "')";
            // var sEntityPath = this.getView().byId("idSmartForm").getBindingContext().getPath();
            var oData = oDataModel.getData(sEntityPath);

            let oSendData = { ...oData };
            oSendData.CompartimentoText = { ...oDataModel.getData(sEntityPath + "/CompartimentoText") };

            try {
                oDataModel.create("/CompartimentoSet", oSendData, {
                    success: function (oData, response) {
                        MessageBox.success("Dados gravados com sucesso!", {
                            onClose: function () {
                                var oSmartForm = that.getView().byId("idSmartForm");
                                oSmartForm._toggleEditMode();
                            }
                        });
                    },
                    error: that._saveError
                });
            } catch (e) {
                MessageBox.error(e);
            }
        },
        _saveError: function (e) {
            MessageBox.error("Erro ao gravar dados");
            // if (e.responseText) {
            //     var responseObj = JSON.parse(e.responseText);
            //     MessageBox.error(responseObj.error.message);
            // }
        }
        // callCreate: function () {
        //     var that = this;
        //     var oDataModel = this.getOwnerComponent().getModel();
        //     // var sEntityPath = "/CompartimentoSet";
        //     // var oData = oDataModel.getData(sEntityPath);

        //     try {
        //         // oDataModel.create(sEntityPath, oData, {
        //         oDataModel.submitChanges({
        //             success: function (oData, response) {
        //                 MessageBox.success("Dados gravados com sucesso!", {
        //                     onClose: function () {
        //                         var oSmartForm = that.getView().byId("idSmartForm");
        //                         oSmartForm._toggleEditMode();
        //                     }
        //                 });
        //             },
        //             error: function (e) {
        //                 if (e.responseText) {
        //                     var responseObj = JSON.parse(e.responseText);
        //                     MessageBox.error(responseObj.error.message);
        //                 }
        //             }
        //         });
        //     } catch (e) {
        //         MessageBox.error(e);
        //     }
        // },
        // callUpdate: function () {
        //     var that = this;
        //     var oDataModel = this.getOwnerComponent().getModel();
        //     var sEntityPath = "/CompartimentoSet('" + this._key + "')";
        //     var oData = oDataModel.getData(sEntityPath);

        //     let oSendData = { ...oData };
        //     oSendData.CompartimentoText = { ...oDataModel.getData(sEntityPath + "/CompartimentoText") };

        //     try {
        //         oDataModel.update(sEntityPath, oData, {
        //             success: function (oData, response) {
        //                 MessageBox.success("Dados gravados com sucesso!", {
        //                     onClose: function () {
        //                         var oSmartForm = that.getView().byId("idSmartForm");
        //                         oSmartForm._toggleEditMode();
        //                     }
        //                 });
        //             },
        //             error: function (e) {
        //                 if (e.responseText) {
        //                     var responseObj = JSON.parse(e.responseText);
        //                     MessageBox.error(responseObj.error.message);
        //                 }
        //             }
        //         });
        //     } catch (e) {
        //         MessageBox.error(e);
        //     }
        // }
    });
});