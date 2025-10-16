import { ipcRenderer } from 'electron';
import { Config } from '../../shared/Config';
import { i18n } from '../../shared/i18n';

const template = document.createElement("template");

function defineTemplate(){
    return `
    <link rel="stylesheet" href="../../public/configWindow/config.css">
    <style>
    </style>
    <label for="awd"></label><br>
    <input type="number" name="awd">`
    
}

    

class ConfigNumber extends HTMLElement{
    label: string;
    confID: string;
    shadow: any;
    input: any;
    min: number;
    max: number;
    labelElement: HTMLLabelElement;
    i18nLabelKey: string | null;

    constructor(){
        super();
        this.label = this.getAttribute("label")!;
        this.confID = this.getAttribute("confID")!;
        this.min =  parseInt(this.getAttribute("min")!);
        this.max = parseInt(this.getAttribute("max")!);
        this.i18nLabelKey = this.getAttribute("data-i18n-label");

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate();
        this.shadow.append(template.content.cloneNode(true));
        this.input = this.shadow.querySelector("input");
        this.labelElement = this.shadow.querySelector("label");

        // 设置输入框属性
        this.input.min = this.min;
        this.input.max = this.max;

        // 更新标签文本
        this.updateLabel();

        

    }

    // 更新标签文本
    updateLabel() {
        if (this.i18nLabelKey) {
            const keys = this.i18nLabelKey.split('.');
            let value: any = i18n.t(keys[0] as any);
            
            for (let i = 1; i < keys.length; i++) {
                if (value && typeof value === 'object') {
                    value = value[keys[i]];
                } else {
                    break;
                }
            }
            
            if (typeof value === 'string') {
                this.labelElement.textContent = value;
            } else {
                this.labelElement.textContent = this.label;
            }
        } else {
            this.labelElement.textContent = this.label;
        }
    }

    static get observedAttributes(){
        return ["name", "confID", "label", "min", "max", "data-i18n-label"]
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'data-i18n-label' && oldValue !== newValue) {
            this.i18nLabelKey = newValue;
            this.updateLabel();
        }
    }

    async connectedCallback(){
        const confID: string = this.confID;

        let config = await ipcRenderer.invoke('get-config');

        //@ts-ignore
        this.input.value = config[confID];

        this.input.addEventListener("change", (e: any) => {
            console.log(confID)

            ipcRenderer.send('config-change', confID, parseInt(this.input.value));
        });

        // 监听语言变更事件
        window.addEventListener('languageChanged', this.handleLanguageChange.bind(this));
    }

    disconnectedCallback() {
        // 清理事件监听器
        window.removeEventListener('languageChanged', this.handleLanguageChange.bind(this));
    }

    private handleLanguageChange() {
        this.updateLabel();
    }
}




customElements.define("config-number", ConfigNumber);