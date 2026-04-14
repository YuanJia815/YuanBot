# YuanBot

A small Discord bot scaffold using Node.js and Discord.js v14.

## 功能
- 基本 Slash Command（`/ping`, `/help`）
- 基本 Prefix 指令（`!ping`, `!help`）

## 需求
- Node.js 18+ 或更新版本
- Discord bot 應用程式與 Bot Token

## 安裝
1. 複製 `.env.example` 為 `.env`
2. 編輯 `.env`，填入 `BOT_TOKEN`、`CLIENT_ID`、`GUILD_ID`
3. 安裝依賴：

```bash
yarn install
```

## 執行
```bash
yarn start
```

開發時可使用：

```bash
yarn dev
```

## 環境變數
- `BOT_TOKEN`：Discord Bot Token
- `CLIENT_ID`：Discord 應用程式 Client ID
- `GUILD_ID`：測試伺服器 ID，用於註冊 Guild Slash Commands

## 使用方式
- Slash Command: `/ping`, `/help`
- Prefix 指令: `!ping`, `!help`

## 注意
如果要使用 `!` 前綴指令，需要在 Discord 開發者後台啟用 "Message Content Intent"，並在 `src/index.js` 中保留相關 intents。
