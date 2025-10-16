import { ipcRenderer } from 'electron';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'zh-CN': '简体中文',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'ja': '日本語',
  'ko': '한국어',
  'ru': 'Русский'
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// 默认语言
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

// 本地化字符串定义
interface LocalizationStrings {
  // 通用文本
  common: {
    appTitle: string;
    save: string;
    cancel: string;
    apply: string;
    reset: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  
  // 导航菜单
  navigation: {
    connection: string;
    actions: string;
    summarization: string;
    prompts: string;
    settings: string;
    system: string;
  };
  
  // 连接页面
  connection: {
    title: string;
    apiSelector: string;
    ck3PathLabel: string;
    ck3PathTooltip: string;
    selectFolder: string;
    testConnection: string;
  };
  
  // 动作页面
  actions: {
    title: string;
    enableActions: string;
    useSameApi: string;
    parameters: string;
    selectActions: string;
    reloadFiles: string;
    openFolder: string;
  };
  
  // 摘要页面
  summarization: {
    title: string;
    useSameApi: string;
    parameters: string;
  };
  
  // 提示页面
  prompts: {
    title: string;
    mainPrompt: string;
    selfTalkPrompt: string;
    summarizePrompt: string;
    selfTalkSummarizePrompt: string;
    memoriesPrompt: string;
    suffixPrompt: string;
    enableSuffixPrompt: string;
    suffixPromptTooltip: string;
    scripts: string;
    scriptsTooltip: string;
    descriptionScript: string;
    exampleMessagesScript: string;
    reloadFiles: string;
    openFolder: string;
  };
  
  // 设置页面
  settings: {
    title: string;
    maxTokens: string;
    maxMemoryTokens: string;
    streamMessages: string;
    cleanMessages: string;
    cleanMessagesTooltip: string;
    summariesInsertDepth: string;
    memoriesInsertDepth: string;
    descInsertDepth: string;
    instructSettings: string;
    inputSequence: string;
    outputSequence: string;
    textGenerationParameters: string;
    temperature: string;
    topP: string;
    frequencyPenalty: string;
    presencePenalty: string;
    percentOfContextToSummarize: string;
  };
  
  // 系统页面
  system: {
    title: string;
    update: string;
    currentVersion: string;
    checkUpdates: string;
    checkUpdatesOnStartup: string;
    logFiles: string;
    logFilesDescription: string;
    openLogsFolder: string;
    clearSummaries: string;
    clearSummariesDescription: string;
    clearSummariesButton: string;
    discord: string;
    patreon: string;
    topContributors: string;
  };
  
  // API选择器
  apiSelector: {
    api: string;
    openrouter: string;
    ooba: string;
    openai: string;
    gemini: string;
    custom: string;
    apiKey: string;
    model: string;
    browseModels: string;
    forceInstructMode: string;
    serverUrl: string;
    overwriteContext: string;
    customContext: string;
    temperature: string;
    frequencyPenalty: string;
    presencePenalty: string;
    topP: string;
  };
  
  // 聊天窗口
  chat: {
    placeholder: string;
    leaveButton: string;
  };
}

// 英语（默认）本地化字符串
const ENGLISH_STRINGS: LocalizationStrings = {
  common: {
    appTitle: 'Voices of the Court',
    save: 'Save',
    cancel: 'Cancel',
    apply: 'Apply',
    reset: 'Reset',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info'
  },
  navigation: {
    connection: 'Connection',
    actions: 'Actions',
    summarization: 'Summarization',
    prompts: 'Prompts',
    settings: 'Settings',
    system: 'System'
  },
  connection: {
    title: 'Connection',
    apiSelector: 'API',
    ck3PathLabel: 'CK3 user folder path',
    ck3PathTooltip: 'Here you need to select the CK3 folder where your user data are stored, not where the game files are! By default it stored in your user documents, inside the Paradox interactive folder',
    selectFolder: 'Select Folder',
    testConnection: 'Test Connection'
  },
  actions: {
    title: 'Actions',
    enableActions: 'Enable actions',
    useSameApi: 'Use the same API as in the connection tab',
    parameters: 'Parameters',
    selectActions: 'Select which actions you want the mod to detect:',
    reloadFiles: '🔄 Reload files',
    openFolder: 'open folder'
  },
  summarization: {
    title: 'Summarization',
    useSameApi: 'Use the same API as in the connection tab',
    parameters: 'Parameters'
  },
  prompts: {
    title: 'Prompts',
    mainPrompt: 'Main prompt',
    selfTalkPrompt: 'Self-Talk Prompt',
    summarizePrompt: 'Summarize prompt',
    selfTalkSummarizePrompt: 'Self-Talk Summarize prompt',
    memoriesPrompt: 'Memories prompt',
    suffixPrompt: 'Suffix prompt',
    enableSuffixPrompt: 'Suffix prompt',
    suffixPromptTooltip: 'If enabled, suffix prompt is inserted as the last (system) message before sending the API request, it\'s useful for jailbreaking, or instructing the model to behave in a certain way',
    scripts: 'Scripts',
    scriptsTooltip: 'Some prompts are too advanced to be made up by static texts, they require script files that dynamically writes the prompts based on the ingame variables.',
    descriptionScript: 'Character Description script',
    exampleMessagesScript: 'Example messages script',
    reloadFiles: '🔄 Reload files',
    openFolder: 'open folder'
  },
  settings: {
    title: 'Settings',
    maxTokens: 'max new tokens',
    maxMemoryTokens: 'max memory tokens',
    streamMessages: 'stream messages',
    cleanMessages: 'clean Messages',
    cleanMessagesTooltip: 'The mod will try to remove parts of the messages that the llm shouldn\'t have generated, like emojis',
    summariesInsertDepth: 'Summaries insert depth',
    memoriesInsertDepth: 'Memories insert depth',
    descInsertDepth: 'Char desc insert depth',
    instructSettings: 'Instruct settings',
    inputSequence: 'Input sequence',
    outputSequence: 'output sequence',
    textGenerationParameters: 'Text-generation parameters',
    temperature: 'Temperature',
    topP: 'Top P',
    frequencyPenalty: 'Frequency penalty',
    presencePenalty: 'Presence penalty',
    percentOfContextToSummarize: 'Percent of context to summarize'
  },
  system: {
    title: 'System',
    update: 'Update',
    currentVersion: 'Current app version: ',
    checkUpdates: 'Check for updates..',
    checkUpdatesOnStartup: 'Check for updates on startup',
    logFiles: 'Log files',
    logFilesDescription: 'If you experience errors/crashes, send the logs to our discord server',
    openLogsFolder: 'open log files folder',
    clearSummaries: 'Clear conversation summaries',
    clearSummariesDescription: 'This will delete the summaries of previous conversations of all characters',
    clearSummariesButton: 'Clear Summaries',
    discord: 'Discord',
    patreon: 'Patreon',
    topContributors: 'Top Contributors this month:'
  },
  apiSelector: {
    api: 'API',
    openrouter: 'OpenRouter',
    ooba: 'Text Gen WebUI (ooba)',
    openai: 'OpenAI',
    gemini: 'Google Gemini',
    custom: 'Custom (OpenAI-compatible)',
    apiKey: 'API Key',
    model: 'Model',
    browseModels: 'Browse models..',
    forceInstructMode: 'Force Instruct mode',
    serverUrl: 'Server URL',
    overwriteContext: 'Overwrite context size',
    customContext: 'Custom context',
    temperature: 'Temperature',
    frequencyPenalty: 'Frequency penalty',
    presencePenalty: 'Presence penalty',
    topP: 'Top P'
  },
  chat: {
    placeholder: 'Write a message...',
    leaveButton: 'End conversation'
  }
};

// 简体中文本地化字符串
const CHINESE_STRINGS: LocalizationStrings = {
  common: {
    appTitle: '法庭之声',
    save: '保存',
    cancel: '取消',
    apply: '应用',
    reset: '重置',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息'
  },
  navigation: {
    connection: '连接',
    actions: '动作',
    summarization: '摘要',
    prompts: '提示',
    settings: '设置',
    system: '系统'
  },
  connection: {
    title: '连接',
    apiSelector: 'API',
    ck3PathLabel: 'CK3用户文件夹路径',
    ck3PathTooltip: '这里您需要选择存储用户数据的CK3文件夹，而不是游戏文件所在的位置！默认情况下，它存储在您的用户文档中，位于Paradox Interactive文件夹内',
    selectFolder: '选择文件夹',
    testConnection: '测试连接'
  },
  actions: {
    title: '动作',
    enableActions: '启用动作',
    useSameApi: '使用与连接标签页相同的API',
    parameters: '参数',
    selectActions: '选择您希望模组检测的动作：',
    reloadFiles: '🔄 重新加载文件',
    openFolder: '打开文件夹'
  },
  summarization: {
    title: '摘要',
    useSameApi: '使用与连接标签页相同的API',
    parameters: '参数'
  },
  prompts: {
    title: '提示',
    mainPrompt: '主提示',
    selfTalkPrompt: '自言自语提示',
    summarizePrompt: '摘要提示',
    selfTalkSummarizePrompt: '自言自语摘要提示',
    memoriesPrompt: '记忆提示',
    suffixPrompt: '后缀提示',
    enableSuffixPrompt: '后缀提示',
    suffixPromptTooltip: '如果启用，后缀提示将在发送API请求之前作为最后一条（系统）消息插入，这对于越狱或指示模型以特定方式行为很有用',
    scripts: '脚本',
    scriptsTooltip: '有些提示过于复杂，无法由静态文本组成，它们需要基于游戏变量动态编写提示的脚本文件。',
    descriptionScript: '角色描述脚本',
    exampleMessagesScript: '示例消息脚本',
    reloadFiles: '🔄 重新加载文件',
    openFolder: '打开文件夹'
  },
  settings: {
    title: '设置',
    maxTokens: '最大新令牌数',
    maxMemoryTokens: '最大记忆令牌数',
    streamMessages: '流式消息',
    cleanMessages: '清理消息',
    cleanMessagesTooltip: '模组将尝试删除LLM不应生成的消息部分，如表情符号',
    summariesInsertDepth: '摘要插入深度',
    memoriesInsertDepth: '记忆插入深度',
    descInsertDepth: '角色描述插入深度',
    instructSettings: '指令设置',
    inputSequence: '输入序列',
    outputSequence: '输出序列',
    textGenerationParameters: '文本生成参数',
    temperature: '温度',
    topP: 'Top P',
    frequencyPenalty: '频率惩罚',
    presencePenalty: '存在惩罚',
    percentOfContextToSummarize: '上下文摘要百分比'
  },
  system: {
    title: '系统',
    update: '更新',
    currentVersion: '当前应用版本：',
    checkUpdates: '检查更新...',
    checkUpdatesOnStartup: '启动时检查更新',
    logFiles: '日志文件',
    logFilesDescription: '如果您遇到错误/崩溃，请将日志发送到我们的Discord服务器',
    openLogsFolder: '打开日志文件夹',
    clearSummaries: '清除对话摘要',
    clearSummariesDescription: '这将删除所有角色先前对话的摘要',
    clearSummariesButton: '清除摘要',
    discord: 'Discord',
    patreon: 'Patreon',
    topContributors: '本月顶级贡献者：'
  },
  apiSelector: {
    api: 'API',
    openrouter: 'OpenRouter',
    ooba: '文本生成WebUI (ooba)',
    openai: 'OpenAI',
    gemini: 'Google Gemini',
    custom: '自定义 (OpenAI兼容)',
    apiKey: 'API密钥',
    model: '模型',
    browseModels: '浏览模型...',
    forceInstructMode: '强制指令模式',
    serverUrl: '服务器URL',
    overwriteContext: '覆盖上下文大小',
    customContext: '自定义上下文',
    temperature: '温度',
    frequencyPenalty: '频率惩罚',
    presencePenalty: '存在惩罚',
    topP: 'Top P'
  },
  chat: {
    placeholder: '写一条消息...',
    leaveButton: '结束对话'
  }
};

// 其他语言的本地化字符串可以在这里添加

// 所有语言的字符串映射
const LOCALIZATION_STRINGS: Record<LanguageCode, LocalizationStrings> = {
  'en': ENGLISH_STRINGS,
  'zh-CN': CHINESE_STRINGS,
  'es': ENGLISH_STRINGS, // 暂时使用英语，后续可以添加西班牙语
  'fr': ENGLISH_STRINGS, // 暂时使用英语，后续可以添加法语
  'de': ENGLISH_STRINGS, // 暂时使用英语，后续可以添加德语
  'ja': ENGLISH_STRINGS, // 暂时使用英语，后续可以添加日语
  'ko': ENGLISH_STRINGS, // 暂时使用英语，后续可以添加韩语
  'ru': ENGLISH_STRINGS  // 暂时使用英语，后续可以添加俄语
};

// 本地化管理器类
export class I18nManager {
  private currentLanguage: LanguageCode = DEFAULT_LANGUAGE;

