import {ipcRenderer } from 'electron';
import { Config } from '../../shared/Config';
import { i18n } from '../../shared/i18n';

const template = document.createElement("template");

function defineTemplate(label: string){
    return `
    <link rel="stylesheet" href="../../public/configWindow/config.css">
    <style>
    </style>
    <input type="checkbox" name="awd" id="checkbox">
    <label for="awd">${label}</label>`
}

    

class ConfigCheckbox extends HTMLElement{
    label: string;
    confID: string;
    shadow: any;
    checkbox: any;
    labelElement: any;
    i18nLabelKey: string | null;

    constructor(){
        super();
        this.label = this.getAttribute("label")!;
        this.confID = this.getAttribute("confID")!;
        this.i18nLabelKey = this.getAttribute("data-i18n-label");

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.label);
        this.shadow.append(template.content.cloneNode(true));
        this.checkbox = this.shadow.querySelector("input");
        this.labelElement = this.shadow.querySelector("label");

        

    }


    static get observedAttributes(){
        return ["name", "confID", "label", "data-i18n-label"]
    }

    async connectedCallback(){
        const confID: string = this.confID;

        let config = await ipcRenderer.invoke('get-config');

        //@ts-ignore
        this.checkbox.checked = config[confID] !== undefined ? config[confID] : true; // Default to true

        this.checkbox.addEventListener("change", (e: any) => {
            console.log(confID)

            ipcRenderer.send('config-change', confID, this.checkbox.checked);
        });

        // 监听语言变更事件
        window.addEventListener('languageChanged', this.updateLabel.bind(this));
        
        // 初始更新标签
        this.updateLabel();
    }

    private updateLabel() {
        if (this.i18nLabelKey && this.labelElement) {
            const keys = this.i18nLabelKey.split('.');
            let value: any = i18n.t(keys[0] as any);
            
            for (let i = 1; i < keys.length; i++) {
                value = value[keys[i]];
            }
            
            if (typeof value === 'string') {
                this.labelElement.textContent = value;
            }
        }
    }

    disconnectedCallback() {
        window.removeEventListener('languageChanged', this.updateLabel.bind(this));
    }
}




customElements.define("config-checkbox", ConfigCheckbox);
