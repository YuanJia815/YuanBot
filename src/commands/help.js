export const data = {
    name: 'help',
    description: 'Displays available commands.'
};
export async function execute(context) {
    const helpText = '可用指令：\n• /ping 或 !ping - 檢查機器人是否在線\n• /help 或 !help - 顯示此說明';
    const isInteraction = typeof context.isChatInputCommand === 'function';

    if (isInteraction) {
        await context.reply(helpText);
    } else {
        await context.reply(helpText);
    }
}
