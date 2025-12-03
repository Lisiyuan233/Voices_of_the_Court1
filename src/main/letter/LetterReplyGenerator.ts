import { ApiConnection } from "../../shared/apiConnection";
import { GameData } from "../../shared/gameData/GameData";
import { Config } from "../../shared/Config";
import { Message } from "../ts/conversation_interfaces";
import { app } from 'electron';
import * as fs from "fs";
import * as path from "path";

export class LetterReplyGenerator {
    private apiConnection: ApiConnection;
    private config: Config;

    constructor(config: Config) {
        this.config = config;
        
        // 创建API连接
        this.apiConnection = new ApiConnection(
            config.textGenerationApiConnectionConfig.connection,
            config.textGenerationApiConnectionConfig.parameters
        );
    }

    /**
     * 从debug.log中提取玩家信件内容
     * @param debugLogPath debug.log文件路径
     * @returns 提取到的信件内容，如果未找到则返回null
     */
    private extractLetterContent(debugLogPath: string): { language: string; content: string; letterId: string } | null {
        try {
            if (!fs.existsSync(debugLogPath)) {
                console.error(`Debug log file not found at: ${debugLogPath}`);
                return null;
            }

            const fileContent = fs.readFileSync(debugLogPath, 'utf8');
            
            // 查找最后一条VOTC:LETTER记录，包含letter_id参数
            const letterPattern = /VOTC:LETTER\/;\/([^\/]+)\/;\/([^\/]+)\/;\/([^\/]+)/g;
            const matches = [...fileContent.matchAll(letterPattern)];
            
            if (matches.length === 0) {
                console.log('No VOTC:LETTER entries found in debug.log');
                return null;
            }

            // 获取最后一条匹配的记录
            const lastMatch = matches[matches.length - 1];
            const language = lastMatch[1].trim();
            const content = lastMatch[2].trim();
            const letterId = lastMatch[3].trim();

            console.log(`Extracted letter - Language: ${language}, Content: ${content}, Letter ID: ${letterId}`);
            return { language, content, letterId };
        } catch (error) {
            console.error(`Error extracting letter content: ${error}`);
            return null;
        }
    }

    /**
     * 构建信件回复的prompt
     * @param gameData 游戏数据
     * @param letterContent 信件内容
     * @returns 构建的prompt
     */
    private buildLetterPrompt(gameData: GameData, letterContent: { language: string; content: string; letterId: string }): string {
        const player = gameData.characters.get(gameData.playerID);
        const ai = gameData.characters.get(gameData.aiID);

        if (!player || !ai) {
            throw new Error('Player or AI character data not found in gameData');
        }

        // 使用pListLetter.js构建角色描述
        const pListLetter = require("../../../default_userdata/scripts/prompts/description/standard/pListLetter.js");
        const characterDescription = pListLetter(gameData);

        const prompt = `你正在扮演${ai.fullName}。

${characterDescription}

你收到了一封来自${player.fullName}的信件，内容如下：
"${letterContent.content}"

信件要求使用${letterContent.language}进行回复。

请根据你的角色性格、背景、与写信人的关系，以及当前的游戏情境，写一封合适的回信。回信应该：
1. 使用${letterContent.language}书写
2. 体现你的角色性格和立场
3. 回应信件中的主要内容
4. 语气要符合你的身份和与写信人的关系
5. 长度适中，表达清晰

请直接写出回信内容，不要添加任何解释或说明。`;

        return prompt;
    }

    /**
     * 生成信件回复并写入文件
     * @param gameData 游戏数据
     * @param debugLogPath debug.log文件路径
     * @param userFolderPath 用户文件夹路径
     * @returns 生成的回信内容，如果失败则返回null
     */
    public async generateLetterReply(gameData: GameData, debugLogPath: string, userFolderPath: string): Promise<string | null> {
        try {
            // 提取信件内容
            const letterContent = this.extractLetterContent(debugLogPath);
            if (!letterContent) {
                console.error('Failed to extract letter content');
                return null;
            }

            // 构建prompt
            const promptText = this.buildLetterPrompt(gameData, letterContent);
            console.log(`Generated letter prompt: ${promptText.substring(0, 200)}...`);

            // 将prompt转换为Message数组格式
            const messages: Message[] = [
                {
                    role: "user",
                    content: promptText
                }
            ];

            // 调用LLM生成回复
            const response = await this.apiConnection.complete(messages, false, {
                max_tokens: this.config.maxTokens,
                temperature: this.config.textGenerationApiConnectionConfig.parameters.temperature
            });

            if (!response || response.trim() === '') {
                console.warn('Empty response from LLM for letter reply');
                return null;
            }

            console.log(`Generated letter reply: ${response.substring(0, 100)}...`);
            
            // 将回信写入对应的文件并保存历史
            this.writeLetterReply(response.trim(), userFolderPath, letterContent, gameData);
            
            return response.trim();
        } catch (error) {
            console.error(`Error generating letter reply: ${error}`);
            return null;
        }
    }

