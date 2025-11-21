import { ipcRenderer } from 'electron';
import {ActionResponse, Message} from '../main/ts/conversation_interfaces.js';
import { marked } from 'marked';
import { GameData } from '../shared/gameData/GameData.js';
const DOMPurify = require('dompurify');

const sanitizeConfig = {
    ALLOWED_TAGS: ['em', 'strong'], 
    KEEP_CONTENT: true, 
  };

hideChat();


let chatMessages: HTMLDivElement = document.querySelector('.messages')!;
let chatInput: HTMLInputElement= document.querySelector('.chat-input')!;
let leaveButton: HTMLButtonElement = document.querySelector('.leave-button')!;
let suggestionsButton: HTMLButtonElement = document.querySelector('.suggestions-button')!;
let suggestionsContainer: HTMLDivElement = document.querySelector('.suggestions-container')!;
let suggestionsList: HTMLDivElement = document.querySelector('.suggestions-list')!;
let suggestionsClose: HTMLButtonElement = document.querySelector('.suggestions-close')!;
let loadingDots: any;

let playerName: string;
let aiName: string;
let showSuggestionsButton: boolean = true; // 默认显示建议按钮


async function initChat(){
    
    chatMessages.innerHTML = '';
    chatInput.innerHTML = '';
    chatInput.disabled = false;
    
    // 根据配置显示或隐藏建议按钮
    if (suggestionsButton) {
        suggestionsButton.style.display = showSuggestionsButton ? 'block' : 'none';
    }
}

