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

    const cModeInsert = "I";
    const cModeUpdate = "U";
    const cModeDisplay = "V";

    return Controller.extend("zpccompartimento.controller.Details", {
        _key: "",
        _mode: cModeDisplay,
        _templateItemCompartimento: {
            TuNumber: null,
            ComNumber: 0,
            CmpMinvol: null,
            CmpMaxvol: null,
            mode: cModeInsert
        },
        onInit: function () {
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("details").attachPatternMatched(this._onRouteMatched, this);

            var oModel = this.getOwnerComponent().getModel();
            oModel.setDefaultBindingMode("TwoWay");

            this.getView().setModel(oModel);

            this.getView().setModel(new sap.ui.model.json.JSONModel({
                key: this._key,
                mode: this._mode
            }, true), "viewData");

            this.getView().setModel(new sap.ui.model.json.JSONModel([]), "tableItemComp");
        },
        _setKey: function (sKey) {
            this._key = sKey;
            let oModel = this.getView().getModel("viewData");
            oModel.setProperty("/key", this._mode);
        },
        _setMode: function (sMode) {
            this._mode = sMode;
            let oModel = this.getView().getModel("viewData");
            oModel.setProperty("/mode", this._mode);

            if (this._mode === cModeUpdate) {
                let oModelItemComp = this.getView().getModel("tableItemComp");
                let aDataItemCompartimento = oModelItemComp.getData();

                for (let i = 0; i < aDataItemCompartimento.length; i++) {
                    let element = { ...aDataItemCompartimento[i] };

                    if (element.mode === cModeDisplay) {
                        element.mode = cModeUpdate;
                    }
                }

                oModelItemComp.setData(aDataItemCompartimento);
            }

        },
        _setTableItemCompVisible: function (bVisible) {
            this.getView().byId("idItemCompTable").setVisible(bVisible);
        },
        _onRouteMatched: function (oEvent) {
            var args = oEvent.getParameter("arguments");

            this._setKey(args["TuNumber"]);

            if (this._key) {
                this._setMode(cModeDisplay);
                // this.getView().byId("idTuNumberGroupElement").setVisible(false);
                this._loadData(this._key);
            } else {
                this._setMode(cModeInsert);
                var oModel = this.getView().getModel();
                // oModel.attachMetadataLoaded(function () {
                // var oContextChild = oModel.createEntry("/CompartimentoTextSet", {
                //     success: function (params) {

                //     },
                //     error: function (params) {

                //     }
                // });
                var oDataDefaultValues = {
                    ChaDate: undefined,
                    ChaName: undefined,
                    CreDate: undefined,
                    CreName: undefined,
                    DimUom: "M",
                    EquipNr: undefined,
                    RailcarType: undefined,
                    Tppoint: undefined,
                    TuAxles: undefined,
                    TuCarrier: undefined,
                    TuHeight: undefined,
                    TuId: undefined,
                    TuLength: undefined,
                    TuMaxvol: undefined,
                    TuMaxwgt: undefined,
                    TuNrcomps: undefined,
                    TuNrmets: undefined,
                    TuNumber: undefined,
                    TuStatus: undefined,
                    TuType: undefined,
                    TuUnlwgt: undefined,
                    TuWidth: undefined,
                    VolUom: undefined,
                    VtuXblck: undefined,
                    WgtUom: "KG"
                };

                var oContext = oModel.createEntry("/CompartimentoSet", {
                    properties: oDataDefaultValues,
                    success: function (oData, response) {
                    },
                    error: function (params) {
                    }
                });

                this.getView().setBindingContext(oContext);

                this.getView().byId("idSmartForm").bindElement(oContext.getPath());

                let oModelItemComp= this.getView().getModel("tableItemComp");

                if (oModelItemComp) {
                    oModelItemComp.setData([]);
                }

                this._setTableItemCompVisible(false);
                // });
                this._setSmartForm();
            }
        },
        onSmartFormEditToggled: function () {
            var oElement = this.byId("idGravarButton");

            if (oElement.getVisible()) {
                this._setMode(cModeDisplay);
                oElement.setVisible(false);
                this.getView().byId("idSmartForm").setTitle("Exibir unid. Transporte " + this._key);
            } else {
                oElement.setVisible(true);

                if (!this._key) {
                    this._setMode(cModeInsert);
                    this.getView().byId("idSmartForm").setTitle("Criar unid. Transporte");
                } else {
                    this._setMode(cModeUpdate);
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
        onButtonAddRowPress: function (oEvent) {
            let oModel = this.getView().getModel("tableItemComp");
            let aData = oModel.getData();
            aData.push({ ...this._templateItemCompartimento });
            oModel.setData(aData);
        },
        onChangeModelValueTuType: function (oEvent) {
            if (oEvent.getParameter("valueChanged") === true) {
                let sTuType = oEvent.getSource().getBindingContext().getProperty("TuType");

                if (sTuType === 'RD02') {
                    this._setTableItemCompVisible(true);
                } else {
                    this._setTableItemCompVisible(false);
                }
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
                        "$expand": "CompartimentoText,ItemCompartimento"
                    },
                    filters: [],
                    success: function (oData, response) {
                        that.getView().byId("idSmartForm").bindElement("/CompartimentoSet('" + tuNumber + "')");

                        if (oData.TuType === 'RD02') {
                            let oModelItemCompartimento = that.getView().getModel("tableItemComp");

                            let aResults = oData.ItemCompartimento.results;

                            for (let i = 0; i < aResults.length; i++) {
                                delete aResults[i].__metadata;
                                aResults[i]["mode"] = cModeDisplay;
                            }

                            oModelItemCompartimento.setData(aResults);

                            that._setTableItemCompVisible(true);
                        } else {
                            that._setTableItemCompVisible(false);
                        }

                        that._setSmartForm();
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
            if (this._mode === cModeInsert) {
                this._saveCreate();
            } else {
                this._saveUpdate();
            }
        },
        _setSmartForm: function () {
            var oSmartForm = this.getView().byId("idSmartForm");

            if (this._mode === cModeInsert && !oSmartForm.getEditable()) {
                //Create mode
                // this.getView().byId("idTuNumberGroupElement").setVisible(true);
                oSmartForm._toggleEditMode();
                oSmartForm.setEditTogglable(false);
            } else if (this._mode === cModeDisplay && oSmartForm.getEditable()) {
                //Display mode
                oSmartForm.setEditTogglable(true)
                oSmartForm._toggleEditMode();;
            }
        },
        _saveCreate: function () {
            var that = this;
            var oDataModel = this.getOwnerComponent().getModel();
            var sEntityPath = this.getView().byId("idSmartForm").getBindingContext().getPath();
            var oData = oDataModel.getData(sEntityPath);

            let oSendData = { ...oData };
            oSendData.CompartimentoText = { ...oDataModel.getData(sEntityPath + "/CompartimentoText") };

            let aDataItemCompartimento = this.getView().getModel("tableItemComp").getData();
            oSendData.ItemCompartimento = [];

            if (oData.TuType === 'RD02') {
                for (let i = 0; i < aDataItemCompartimento.length; i++) {
                    let element = { ...aDataItemCompartimento[i] };

                    if (element.mode === cModeInsert) {
                        delete element.mode;
                        element.TuNumber = this._key;
                        oSendData.ItemCompartimento.push({ ...element });
                    }
                }
            }

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

            let aDataItemCompartimento = this.getView().getModel("tableItemComp").getData();
            oSendData.ItemCompartimento = [];

            if (oData.TuType === 'RD02') {
                for (let i = 0; i < aDataItemCompartimento.length; i++) {
                    let element = { ...aDataItemCompartimento[i] };

                    if (element.mode === cModeInsert) {
                        delete element.mode;
                        element.TuNumber = this._key;
                        oSendData.ItemCompartimento.push({ ...element });
                    } else if (element.mode === cModeUpdate) {
                        delete element.mode;
                        oSendData.ItemCompartimento.push({ ...element });
                    }
                }
            }

            try {
                oDataModel.create("/CompartimentoSet", oSendData, {
                    success: function (oData, response) {
                        MessageBox.success("Dados gravados com sucesso!", {
                            onClose: function () {
                                // var oSmartForm = that.getView().byId("idSmartForm");
                                // oSmartForm._toggleEditMode();
                                window.location.reload();
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