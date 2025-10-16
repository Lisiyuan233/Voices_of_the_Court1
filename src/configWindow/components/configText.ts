import { ipcRenderer } from 'electron';
import { Config } from '../../shared/Config';
import { i18n } from '../../shared/i18n';

const template = document.createElement("template");

function defineTemplate(label: string, placeholder: string){
    return `
    <link rel="stylesheet" href="../../public/configWindow/config.css">
    <style>
    </style>
    <div class="input-group">
        <label for="text">${label}</label>
        <input type="text" id="text" placeholder="${placeholder}">
    </div>`
}

    

class ConfigText extends HTMLElement{
    label: string;
    confID: string;
    placeholder: string;
    shadow: any;
    textInput: any;
    labelElement: any;
    i18nLabelKey: string | null;
    i18nPlaceholderKey: string | null;

    constructor(){
        super();
        this.label = this.getAttribute("label")!;
        this.confID = this.getAttribute("confID")!;
        this.placeholder = this.getAttribute("placeholder") || "";
        this.i18nLabelKey = this.getAttribute("data-i18n-label");
        this.i18nPlaceholderKey = this.getAttribute("data-i18n-placeholder");

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.label, this.placeholder);
        this.shadow.append(template.content.cloneNode(true));
        this.textInput = this.shadow.querySelector("input");
        this.labelElement = this.shadow.querySelector("label");

        

    }


    static get observedAttributes(){
        return ["name", "confID", "label", "placeholder", "data-i18n-label", "data-i18n-placeholder"]
    }

    async connectedCallback(){
        const confID: string = this.confID;

        let config = await ipcRenderer.invoke('get-config');

        //@ts-ignore
        this.textInput.value = config[confID] !== undefined ? config[confID] : "";

        this.textInput.addEventListener("change", (e: any) => {
            console.log(confID)

            ipcRenderer.send('config-change', confID, this.textInput.value);
        });

        // 监听语言变更事件
        window.addEventListener('languageChanged', this.updateTexts.bind(this));
        
        // 初始更新文本
        this.updateTexts();
    }

    private updateTexts() {
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

        if (this.i18nPlaceholderKey && this.textInput) {
            const keys = this.i18nPlaceholderKey.split('.');
            let value: any = i18n.t(keys[0] as any);
            
            for (let i = 1; i < keys.length; i++) {
                value = value[keys[i]];
            }
            
            if (typeof value === 'string') {
                this.textInput.placeholder = value;
            }
        }
    }

    disconnectedCallback() {
        window.removeEventListener('languageChanged', this.updateTexts.bind(this));
    }
}




customElements.define("config-text", ConfigText);