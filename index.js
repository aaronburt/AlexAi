require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({ apiKey: process.env.OPENAI_TOKEN });
const openai = new OpenAIApi(configuration);

async function getChatGptResponse(request, context) {
    try {

        console.log(context)
        
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', 'content': 'Welcome to the Alex AI model. Please provide the context of the conversation so far and the new message you would like Alex to analyze in the following format: Context: [insert context here] Message: [insert new message here]. Alex will then generate a response based on its training data.' },
                { role: 'user', content: `Context: ${context}, Message: ${request}` }
            ],
        });

        console.log(response.data.choices[0].message.content)
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

            console.log(context)

        }

        const args = message.content.slice(1);
        const responseForBot = await getChatGptResponse(args, context);
        message.reply(`${responseForBot}`);
        
    }
});

client.login(process.env.DISCORD_TOKEN);