async function displayMessage(message: Message): Promise<HTMLDivElement>{

    if(message.content.startsWith(message.name+":")){
        message.content = message.content.slice(message.name!.length+1);
    }

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    switch (message.role){
        case 'user':
            messageDiv.classList.add('player-message');
            messageDiv.innerHTML = DOMPurify.sanitize(await marked.parseInline(`**${message.name}:** ${message.content}`), sanitizeConfig);
            break;
        case 'assistant':
            removeLoadingDots();
            messageDiv.classList.add('ai-message');
            messageDiv.innerHTML = DOMPurify.sanitize(await marked.parseInline(`**${message.name}:** ${message.content}`), sanitizeConfig);

            break;
    };   
    chatMessages.append(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}

function displayNarrative(narrative: string) {
    if (!narrative) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add('narrative-message');
    
    const narrativeSpan = document.createElement('span');
    narrativeSpan.innerText = narrative;
    messageDiv.appendChild(narrativeSpan);
    
    chatMessages.append(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displayActions(actions: ActionResponse[]){
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    for(const action of actions){
        
        const ActionSpan = document.createElement('span');
        ActionSpan.innerText = action.chatMessage+"\n";
        ActionSpan.classList.add(action.chatMessageClass);
        messageDiv.appendChild(ActionSpan);

        
    }
    
    chatMessages.append(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; 
}

function displayErrorMessage(error: string){
    removeLoadingDots();
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    messageDiv.classList.add('error-message');
    messageDiv.innerText = error;
    chatMessages.append(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}



chatInput.addEventListener('keydown', async function(e) {    
    if(e.which == 13) { //on enter
        e.preventDefault(); //disallow newlines   
        if(chatInput.value != ''){
            const messageText = chatInput.value;
            chatInput.value = ''

            let message: Message = {
                role: "user",
                name: playerName,
                content: messageText
            }

            await displayMessage(message);
            showLoadingDots();
            ipcRenderer.send('message-send', message);

        };
    };
});

async function replaceLastMessage(message: Message){
    chatMessages.lastElementChild!.innerHTML = DOMPurify.sanitize((await marked.parseInline(`**${message.name}:** ${message.content}*`)).replace(/\*/g, ''), sanitizeConfig);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showLoadingDots(){  //and disable chat
    loadingDots = document.createElement('div');
    loadingDots.classList.add('loading');
    chatMessages.append(loadingDots);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatInput.disabled = true;
}

function removeLoadingDots(){
    loadingDots?.remove();
    chatInput.disabled = false;
}

// 显示推荐输入语句
function displaySuggestions(suggestions: string[]) {
    // 清空之前的推荐
    suggestionsList.innerHTML = ''
    
    // 如果没有推荐，显示提示信息
    if (suggestions.length === 0) {
        const noSuggestionsItem = document.createElement('div')
        noSuggestionsItem.className = 'suggestion-item'
        noSuggestionsItem.textContent = '暂无推荐输入语句'
        suggestionsList.appendChild(noSuggestionsItem)
    } else {
        // 添加每个推荐语句
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div')
            suggestionItem.className = 'suggestion-item'
            suggestionItem.textContent = suggestion
            
            // 点击推荐语句时，将其填入输入框
            suggestionItem.addEventListener('click', () => {
                // 处理建议文本：移除引号和前面的序号
                let processedText = suggestion
                    .replace(/^["'"]/, '') // 移除开头的引号
                    .replace(/["'"]$/, '') // 移除结尾的引号
                    .replace(/^\d+\.\s*/, ''); // 移除开头的序号（如"1. "）
                
                chatInput.value = processedText
                suggestionsContainer.style.display = 'none'
                chatInput.focus()
            })
            
            suggestionsList.appendChild(suggestionItem)
        })
    }
    
    // 显示推荐容器
    suggestionsContainer.style.display = 'block'
}

function hideChat(){
    document.body.style.display = 'none';
}

leaveButton.addEventListener("click", ()=>{
    hideChat();
    chatMessages.innerHTML = '';
    chatInput.innerHTML = '';
    ipcRenderer.send('chat-stop');
});

    // 推荐输入语句功能事件处理
    suggestionsButton.addEventListener('click', () => {
        ipcRenderer.send('get-suggestions')
    })

    suggestionsClose.addEventListener('click', () => {
        suggestionsContainer.style.display = 'none'
    })

    // 监听推荐输入语句响应
    ipcRenderer.on('suggestions-response', (event, suggestions) => {
        displaySuggestions(suggestions)
    })

// 监听配置变更
    ipcRenderer.on('config-change', (event, key, value) => {
        if (key === 'showSuggestionsButton') {
            showSuggestionsButton = value;
            if (suggestionsButton) {
                suggestionsButton.style.display = showSuggestionsButton ? 'block' : 'none';
            }
        }
    })

//IPC Events

ipcRenderer.on('chat-show', () =>{
    document.body.style.display = '';
})

ipcRenderer.on('chat-hide', () =>{
    hideChat();
})

ipcRenderer.on('chat-start', async (e, gameData: GameData) =>{   
    playerName = gameData.playerName.replace(/\s+/g, '');
    aiName = gameData.aiName;
    
    // 获取配置并设置建议按钮的显示状态
    try {
        const config = await ipcRenderer.invoke('get-config');
        showSuggestionsButton = config.showSuggestionsButton !== undefined ? config.showSuggestionsButton : true;
    } catch (error) {
        console.error('Error getting config:', error);
        showSuggestionsButton = true; // 默认显示
    }
    
    initChat();
    document.body.style.display = '';
})

ipcRenderer.on('message-receive', async (e, message: Message, waitForActions: boolean)=>{
    await displayMessage(message);
    console.log("wait: "+waitForActions)

    if(!waitForActions){
        removeLoadingDots();
    }else{
        showLoadingDots();
    }

    
})

ipcRenderer.on('actions-receive', async (e, actionsResponse: ActionResponse[], narrative: string) =>{
    displayActions(actionsResponse);
    displayNarrative(narrative);

    removeLoadingDots();
})

ipcRenderer.on('stream-start', async (e, gameData)=>{
    let streamMessage = document.createElement('div');
    streamMessage.classList.add('message');
    streamMessage.classList.add('ai-message');
    chatMessages.append(streamMessage);
})

ipcRenderer.on('stream-message', (e, message: Message)=>{
    removeLoadingDots();
    replaceLastMessage(message);
    showLoadingDots();
    //@ts-ignore
})

ipcRenderer.on('stream-end', (e, actions: ActionResponse[], narrative: string) =>{
    displayActions(actions);
    displayNarrative(narrative);
    removeLoadingDots();
})

ipcRenderer.on('error-message', (e, errorMessage: string) =>{
    displayErrorMessage(errorMessage);
})

// 监听场景描述事件
ipcRenderer.on('scene-description', (e, sceneDescription: string) =>{
    if (sceneDescription && sceneDescription.trim()) {
        // 创建场景描述消息元素
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add('scene-description-message');
        
        // 创建场景描述内容
        const sceneDescSpan = document.createElement('span');
        sceneDescSpan.innerText = sceneDescription;
        sceneDescSpan.classList.add('scene-description-text');
        
        messageDiv.appendChild(sceneDescSpan);
        
        // 将场景描述插入到消息列表的开头
        chatMessages.insertBefore(messageDiv, chatMessages.firstChild);
        
        console.log(`Scene description displayed: ${sceneDescription.substring(0, 50)}...`);
    }
})


