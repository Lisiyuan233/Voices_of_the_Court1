import {ipcRenderer } from 'electron';
import { Config } from '../../shared/Config';
import { i18n } from '../../shared/i18n';
const template = document.createElement("template");

function defineTemplate(label: string, rows: string){
    return `
    <link rel="stylesheet" href="../../public/configWindow/config.css">
    <style>
    </style>
    <div class="input-group">
        <label for="textarea">${label}</label>
        <textarea id="textarea" rows="${rows}"></textarea>
    </div>`
}

    

class ConfigTextarea extends HTMLElement{
    label: string;
    confID: string;
    rows: string;
    shadow: any;
    textarea: any;
    labelElement: any;
    i18nLabelKey: string | null;

    constructor(){
        super();
        this.label = this.getAttribute("label")!;
        this.confID = this.getAttribute("confID")!;
        this.rows = this.getAttribute("rows")!;
        this.i18nLabelKey = this.getAttribute("data-i18n-label");

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.label, this.rows);
        this.shadow.append(template.content.cloneNode(true));
        this.textarea = this.shadow.querySelector("textarea");
        this.labelElement = this.shadow.querySelector("label");

        

    }


    static get observedAttributes(){
        return ["label", "confID", "rows", "data-i18n-label"]
    }

    async connectedCallback(){
        const confID: string = this.confID;

        let config = await ipcRenderer.invoke('get-config');

        //@ts-ignore
        this.textarea.value = config[confID] !== undefined ? config[confID] : "";

        this.textarea.addEventListener("change", (e: any) => {
            console.log(confID)

            ipcRenderer.send('config-change', confID, this.textarea.value);
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




customElements.define("config-textarea", ConfigTextarea);