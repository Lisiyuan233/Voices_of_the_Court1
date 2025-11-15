import {ipcRenderer } from 'electron';
import { Config } from '../../shared/Config';
import { ApiConnection } from '../../shared/apiConnection';

const template = document.createElement("template");

function defineTemplate(label: string){
    return `
    <link rel="stylesheet" href="../../public/configWindow/config.css">
    <style>
    </style>
    
    <div class="input-group">
        <label for="connection-api">API</label>
        <select name="connection-api" id="connection-api">
            <option value="openrouter">OpenRouter</option>
            <option value="ooba">Text Gen WebUI (ooba)</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Google Gemini</option>
            <option value="glm">GLM</option>
            <option value="custom">Custom (OpenAI-compatible)</option>
        </select> 
    </div>
    
    <div class="border">
        <div id="openrouter-menu">
            <h2>OpenRouter</h2>

            <div class="input-group">
            <label for="api-key">API Key</label>
            <br>
            <input type="password" id="openrouter-key">
            </div>
        
            <div class="input-group">
            <label for="openrouter-model">Model</label>
            <input type="text" id="openrouter-model">
            <a href="https://openrouter.ai/models" target="_blank">Browse models..</a>
            </div>

            <div class="input-group">
            <input type="checkbox" id="openrouter-instruct-mode">
            <label for="openrouter-instruct-mode">Force Instruct mode</label>
            </div>
        </div>

        <div id="ooba-menu">
            <h2>Text-Gen-WebUI (Ooba)</h2>

            <div class="input-group">
                <label for="ooba-url">Server URL</label>
                <br>
                <input type="text" id="ooba-url">
                <br>
            </div>
        
        </div>

        <div id="openai-menu">
            <h2>OpenAI</h2>

            <div class="input-group">
            <label for="api-key">API Key</label>
            <br>
            <input type="password" id="openai-key">
            </div>
        
            <div class="input-group">
            <label for="openai-model-select">Model</label>
            <select id="openai-model-select">
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Recommended)</option>
                <option value="gpt-4o">GPT-4-o</option>
            </select>
            </div>
        </div>

        <div id="gemini-menu">
            <h2>Google Gemini</h2>

            <div class="input-group">
            <label for="api-key">API Key</label>
            <br>
            <input type="password" id="gemini-key">
            </div>
        
            <div class="input-group">
            <label for="gemini-model">Model</label>
            <input type="text" id="gemini-model" placeholder="e.g. gemini-2.5-pro">
            </div>
        </div>

        <div id="glm-menu">
            <h2>GLM</h2>

            <div class="input-group">
            <label for="api-key">API Key</label>
            <br>
            <input type="password" id="glm-key">
            </div>
        
            <div class="input-group">
            <label for="glm-model-select">Model</label>
            <select id="glm-model-select">
                <option value="glm-4.6">GLM-4.6</option>
                <option value="glm-4.5">GLM-4.5</option>
                <option value="glm-4.5-x">GLM-4.5-X</option>
                <option value="glm-4.5-flash">GLM-4.5-Flash</option>
                <option value="glm-4.5-air">GLM-4.5-Air</option>
                <option value="glm-4.5-airx">GLM-4.5-AirX</option>
            </select>
            </div>
        </div>

        <div id="custom-menu">
            <h2>Custom (Openai-compatible) endpoint</h2>

            <div class="input-group">
                <label for="custom-url">Server URL</label>
                <br>
                <input type="text" id="custom-url">
            </div>
            <div class="input-group">
                <label for="custom-key">API Key</label>
                <br>
                <input type="password" id="custom-key">
            </div>
            <div class="input-group">
                <label for="custom-model">Model</label>
                <br>
                <input type="text" id="custom-model">
            </div>
    
        </div>

        <hr>
        <input type="checkbox" id="overwrite-context"/>
        <label>Overwrite context size</label> <br>
        <input type="number" id="custom-context" min="0" style="width: 10%;"/>
    </div>

  <button type="button" id="connection-test-button">Test Connection</button> <span id="connection-test-span"></span>`
}

    

class ApiSelector extends HTMLElement{
    label: string;
    confID: string;
    shadow: any;
    typeSelector
    checkbox: any;

    openaiDiv: HTMLDivElement
    oobaDiv: HTMLDivElement
    openrouterDiv: HTMLDivElement 
    customDiv: HTMLDivElement 
    geminiDiv: HTMLDivElement
    glmDiv: HTMLDivElement

    openaiKeyInput: HTMLInputElement 
    openaiModelSelect: HTMLSelectElement 