  constructor() {
    this.loadLanguageFromConfig();
  }

  // 从配置加载语言设置
  private async loadLanguageFromConfig() {
    try {
      const config = await ipcRenderer.invoke('get-config');
      const language = config.language || DEFAULT_LANGUAGE;
      
      if (language in SUPPORTED_LANGUAGES) {
        this.currentLanguage = language as LanguageCode;
      }
    } catch (error) {
      console.warn('Failed to load language from config, using default:', error);
    }
  }

  // 获取当前语言
  getCurrentLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  // 设置语言
  async setLanguage(language: LanguageCode) {
    if (language in SUPPORTED_LANGUAGES) {
      this.currentLanguage = language;
      
      // 保存到配置
      try {
        await ipcRenderer.invoke('set-config', 'language', language);
      } catch (error) {
        console.warn('Failed to save language to config:', error);
      }
      
      // 触发语言变更事件
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language } 
      }));
    }
  }

  // 获取本地化字符串
  t<K extends keyof LocalizationStrings>(key: K): LocalizationStrings[K] {
    return LOCALIZATION_STRINGS[this.currentLanguage][key];
  }

  // 获取支持的语言列表
  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }
}

// 全局实例
export const i18n = new I18nManager();

// 便捷函数
export function t<K extends keyof LocalizationStrings>(key: K): LocalizationStrings[K] {
  return i18n.t(key);
}

// 语言变更事件类型
declare global {
  interface WindowEventMap {
    'languageChanged': CustomEvent<{ language: LanguageCode }>;
  }
}