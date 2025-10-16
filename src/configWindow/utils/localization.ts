import { i18n } from '../../shared/i18n';

/**
 * 本地化元素文本
 */
export function localizeElement(element: HTMLElement): void {
  // 处理data-i18n属性
  const i18nKey = element.getAttribute('data-i18n');
  if (i18nKey) {
    const keys = i18nKey.split('.');
    let value: any = i18n.t(keys[0] as any);
    
    for (let i = 1; i < keys.length; i++) {
      if (value && typeof value === 'object') {
        value = value[keys[i]];
      } else {
        break;
      }
    }
    
    if (typeof value === 'string') {
      element.textContent = value;
    }
  }

  // 处理data-i18n-placeholder属性
  const placeholderKey = element.getAttribute('data-i18n-placeholder');
  if (placeholderKey && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    const keys = placeholderKey.split('.');
    let value: any = i18n.t(keys[0] as any);
    
    for (let i = 1; i < keys.length; i++) {
      if (value && typeof value === 'object') {
        value = value[keys[i]];
      } else {
        break;
      }
    }
    
    if (typeof value === 'string') {
      element.placeholder = value;
    }
  }

  // 处理data-i18n-alt属性
  const altKey = element.getAttribute('data-i18n-alt');
  if (altKey && element instanceof HTMLImageElement) {
    const keys = altKey.split('.');
    let value: any = i18n.t(keys[0] as any);
    
    for (let i = 1; i < keys.length; i++) {
      if (value && typeof value === 'object') {
        value = value[keys[i]];
      } else {
        break;
      }
    }
    
    if (typeof value === 'string') {
      element.alt = value;
    }
  }

  // 递归处理子元素
  element.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-alt]').forEach(child => {
    localizeElement(child as HTMLElement);
  });
}

/**
 * 本地化整个文档
 */
export function localizeDocument(): void {
  localizeElement(document.documentElement);
}

/**
 * 初始化本地化系统
 */
export function initializeLocalization(): void {
  // 初始本地化
  localizeDocument();

  // 监听语言变更事件
  window.addEventListener('languageChanged', (event) => {
    console.log('Language changed to:', event.detail.language);
    localizeDocument();
  });
}