    geminiKeyInput: HTMLInputElement 
    geminiModelInput: HTMLInputElement 

    glmKeyInput: HTMLInputElement 
    glmModelSelect: HTMLSelectElement 

    oobaUrlInput: HTMLSelectElement 
    oobaUrlConnectButton: HTMLInputElement 

    openrouterKeyInput: HTMLSelectElement 
    openrouterModelInput: HTMLInputElement 
    openrouterInstructModeCheckbox: HTMLInputElement 

    customUrlInput: HTMLSelectElement 
    customKeyInput: HTMLInputElement 
    customModelInput: HTMLSelectElement 

    testConnectionButton: HTMLButtonElement 
    testConnectionSpan: HTMLButtonElement 

    overwriteContextCheckbox: HTMLInputElement;
    customContextNumber: HTMLInputElement;


    constructor(){
        super();
        this.label = this.getAttribute("label")!;
        this.confID = this.getAttribute("confID")!;

        

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.label);
        this.shadow.append(template.content.cloneNode(true));
        this.checkbox = this.shadow.querySelector("input");
        
        this.typeSelector = this.shadow.querySelector("#connection-api")!;

        this.openaiDiv = this.shadow.querySelector("#openai-menu")!;
        this.oobaDiv = this.shadow.querySelector("#ooba-menu")!;
        this.openrouterDiv = this.shadow.querySelector("#openrouter-menu")!;
        this.customDiv = this.shadow.querySelector("#custom-menu")!;
        this.geminiDiv = this.shadow.querySelector("#gemini-menu")!;
        this.glmDiv = this.shadow.querySelector("#glm-menu")!;

        this.openaiKeyInput = this.shadow.querySelector("#openai-key")!;
        this.openaiModelSelect = this.shadow.querySelector("#openai-model-select")!;

        this.geminiKeyInput = this.shadow.querySelector("#gemini-key")!;
        this.geminiModelInput = this.shadow.querySelector("#gemini-model")!;

        this.glmKeyInput = this.shadow.querySelector("#glm-key")!;
        this.glmModelSelect = this.shadow.querySelector("#glm-model-select")!;

        this.oobaUrlInput = this.shadow.querySelector("#ooba-url")!;
        this.oobaUrlConnectButton = this.shadow.querySelector("#ooba-url-connect")!;

        this.openrouterKeyInput = this.shadow.querySelector("#openrouter-key")!;
        this.openrouterModelInput = this.shadow.querySelector("#openrouter-model")!;
        this.openrouterInstructModeCheckbox = this.shadow.querySelector("#openrouter-instruct-mode")!;

        this.customUrlInput = this.shadow.querySelector("#custom-url")!;
        this.customKeyInput = this.shadow.querySelector("#custom-key")!;
        this.customModelInput = this.shadow.querySelector("#custom-model")!;

        this.testConnectionButton = this.shadow.querySelector("#connection-test-button")!;
        this.testConnectionSpan = this.shadow.querySelector("#connection-test-span")!;

