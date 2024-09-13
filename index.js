const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config(); // Carrega as variáveis do .env

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const INTERVAL = 6 * 60 * 60 * 1000; // 6 horas em milissegundos

// Função para limpar as mensagens do canal
async function clearChannel(interaction) {
    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (!channel) {
            console.log('Canal não encontrado!');
            if (interaction) interaction.reply({ content: 'Erro: Canal não encontrado.', ephemeral: true });
            return;
        }

        let messages;
        do {
            messages = await channel.messages.fetch({ limit: 100 });
            await channel.bulkDelete(messages);
            console.log(`Apagadas ${messages.size} mensagens do canal ${CHANNEL_ID}`);
        } while (messages.size >= 2);

        if (interaction) interaction.reply({ content: 'Todas as mensagens foram limpas!', ephemeral: true });
    } catch (error) {
        console.error('Erro ao limpar o canal:', error);
        if (interaction) interaction.reply({ content: 'Erro ao tentar limpar o canal.', ephemeral: true });
    }
}

// Registrar o comando slash
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Registrando comandos slash...');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            {
                body: [
                    {
                        name: 'clear',
                        description: 'Limpa todas as mensagens do canal atual.',
                    }
                ],
            }
        );

        console.log('Comandos slash registrados com sucesso.');
    } catch (error) {
        console.error('Erro ao registrar comandos slash:', error);
    }
})();

// Inicializar o bot
client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);

    // Limpar o canal a cada 6 horas
    setInterval(() => clearChannel(null), INTERVAL);

    // Limpar o canal imediatamente na inicialização
    clearChannel(null);
});

// Lidar com o comando slash
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'clear') {
        await clearChannel(interaction);
    }
});

client.login(TOKEN);
