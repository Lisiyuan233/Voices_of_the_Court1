import { ipcRenderer } from 'electron';
import { SUPPORTED_LANGUAGES, LanguageCode, i18n } from '../../shared/i18n';

const template = document.createElement("template");

function defineTemplate() {
    return `
    <link rel="stylesheet" href="../../public/configWindow/config.css">
    <style>
        .language-selector {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .language-selector label {
            font-weight: bold;
            min-width: 80px;
        }
        
        .language-selector select {
            flex: 1;
            background-color: black;
            color: white;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 5px 10px;
        }
        
        .language-selector select:focus {
            outline: none;
            border-color: #666;
        }
    </style>
    <div class="language-selector">
        <label for="language-select">Language</label>
        <select id="language-select">
            ${Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => 
                `<option value="${code}">${name}</option>`
            ).join('')}
        </select>
    </div>
    `;
}

class LanguageSelector extends HTMLElement {
    private shadow: ShadowRoot;
    private select: HTMLSelectElement;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
        template.innerHTML = defineTemplate();
        this.shadow.appendChild(template.content.cloneNode(true));
        this.select = this.shadow.querySelector("#language-select") as HTMLSelectElement;
    }

    async connectedCallback() {
        // 加载当前语言设置
        try {
            const config = await ipcRenderer.invoke('get-config');
            const currentLanguage = config.language || 'en';
            
            if (this.select) {
                this.select.value = currentLanguage;
            }
        } catch (error) {
            console.warn('Failed to load language setting:', error);
        }

        // 添加变更监听器
        this.select.addEventListener('change', this.handleLanguageChange.bind(this));
        
        // 监听语言变更事件，以便在其他地方更改语言时更新选择器
        window.addEventListener('languageChanged', this.handleExternalLanguageChange.bind(this));
        
        // 初始更新标签
        this.updateLabel();
    }

    private async handleLanguageChange(event: Event) {
        const selectedLanguage = this.select.value as LanguageCode;
        
        try {
            // 保存到配置
            await ipcRenderer.invoke('set-config', 'language', selectedLanguage);
            
            // 更新本地化管理器
            await i18n.setLanguage(selectedLanguage);
            
            console.log(`Language changed to: ${selectedLanguage}`);
            
            // 显示成功消息
            this.showMessage('Language changed successfully. Please refresh the page to see changes.', 'success');
            
        } catch (error) {
            console.error('Failed to change language:', error);
            this.showMessage('Failed to change language. Please try again.', 'error');
            
            // 恢复原来的选择
            const config = await ipcRenderer.invoke('get-config');
            this.select.value = config.language || 'en';
        }
    }

    private handleExternalLanguageChange(event: CustomEvent<{ language: LanguageCode }>) {
        const { language } = event.detail;
        if (this.select && this.select.value !== language) {
            this.select.value = language;
        }
    }

    private updateLabel() {
        const label = this.shadow.querySelector('label');
        if (label) {
            // 这里可以使用本地化字符串，但需要确保i18n已经初始化
            label.textContent = 'Language';
        }
    }

    private showMessage(message: string, type: 'success' | 'error' | 'info') {
        // 创建临时消息元素
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            border-radius: 4px;
            z-index: 1000;
            font-size: 14px;
            ${type === 'success' ? 'background-color: #4CAF50; color: white;' : 
              type === 'error' ? 'background-color: #f44336; color: white;' : 
              'background-color: #2196F3; color: white;'}
        `;
        
        document.body.appendChild(messageElement);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }

    disconnectedCallback() {
        window.removeEventListener('languageChanged', this.handleExternalLanguageChange.bind(this));
    }
}

customElements.define("language-selector", LanguageSelector);