        this.overwriteContextCheckbox = this.shadow.querySelector("#overwrite-context")!;
        this.customContextNumber = this.shadow.querySelector("#custom-context")!;
    }


    static get observedAttributes(){
        return ["name", "confID", "label"]
    }

    async connectedCallback(){
        const confID: string = this.confID;

        let config = await ipcRenderer.invoke('get-config');

        let apiConfig = config[confID].connection;

        
        this.typeSelector.value = apiConfig.type;
        this.displaySelectedApiBox();

        // 从apiKeys字段中加载所有API类型的配置（如果存在）
        const apiKeys = apiConfig.apiKeys || {};
        
        // 加载OpenAI配置
        if (apiKeys.openai) {
            this.openaiKeyInput.value = apiKeys.openai.key || "";
            this.openaiModelSelect.value = apiKeys.openai.model || "";
        } else if(apiConfig.type == "openai"){
            this.openaiKeyInput.value = apiConfig.key;
            this.openaiModelSelect.value = apiConfig.model;
        }
        
        // 加载OOBA配置
        if (apiKeys.ooba) {
            this.oobaUrlInput.value = apiKeys.ooba.baseUrl || "";
        } else if(apiConfig.type == "ooba"){
            this.oobaUrlInput.value = apiConfig.key;
        }
        
        // 加载OpenRouter配置
        if (apiKeys.openrouter) {
            this.openrouterKeyInput.value = apiKeys.openrouter.key || "";
            this.openrouterModelInput.value = apiKeys.openrouter.model || "";
        } else if(apiConfig.type == "openrouter"){
            this.openrouterKeyInput.value = apiConfig.key;
            this.openrouterModelInput.value = apiConfig.model;
        }
        
        // 加载Custom配置
        if (apiKeys.custom) {
            this.customUrlInput.value = apiKeys.custom.baseUrl || "";
            this.customKeyInput.value = apiKeys.custom.key || "";
            this.customModelInput.value = apiKeys.custom.model || "";
        } else if(apiConfig.type == "custom"){
            this.customUrlInput.value = apiConfig.baseUrl;
            this.customKeyInput.value = apiConfig.key;
            this.customModelInput.value = apiConfig.model;
        }
        
        // 加载Gemini配置
        if (apiKeys.gemini) {
            this.geminiKeyInput.value = apiKeys.gemini.key || "";
            this.geminiModelInput.value = apiKeys.gemini.model || "";
        } else if(apiConfig.type == "gemini"){
            this.geminiKeyInput.value = apiConfig.key;
            this.geminiModelInput.value = apiConfig.model;
        }
        
        // 加载GLM配置
        if (apiKeys.glm) {
            this.glmKeyInput.value = apiKeys.glm.key || "";
            this.glmModelSelect.value = apiKeys.glm.model || "";
        } else if(apiConfig.type == "glm"){
            this.glmKeyInput.value = apiConfig.key;
            this.glmModelSelect.value = apiConfig.model;
        }
        
        this.openrouterInstructModeCheckbox.checked = apiConfig.forceInstruct;

        this.overwriteContextCheckbox.checked = apiConfig.overwriteContext;
        this.customContextNumber.value = apiConfig.customContext;

        

        this.typeSelector.addEventListener("change", (e: any) => {
            console.debug(confID)

            this.displaySelectedApiBox();

            switch(this.typeSelector.value){
                case 'openai': 
                    this.saveOpenaiConfig();
                break;
                case 'ooba': 
                    this.saveOobaConfig();
                break;
                case 'openrouter': 
                    this.saveOpenrouterConfig();
                break;
                case 'gemini': 
                    this.saveGeminiConfig();
                break;
                case 'glm': 
                    this.saveGlmConfig();
                break;
                case 'custom': 
                    this.saveCustomConfig();
                break;
            }

        });

        this.openaiDiv.addEventListener("change", (e:any) =>{
            this.saveOpenaiConfig();
        })

        this.oobaDiv.addEventListener("change", (e:any) =>{
            this.saveOobaConfig();
        })

        this.openrouterDiv.addEventListener("change", (e:any) =>{
            this.saveOpenrouterConfig();
        })

        this.customDiv.addEventListener("change", (e:any) =>{
            this.saveCustomConfig();
        })

        this.geminiDiv.addEventListener("change", (e:any) =>{
            this.saveGeminiConfig();
        })

        this.glmDiv.addEventListener("change", (e:any) =>{
            this.saveGlmConfig();
        })

        this.testConnectionButton.addEventListener('click', async (e:any) =>{
            //@ts-ignore
            config = await ipcRenderer.invoke('get-config');
            console.debug("--- API SELECTOR: Testing Connection ---");

            // Create a deep copy to avoid modifying the actual config object
            const configToLog = JSON.parse(JSON.stringify(config[this.confID]));
            // Redact sensitive information
            if (configToLog.connection && configToLog.connection.key) {
                configToLog.connection.key = "[REDACTED]";
            }
            console.debug("Using config:", configToLog);
            
            let con = new ApiConnection(config[this.confID].connection, config[this.confID].parameters);

            this.testConnectionSpan.innerText = "...";
            this.testConnectionSpan.style.color = "white";


            con.testConnection().then( (result) =>{

                console.debug("--- API SELECTOR: Test Result ---");
                console.debug(result)

                if(result.success){
                    this.testConnectionSpan.style.color = "green";

                    if(result.overwriteWarning){
                        this.testConnectionSpan.innerText = "Connection valid! Warning: context size couldn't be detected, overwrite context size will be used! (even if disabled!)";
                    }else{
                        this.testConnectionSpan.innerText = "Connection valid!";
                    }
                    


                }
                else{
                    this.testConnectionSpan.innerText = result.errorMessage!;
                    this.testConnectionSpan.style.color = "red";
                }
                
            });
        })

        this.toggleCustomContext();

        this.overwriteContextCheckbox.addEventListener('change', ()=>{
            this.toggleCustomContext();

            ipcRenderer.send('config-change-nested-nested', this.confID, "connection", "overwriteContext", this.overwriteContextCheckbox.checked);
        });

        this.customContextNumber.addEventListener('change', ()=>{
            ipcRenderer.send('config-change-nested-nested', this.confID, "connection", "customContext", this.customContextNumber.value);
        })

         
        
    }

    toggleCustomContext(){
        if(this.overwriteContextCheckbox.checked){
            this.customContextNumber.style.opacity = "1";
            this.customContextNumber.disabled = false;
        }
        else{
            this.customContextNumber.style.opacity = "0.5";
            this.customContextNumber.disabled = true;
        }
    }    

    displaySelectedApiBox(){
        // Hide all divs first for simplicity and to prevent bugs
        this.openaiDiv.style.display = "none";
        this.oobaDiv.style.display = "none";
        this.openrouterDiv.style.display = "none";
        this.customDiv.style.display = "none";
        this.geminiDiv.style.display = "none";
        this.glmDiv.style.display = "none";

        switch (this.typeSelector.value) {
            case 'openai':  
                this.openaiDiv.style.display = "block";
                break;
            case 'ooba':
                this.oobaDiv.style.display = "block";
                break;
            case 'openrouter':
                this.openrouterDiv.style.display = "block";
                break;
            case 'custom':
                this.customDiv.style.display = "block";
                break;
            case 'gemini':
                this.geminiDiv.style.display = "block";
                break;
            case 'glm':
                this.glmDiv.style.display = "block";
                break;
        }
    }

    // 添加一个方法来保存所有API类型的配置
    async saveAllApiConfigs() {
        // 获取当前配置
        let config = await ipcRenderer.invoke('get-config');
        let currentConfig = config[this.confID].connection;
        
        // 创建一个包含所有API类型配置的对象
        const allConfigs = {
            openai: {
                type: "openai",
                baseUrl: "https://api.openai.com/v1",
                key: this.openaiKeyInput.value,
                model: this.openaiModelSelect.value,
                forceInstruct: this.openrouterInstructModeCheckbox.checked,
                overwriteContext: this.overwriteContextCheckbox.checked,
                customContext: this.customContextNumber.value
            },
            ooba: {
                type: "ooba",
                baseUrl: this.oobaUrlInput.value,
                key: "11111111111111111111",
                model: "string",
                forceInstruct: this.openrouterInstructModeCheckbox.checked,
                overwriteContext: this.overwriteContextCheckbox.checked,
                customContext: this.customContextNumber.value
            },
            openrouter: {
                type: "openrouter",
                baseUrl: "https://openrouter.ai/api/v1",
                key: this.openrouterKeyInput.value,
                model: this.openrouterModelInput.value,
                forceInstruct: this.openrouterInstructModeCheckbox.checked,
                overwriteContext: this.overwriteContextCheckbox.checked,
                customContext: this.customContextNumber.value
            },
            gemini: {
                type: "gemini",
                baseUrl: "https://generativelanguage.googleapis.com/v1beta",
                key: this.geminiKeyInput.value,
                model: this.geminiModelInput.value,
                forceInstruct: false,
                overwriteContext: this.overwriteContextCheckbox.checked,
                customContext: this.customContextNumber.value
            },
            glm: {
                type: "glm",
                baseUrl: "https://open.bigmodel.cn/api/paas/v4",
                key: this.glmKeyInput.value,
                model: this.glmModelSelect.value,
                forceInstruct: false,
                overwriteContext: this.overwriteContextCheckbox.checked,
                customContext: this.customContextNumber.value
            },
            custom: {
                type: "custom",
                baseUrl: this.customUrlInput.value,
                key: this.customKeyInput.value,
                model: this.customModelInput.value,
                forceInstruct: false,
                overwriteContext: this.overwriteContextCheckbox.checked,
                customContext: this.customContextNumber.value
            }
        };
        
        // 保留已存在的apiKeys配置（如果有）
        const existingApiKeys = currentConfig.apiKeys || {};
        
        // 合并现有配置和新配置
        for (const [apiType, apiConfig] of Object.entries(allConfigs)) {
            // 如果当前API类型的输入字段有值，则更新配置
            if (apiType === 'openai' && this.openaiKeyInput.value) {
                existingApiKeys[apiType] = apiConfig;
            } else if (apiType === 'ooba' && this.oobaUrlInput.value) {
                existingApiKeys[apiType] = apiConfig;
            } else if (apiType === 'openrouter' && this.openrouterKeyInput.value) {
                existingApiKeys[apiType] = apiConfig;
            } else if (apiType === 'gemini' && this.geminiKeyInput.value) {
                existingApiKeys[apiType] = apiConfig;
            } else if (apiType === 'glm' && this.glmKeyInput.value) {
                existingApiKeys[apiType] = apiConfig;
            } else if (apiType === 'custom' && this.customKeyInput.value) {
                existingApiKeys[apiType] = apiConfig;
            }
            // 如果没有新值但已有配置，则保留旧配置
            else if (existingApiKeys[apiType]) {
                // 保留现有配置
            }
        }
        
        // 为了确保所有API Key都被保存，我们需要扩展配置结构
        // 我们将在配置中添加一个apiKeys字段来存储所有API类型的配置
        const extendedConfig = {
            ...currentConfig,
            apiKeys: existingApiKeys
        };
        
        // 保存扩展后的配置
        ipcRenderer.send('config-change-nested', this.confID, "connection", extendedConfig);
    }

    saveOpenaiConfig(){
        const newConf = {
            type: "openai",
            baseUrl: "https://api.openai.com/v1",
            key: this.openaiKeyInput.value,
            model: this.openaiModelSelect.value,
            forceInstruct: this.openrouterInstructModeCheckbox.checked,
            overwriteContext: this.overwriteContextCheckbox.checked,
            customContext: this.customContextNumber.value
        }

        // 保存当前配置
        ipcRenderer.send('config-change-nested', this.confID, "connection", newConf);
        
        // 同时保存所有API配置以确保Key不会丢失
        this.saveAllApiConfigs();
    }
    

    //OOBA DIV
    saveOobaConfig(){
        const newConf = {
            type: "ooba",
            baseUrl: this.oobaUrlInput.value,
            key: "11111111111111111111",
            model: "string",
            forceInstruct: this.openrouterInstructModeCheckbox.checked,
            overwriteContext: this.overwriteContextCheckbox.checked,
            customContext: this.customContextNumber.value
        }

        // 保存当前配置
        ipcRenderer.send('config-change-nested', this.confID, "connection", newConf);
        
        // 同时保存所有API配置以确保Key不会丢失
        this.saveAllApiConfigs();
    }
    

    //OPENROUTER DIV
    saveOpenrouterConfig(){
        const newConf = {
            type: "openrouter",
            baseUrl: "https://openrouter.ai/api/v1",
            key: this.openrouterKeyInput.value,
            model: this.openrouterModelInput.value,
            forceInstruct: this.openrouterInstructModeCheckbox.checked,
            overwriteContext: this.overwriteContextCheckbox.checked,
            customContext: this.customContextNumber.value
        }
        // 保存当前配置
        ipcRenderer.send('config-change-nested', this.confID, "connection", newConf);
        
        // 同时保存所有API配置以确保Key不会丢失
        this.saveAllApiConfigs();
    }   

    saveCustomConfig(){
        const newConf = {
            type: "custom",
            baseUrl: this.customUrlInput.value,
            key: this.customKeyInput.value,
            model: this.customModelInput.value,
            forceInstruct: false,
            overwriteContext: this.overwriteContextCheckbox.checked,
            customContext: this.customContextNumber.value
        }
        // 保存当前配置
        ipcRenderer.send('config-change-nested', this.confID, "connection", newConf);
        
        // 同时保存所有API配置以确保Key不会丢失
        this.saveAllApiConfigs();
    }  

    saveGeminiConfig(){
        const newConf = {
            type: "gemini",
            baseUrl: "https://generativelanguage.googleapis.com/v1beta",
            key: this.geminiKeyInput.value,
            model: this.geminiModelInput.value,
            forceInstruct: false,
            overwriteContext: this.overwriteContextCheckbox.checked,
            customContext: this.customContextNumber.value
        }
        // 保存当前配置
        ipcRenderer.send('config-change-nested', this.confID, "connection", newConf);
        
        // 同时保存所有API配置以确保Key不会丢失
        this.saveAllApiConfigs();
    }

    saveGlmConfig(){
        const newConf = {
            type: "glm",
            baseUrl: "https://open.bigmodel.cn/api/paas/v4",
            key: this.glmKeyInput.value,
            model: this.glmModelSelect.value,
            forceInstruct: false,
            overwriteContext: this.overwriteContextCheckbox.checked,
            customContext: this.customContextNumber.value
        }
        // 保存当前配置
        ipcRenderer.send('config-change-nested', this.confID, "connection", newConf);
        
        // 同时保存所有API配置以确保Key不会丢失
        this.saveAllApiConfigs();
    }
    
}




customElements.define("config-api-selector", ApiSelector);
