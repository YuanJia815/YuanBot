import { readdirSync } from 'fs'
import { pathToFileURL, fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { Client, Collection, GatewayIntentBits, REST, Routes, Events, EmbedBuilder } from 'discord.js'
import mqtt from 'mqtt'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const token = process.env.BOT_TOKEN
const clientId = process.env.CLIENT_ID
const guildId = process.env.GUILD_ID

if (!token) {
    console.error('Missing BOT_TOKEN')
    process.exit(1)
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

client.commands = new Collection()

// ================= COMMAND LOADER =================
const commandsPath = join(__dirname, 'commands')
const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = join(commandsPath, file)
    const moduleUrl = pathToFileURL(filePath).href

    const command = await import(moduleUrl)

    if (command.data && command.execute) {
        client.commands.set(command.data.name, command)
    } else {
        console.warn(`Invalid command: ${file}`)
    }
}

// ================= REGISTER COMMAND =================
const rest = new REST({ version: '10' }).setToken(token)

async function registerCommands() {
    if (!clientId || !guildId) return

    const commandData = client.commands.map(cmd => cmd.data)

    await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandData }
    )

    console.log('✅ Slash commands registered')
}

// ================= MQTT =================
import { getUserProfilePicture } from './getLineUser.js'

function initMqtt() {
    const mqttClient = mqtt.connect(process.env.MQTT_URL, {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        port: 8883,
    })

    mqttClient.on('connect', () => {
        console.log('✅ MQTT connected')
        mqttClient.subscribe('gate/status')
    })

    mqttClient.on('message', async (topic, message) => {
        try {
            const data = JSON.parse(message.toString())
            console.log('Received MQTT message:', data)

            const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID)
            if (!channel) return

            if (data?.isLineUser) {
                const embed = new EmbedBuilder()
                    .setTitle(getEmoji(data.action) + (data.action || '未知'))
                    .setColor(0x2ecc71)
                    .setAuthor({
                        name: data.displayName,
                        iconURL: await getUserProfilePicture(data.userId) || undefined,
                        url: 'https://discord-bot-1or5.onrender.com',
                    })
                    .addFields({ name: '', value: data.userId, inline: true })
                    .setTimestamp(); // 不傳入參數預設就是當前時間 (new Date())

                await channel.send({ embeds: [embed] });

            } else {
                const location = (data.location || "")
                    .replace(/\n/g, ' ')
                    .replace(/\b\d{3,6}\b/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();

                const embed = new EmbedBuilder()
                    .setTitle(getEmoji(data.action) + (data.action || '未知'))
                    .setColor(0xea79c5)
                    .setAuthor({
                        name: data.deviceName,
                        iconURL: 'https://help.apple.com/assets/6781C3C67B7D74FBA40A8869/6781C3D2FBC8FC20260A5112/zh_TW/e5b2bdfad57b2e0b806c0f65d8d1db72.png',
                        url: 'https://discord-bot-1or5.onrender.com',
                    })
                    .addFields({ name: '', value: location, inline: true })
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
            }
        } catch (err) {
            console.error('MQTT message error:', err)
        }
    })

    mqttClient.on('error', err => {
        console.error('MQTT error:', err)
    })
}
const getEmoji = (action) => {
    if (action.includes('開')) return '🟩 '
    if (action.includes('關')) return '🟥 '
    if (action.includes('暫停')) return '⏸️ '
    return '⚙️'
}

// ================= DISCORD EVENTS =================
client.once(Events.ClientReady, async () => {
    console.log(`🤖 Logged in as ${client.user.tag}`)

    await registerCommands()
    initMqtt() // 🔥 重點：這裡才啟動 MQTT
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return

    const command = client.commands.get(interaction.commandName)
    if (!command) return

    try {
        await command.execute(interaction)
    } catch (err) {
        console.error(err)
        await interaction.reply({ content: 'Error', ephemeral: true })
    }
})

client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.content.startsWith('!')) return

    const args = message.content.slice(1).trim().split(/\s+/)
    const commandName = args.shift().toLowerCase()

    const command = client.commands.get(commandName)
    if (!command) return

    try {
        await command.execute(message, args)
    } catch (err) {
        console.error(err)
        await message.reply('Error')
    }
})

// ================= START =================
console.log('🚀 Starting bot...')
client.login(token)

const app = express()
app.get('/', (req, res) => {
    res.send('Bot is running')
})
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})