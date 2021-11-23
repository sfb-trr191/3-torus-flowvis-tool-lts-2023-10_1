const Entry = require("./state_description/state_description");
const module_version = require("./version");
const getStateDescriptionDict = module_version.getStateDescriptionDict;
const getSpecialDescriptionList = module_version.getSpecialDescriptionList;
const StateData = require("./state_data");
const { forEach } = require("mathjs");

class StateManager {

    constructor() {
        console.log("Generate StateManager");
    }

    generateListEntriesDefault(state_version) {
        var state_description_dict = getStateDescriptionDict(state_version);
        var list = [];
        list.push(new Entry("STATE_VERSION", "global", "UI16"));
        list.push(new Entry("VERSION_YEAR", "global", "UI16"));
        list.push(new Entry("VERSION_MONTH", "global", "UI16"));
        list.push(new Entry("VERSION_NUMBER", "global", "UI16"));
        var list_default = state_description_dict["default"];
        list = list.concat(list_default);
        console.log(list);
        return list;
    }

    executeStateBase64Url(){
        console.log("StateManager: execute state");
        console.log("base64_url:", this.base64_url);

        var state_data = new StateData();
        state_data.data_base64_url = this.base64_url;
        state_data.generateBase64FromBase64URL();
        state_data.generateDataUint8FromBase64();

        var state_version = state_data.readValue("UI16");

        var state_description_dict = getStateDescriptionDict(state_version);
        var list = this.generateListEntriesDefault(state_version);

        state_data.begin();
        for(var i=0; i<list.length; i++){
            var name = list[i].name;
            var data_type = list[i].data_type;
            var value = state_data.readValue(data_type);
            console.log(name, value);
            switch (list[i].element_type) {
                case "global":
                    //do nothing for now
                    break;
                case "field":       
                    window[list[i].name].value = value;
                    break;
                case "checkbox":       
                    window[list[i].name].checked = value;
                    break;
                default:
                    console.log("ERROR UNKNOWN element_type");
                    break;
            }
        }

        /*
        var list_special = getSpecialDescriptionList(state_version);
        for(var i=0; i<list_special.length; i++){
            console.log(i, list_special[i]);
            console.log(state_description_dict[list_special[i]]);
        }
        */
        //stop_script;
    }

    generateStateBase64(state_version){
        console.log("StateManager: generateStateBase64");
        var list = this.generateListEntriesDefault(state_version);
        var state_data = new StateData();
        for(var i=0; i<list.length; i++){
            console.log(i, list[i]);
            switch (list[i].element_type) {
                case "global":
                    var value = window[list[i].name];
                    var data_type = list[i].data_type;
                    state_data.writeValue(value, data_type);
                    break;
                case "field":                    
                    var value = window[list[i].name].value;
                    var data_type = list[i].data_type;
                    state_data.writeValue(value, data_type);
                    break;
                case "checkbox":                    
                    var value = window[list[i].name].checked;
                    var data_type = list[i].data_type;
                    state_data.writeValue(value, data_type);
                    break;
                default:
                    console.log("ERROR UNKNOWN element_type");
                    break;
            }
        }

        var state_description_dict = getStateDescriptionDict(state_version);
        var list_special = getSpecialDescriptionList(state_version);
        for(var i=0; i<list_special.length; i++){
            console.log(i, list_special[i]);
            console.log(state_description_dict[list_special[i]]);
        }


        state_data.generateBase64FromUint8();
        state_data.generateBase64URLFromBase64();
        this.base64 = state_data.data_base64;
        this.base64_url = state_data.data_base64_url;
    }
}

module.exports = StateManager;