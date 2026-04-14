export const data = {
    name: 'ping',
    description: 'Replies with Pong!'
};
export async function execute(context) {
    const replyText = 'Pong!';
    const isInteraction = typeof context.isChatInputCommand === 'function';

    if (isInteraction) {
        await context.reply(replyText);
    } else {
        await context.reply(replyText);
    }
}
