/*                                               
    _/_/_/_/                      _/      _/   
   _/        _/_/_/  _/      _/    _/  _/      
  _/_/_/  _/    _/  _/      _/      _/         
 _/      _/    _/    _/  _/      _/  _/        
_/        _/_/_/      _/      _/      _/    
v0.1.1
*/

/**@typedef {import('../../gamedata_typedefs.js').GameData} GameData */
module.exports = {
    signature: "assignAiToCouncilPosition",
    args: [
        {
            name: "council_position",
            type: "string",
            desc: "The position to which the {{playerName}} decided to assing {{aiName}} to the council. BE CAREFULL! You must choose ONLY from this variants: marshal, steward, spymaster, chancellor"
        } 
    ],
    description: `仅在{{playerName}}宣布{{aiName}}现在被任命到其内阁时运行！警告！仅在{{playerName}}决定任命{{aiName}}为元帅、管家、间谍首脑或大臣时执行`,

    /**
     * @param {GameData} gameData 
     */
    check: (gameData) =>{
        return true;
    },

    /**
     * @param {GameData} gameData 
     * @param {Function} runGameEffect
     * @param {string[]} args 
     */
    run: (gameData, runGameEffect, args) => {
        const council_position = cleanAndLowercase(args[0]);
        switch (council_position) {
            case "chancellor":
                runGameEffect(`
                    trigger = {
                        global_var:talk_second_scope = {
                            exists = liege
                            liege = global_var:talk_first_scope
                            can_be_chancellor_trigger = { COURT_OWNER = global_var:talk_first_scope }
                        }
                    }

                    global_var:talk_first_scope = {
                        scope:council_position = flag:chancellor
                        fire_councillor = cp:councillor_chancellor
                        assign_councillor_type = {
                                type = councillor_chancellor
                                target = global_var:talk_second_scope
                        }
                    }
                `);
                break;
            case "steward":
                runGameEffect(`
                    trigger = {
                        global_var:talk_second_scope = {
                            exists = liege
                            liege = global_var:talk_first_scope
                            can_be_steward_trigger = { COURT_OWNER = global_var:talk_first_scope }
                        }
                    }

                    global_var:talk_first_scope = {
                        scope:council_position = flag:steward
                        fire_councillor = cp:councillor_steward
                        assign_councillor_type = {
                                type = councillor_steward
                                target = global_var:talk_second_scope
                        }
                    }
                `);
                break;
            case "marshal":
                runGameEffect(`
                    trigger = {
                        global_var:talk_second_scope = {
                            exists = liege
                            liege = global_var:talk_first_scope
                            can_be_marshal_trigger = { COURT_OWNER = global_var:talk_first_scope }
                        }
                    }

                    global_var:talk_first_scope = {
                        scope:council_position = flag:marshal
                        fire_councillor = cp:councillor_marshal
                        assign_councillor_type = {
                                type = councillor_marshal
                                target = global_var:talk_second_scope
                        }
                    }
                `);
                break;
            case "spymaster":
                runGameEffect(`
                    trigger = {
                        global_var:talk_second_scope = {
                            exists = liege
                            liege = global_var:talk_first_scope
                            can_be_spymaster_trigger = { COURT_OWNER = global_var:talk_first_scope }
                        }
                    }

                    global_var:talk_first_scope = {
                        scope:council_position = flag:spymaster
                        fire_councillor = cp:councillor_spymaster
                        assign_councillor_type = {
                                type = councillor_spymaster
                                target = global_var:talk_second_scope
                        }
                    }
                `);
                break;
        }
    },    

    chatMessage: (args) =>{
        return `你任命{{aiName}}为内阁的${args[0]}`
    },
    chatMessageClass: "positive-action-message"
}

function cleanAndLowercase(text) {
    return text.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
}