    /**
     * 保存往来信件到本地文件
     * @param playerId 玩家ID
     * @param aiId 角色ID
     * @param letterContent 玩家信件内容
     * @param replyContent AI回信内容
     * @param letterId 信件ID
     * @param userFolderPath 用户文件夹路径
     * @param gameData 游戏数据（用于获取角色名字）
     */
    private saveLetterHistory(playerId: string, aiId: string, letterContent: { language: string; content: string; letterId: string }, replyContent: string, userFolderPath: string, gameData: GameData): void {
        try {
            // 获取VOTC数据文件夹路径
            const votcDataPath = path.join(app.getPath('userData'), 'votc_data');
            
            // 获取角色名字用于记录
            const aiCharacter = gameData.characters.get(Number(aiId));
            const aiName = aiCharacter ? aiCharacter.shortName : `character_${aiId}`;
            const playerCharacter = gameData.characters.get(Number(playerId));
            const playerName = playerCharacter ? playerCharacter.shortName : `player_${playerId}`;
            
            // 构建玩家文件夹路径：votc_data/letter_history/playerId/
            const playerFolderPath = path.join(votcDataPath, "letter_history", `player_${playerId}`);
            if (!fs.existsSync(playerFolderPath)) {
                fs.mkdirSync(playerFolderPath, { recursive: true });
                console.log(`Created player letter history folder: ${playerFolderPath}`);
            }

            // 构建characterId.json文件路径
            const letterHistoryFilePath = path.join(playerFolderPath, `character_${aiId}.json`);
            
            // 读取现有的信件历史（如果存在）
            let letterHistory = [];
            if (fs.existsSync(letterHistoryFilePath)) {
                try {
                    const existingData = fs.readFileSync(letterHistoryFilePath, 'utf8');
                    letterHistory = JSON.parse(existingData);
                    if (!Array.isArray(letterHistory)) {
                        letterHistory = [];
                    }
                } catch (error) {
                    console.warn(`Failed to read existing letter history: ${error}`);
                    letterHistory = [];
                }
            }

            // 添加新的信件记录
            const newLetterRecord = {
                playerName: playerName,
                aiName: aiName,
                playerLetter: letterContent.content,
                aiReply: replyContent,
            };

            letterHistory.push(newLetterRecord);

            // 写入更新后的信件历史
            fs.writeFileSync(letterHistoryFilePath, JSON.stringify(letterHistory, null, 2), 'utf8');
            console.log(`Letter history saved to: ${letterHistoryFilePath}`);
            
        } catch (error) {
            console.error(`Error saving letter history: ${error}`);
        }
    }

    /**
     * 将回信写入对应的letter文件，并保存信件历史
     * @param replyContent 回信内容
     * @param userFolderPath 用户文件夹路径
     * @param letterContent 原始信件内容（包含玩家信件信息）
     * @param gameData 游戏数据（用于获取玩家ID和角色ID）
     */
    public writeLetterReply(replyContent: string, userFolderPath: string, letterContent: { language: string; content: string; letterId: string }, gameData: GameData): void {
        try {
            const letterId = letterContent.letterId;
            
            // 从letterId中提取数字后缀（如letter_1 -> 1）
            const letterNumber = letterId.replace('letter_', '');
            const letterFileName = `letter${letterNumber}.txt`;
            const letterFilePath = path.join(userFolderPath, "run", letterFileName);
            
            // 确保run文件夹存在
            const runFolderPath = path.join(userFolderPath, "run");
            if (!fs.existsSync(runFolderPath)) {
                fs.mkdirSync(runFolderPath, { recursive: true });
                console.log(`Created run folder at: ${runFolderPath}`);
            }

            // 构建游戏命令格式用于弹出信件回复和生成信件宝物，根据letterId动态生成
            const gameCommand = `send_interface_message = { 
    type = votc_message_popup 
    title = votc_huixin_title${letterNumber} 
    desc = "${replyContent}"
    #left_icon = global_var:message_second_scope_${letterId} 
}
	remove_global_variable ?= votc_${letterId}
    create_artifact = {
	name = votc_huixin_title${letterNumber}
	description = "${replyContent}"
	type = miscellaneous
	visuals = scroll
	creator = global_var:message_second_scope_${letterId}
	modifier = artifact_monthly_minor_prestige_1_modifier
	}`;

            // 写入文件
            fs.writeFileSync(letterFilePath, gameCommand, 'utf8');
            console.log(`Letter reply written to: ${letterFilePath} for ${letterId}`);

            // 保存信件历史
            const playerId = String(gameData.playerID);
            const aiId = String(gameData.aiID);
            this.saveLetterHistory(playerId, aiId, letterContent, replyContent, userFolderPath, gameData);
            
        } catch (error) {
            console.error(`Error writing letter reply file: ${error}`);
        }
    }
}