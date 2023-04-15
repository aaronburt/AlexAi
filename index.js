require('dotenv').config();
const { Client, Intents } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const configuration = new Configuration({ apiKey: process.env.OPENAI_TOKEN });
const openai = new OpenAIApi(configuration);

const rolePrompt = "As Alex, your responsibility is to give accurate and succinct answers to user queries.";
const formatPrompt = "You will receive input in the format: Context - [Inserted context], Message - [User's question/statement]. Your task is to provide a clear and factual response using the provided context.";

async function getChatGptResponse(request, context) {
    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', 'content': rolePrompt },
                { role: 'system', 'content': formatPrompt },
                { role: 'user', content: `Context: ${context}, Message: ${request}` }
            ],
        });
        return response.data.choices[0].message.content;
    } catch (err) {
        console.log('Error: ' + err);
        return err;
    }
}

client.on('messageCreate', async(message) => {
    if (message.content.startsWith('!')) {
        let context = '';
        /* If the message is a reply then add the context from the previous message */ 
        if(message.type === 'REPLY'){
            context = (await message.channel.messages.fetch(message.reference.messageId)).content;
        }

        const args = message.content.slice(1);
        const responseForBot = await getChatGptResponse(args, context);
        message.reply(`${responseForBot}`);        
    }
});

client.login(process.env.DISCORD_TOKEN).then(fullfilled => { console.log('Connected') })
