import { ipcRenderer, shell } from 'electron';
import { Config } from '../../shared/Config';
import { i18n } from '../../shared/i18n';
import path from 'path';

const template = document.createElement("template");

function defineTemplate(path: string, label: string){
    return `
    <link rel="stylesheet" href="../../public/configWindow/config.css">
    <style>
    </style>
    <button type="button" data-i18n="${label}">${label}</button>
    `
}

    

class openFolderButton extends HTMLElement{
    path: string;
    label: string;
    shadow: any;
    button: any;
    i18nLabelKey: string | null;

    constructor(){
        super();
        this.path = this.getAttribute("path")!;
        this.label = this.getAttribute("label")!;
        this.i18nLabelKey = this.getAttribute("data-i18n");

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.path, this.label);
        this.shadow.append(template.content.cloneNode(true));
        this.button = this.shadow.querySelector("button");

        

    }


    static get observedAttributes(){
        return ["name", "confID", "path", "label", "data-i18n"]
    }

    async connectedCallback(){

       let userdataPath = await ipcRenderer.invoke('get-userdata-path');

        this.button.addEventListener("click", (e: any) => {
            
            
            //ipcRenderer.send('open-folder', this.path);
            shell.openPath(path.resolve(path.join(userdataPath, this.path)));
        }); 

        // 监听语言变更事件
        window.addEventListener('languageChanged', this.updateLabel.bind(this));
        
        // 初始更新标签
        this.updateLabel();
    }

    private updateLabel() {
        if (this.i18nLabelKey && this.button) {
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
                this.button.textContent = value;
            }
        }
    }

    disconnectedCallback() {
        window.removeEventListener('languageChanged', this.updateLabel.bind(this));
    }
}




customElements.define("open-folder-button", openFolderButton);