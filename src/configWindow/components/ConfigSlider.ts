import {ipcRenderer } from 'electron';
import { Config } from '../../shared/Config';
import { i18n } from '../../shared/i18n';

const template = document.createElement("template");

function defineTemplate(min: number, max: number, step: number){
    return `
    <link rel="stylesheet" href="../../public/configWindow/config.css">
    <style>
    </style>
    <div>
        <label for="awd"></label><br>
        <input type="range" id="slider"  min=${min} max=${max} step=${step}>
        <input type="number" id="number" min=${min} max=${max} />
        <button type="button" id="button">Reset</button>
    </div>
    
    `

    
}

    

class ConfigSlider extends HTMLElement{
    label: string;
    confID: string;
    shadow: any;
    slider: any;
    number: any;
    button: any;
    min: number;
    max: number;
    default: number;
    step: number;
    labelElement: any;
    i18nLabelKey: string | null;

    constructor(){
        super();
        this.label = this.getAttribute("label")!;
        this.confID = this.getAttribute("confID")!;
        this.min =  parseFloat(this.getAttribute("min")!);
        this.max = parseFloat(this.getAttribute("max")!);
        this.step = parseFloat(this.getAttribute("step")!);
        this.default = parseFloat(this.getAttribute("default")!);
        this.i18nLabelKey = this.getAttribute("data-i18n-label");

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.min, this.max, this.step);
        this.shadow.append(template.content.cloneNode(true));
        this.slider = this.shadow.querySelector('#slider');
        this.number = this.shadow.querySelector("#number");
        this.button = this.shadow.querySelector("#button");
        this.labelElement = this.shadow.querySelector("label");

        

    }


    static get observedAttributes(){
        return ["confID", "label", "min", "max", "step", "default", "data-i18n-label"]
    }

    async connectedCallback(){
        const confID: string = this.confID;

        let config = await ipcRenderer.invoke('get-config');

        //@ts-ignore
        const value = config[confID];

        if(value !== undefined){
            this.changeValue(value);
        }
        else{
            this.changeValue(this.default);
        }

        this.slider.addEventListener("input", (e: any) => {
            this.number.value = this.slider.value;
        })

        this.slider.addEventListener("change", (e: any) => {

            this.number.value = this.slider.value;

        });

        this.number.addEventListener("change", (e: any) => {
            console.debug(confID)

            this.slider.value = this.number.value;

        });

        this.button.addEventListener("click", (e: any) => {
            this.changeValue(this.default)

        })

        // 监听语言变更事件
        window.addEventListener('languageChanged', this.updateLabel.bind(this));
        
        // 初始更新标签
        this.updateLabel();
    }

    changeValue(newValue: number){
        this.slider.value = newValue;
        this.number.value = newValue;
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




customElements.define("config-slider", ConfigSlider);
