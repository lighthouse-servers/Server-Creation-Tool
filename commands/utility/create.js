const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const axios = require('axios')

// Get API key and Pterodactyl URL from the env
// AAA JUST USE CONFIG.JSON
// No, grow up
require('dotenv').config()
const pterodactyl_url = process.env.PANEL_URL;
const apiKey = process.env.API_KEY;


// URLs
const url_users = `${pterodactyl_url}/api/application/users?per_page=1000`;
const url_list_allocations = `${pterodactyl_url}/api/application/nodes/{node_id}/allocations?per_page=1000`;
const url_create_server = `${pterodactyl_url}/api/application/servers?per_page=1000`;

const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a new server!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
        .setDMPermission(false),
    async execute(interaction) {
        // Define embeds
        const embedWelcome = new EmbedBuilder()
            .setColor(0x189DD7)
            .setTitle('Server Creation Tool')
            .setDescription('Welcome to the Server Creation Tool! Do you want to create a new account? **(Y/N)**')
            .setTimestamp()
			.setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
        const embedSearch = new EmbedBuilder()
            .setColor(0x189DD7)
            .setTitle('Server Creation Tool')
            .setDescription('Please input Discord ID, username or the email address of the user account.')
            .setTimestamp()
			.setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
        const embedInputEmail = new EmbedBuilder()
            .setColor(0x189DD7)
            .setTitle('Server Creation Tool')
            .setDescription(`Running account setup! Please provide the user email, 'exit' to quit:`)
            .setTimestamp()
			.setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
        const embedInputUsername = new EmbedBuilder()
            .setColor(0x189DD7)
            .setTitle('Server Creation Tool')
            .setDescription(`Please provide the username, 'exit' to quit:`)
            .setTimestamp()
			.setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
        const embedInputFirstName = new EmbedBuilder()
            .setColor(0x189DD7)
            .setTitle('Server Creation Tool')
            .setDescription(`Please provide the first name, 'exit' to quit:`)
            .setTimestamp()
			.setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
        const embedInputDiscordID = new EmbedBuilder()
            .setColor(0x189DD7)
            .setTitle('Server Creation Tool')
            .setDescription(`Please provide the Discord ID, 'exit' to quit:`)
            .setTimestamp()
			.setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
        const embedSelectNode = new EmbedBuilder()
            .setColor(0x189DD7)
            .setTitle('Server Creation Tool')
            .setDescription(`Please select the node: \n- 1 (Metis) \n- 2 (Amalthea) \n- 3 (Adrastea) \n Type 'exit' to quit.`)
            .setTimestamp()
			.setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
        const embedInvalidNode = new EmbedBuilder()
            .setColor(0xD71818)
            .setTitle('Server Creation Tool')
            .setDescription('Invalid node selection')
            .setTimestamp()
			.setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
        const embedSuccess = new EmbedBuilder()
            .setColor(0x18D76C)
            .setTitle('Server Creation Tool')
            .setDescription('Server created successfully.')
            .setTimestamp()
			.setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
        const embedNoAllocations = new EmbedBuilder()
            .setColor(0xD71818)
            .setTitle('Server Creation Tool')
            .setDescription('Not enough available allocations for the selected node.')
            .setTimestamp()
			.setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
        const embedExit = new EmbedBuilder()
            .setColor(0xD71818)
            .setTitle('Server Creation Tool')
            .setDescription('Exiting the setup.')
            .setTimestamp()
			.setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })

        // Ask if the user wants to create a new account
        await interaction.reply({ embeds: [embedWelcome], fetchReply: true });
        
        async function search_user(search_input) {
            try {
                // Send the request to list all users
                const response_list_users = await axios.get(url_users, { headers });

                // Filter users based on the input
                const filtered_users = response_list_users.data.data.filter(user =>
                    [user.attributes.email.toLowerCase(), user.attributes.username.toLowerCase(), user.attributes.last_name.toLowerCase()].includes(search_input.toLowerCase())
                );

                if (!filtered_users.length) {
                    const embedNotFound = new EmbedBuilder()
                    .setColor(0xD71818)
                    .setTitle('Server Creation Tool')
                    .setDescription(`No user found with the provided search input: ${search_input}`)
                    .setTimestamp()
                    .setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
                    interaction.channel.send({ embeds: [embedNotFound] });
                } else if (filtered_users.length === 1) {
                    const user_id = filtered_users[0].attributes.id;
                    const first_name = filtered_users[0].attributes.first_name;
                    const embedFound = new EmbedBuilder()
                    .setColor(0x18D76C)
                    .setTitle('Server Creation Tool')
                    .setDescription(`User **${first_name}** found with ID: **${user_id}**`)
                    .setTimestamp()
                    .setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
                    interaction.channel.send({ embeds: [embedFound] });
                    return { first_name, user_id };
                } else {
                    interaction.followUp("Multiple users found. Please refine your search.");
                }
            } catch (error) {
                // Handle any exceptions that occurred during the requests
                console.log(`An error occurred: ${error.message}`);
                return { first_name: null, user_id: null };
            }
        };

        async function create_user(data_create_user) {
            try {
                // Send the POST request to create a user
                const response_create_user = await axios.post(url_users, data_create_user, { headers });

                // Check if the user creation request was successful (status code 2xx)
                if (response_create_user.status >= 200 && response_create_user.status < 300) {
                    // Get the user ID from the response
                    const user_id = response_create_user.data.attributes.id;
                    const first_name = response_create_user.data.attributes.first_name;
                    const embedUserSuccess = new EmbedBuilder()
                    .setColor(0x18D76C)
                    .setTitle('Server Creation Tool')
                    .setDescription(`User ${first_name} created successfully with ID: ${user_id}`)
                    .setTimestamp()
                    .setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
                    interaction.channel.send({ embeds: [embedUserSuccess] });
                    return { first_name, user_id };
                } else {
                    return { first_name: null, user_id: null}
                }
            } catch (error) {
                // Handle any exceptions that occurred during the requests
                console.log(`An error occurred: ${error.message}`);
                return { firstn_name: null, user_id: null };
            }
        };

        async function select_node(node_selection) {
            if (node_selection === 'metis' || node_selection === '1') {
                return { node_id: 1 };
            } else if (node_selection === 'amalthea' || node_selection === '2') {
                return { node_id: 2 };
            } else if (node_selection === 'adrastea' || node_selection === '3') {
                return { node_id: 3 };
            } else if (node_selection === 'exit') {
                interaction.channel.send({ embeds: [embedExit] });
                return;
            } else {
                interaction.channel.send({ embeds: [embedInvalidNode] });
            }
        };
        
        async function create_server(first_name, user_id, node_id) {
            try {
                // Send the request to get the allocations for the selected node
                const response_list_allocations = await axios.get(url_list_allocations.replace('{node_id}', node_id), { headers });

                // Filter allocations based on node alias or IP and unassigned status
                let node_alias_or_ip = null;
                if (node_id === 1) {
                    node_alias_or_ip = "metis.lighthouse-servers.com";
                } else if (node_id === 2) {
                    node_alias_or_ip = "104.243.46.28";
                } else if (node_id === 3) {
                    node_alias_or_ip = "adrastea.lighthouse-servers.com";
                }

                const filtered_allocations = response_list_allocations.data.data.filter(allocation =>
                    !allocation.attributes.assigned &&
                    (allocation.attributes.alias === node_alias_or_ip || allocation.attributes.ip === node_alias_or_ip)
                );

                // Check if there are at least two unassigned allocations
                if (filtered_allocations.length >= 2) {
                    // Find consecutive pairs of allocations
                    const consecutive_pairs = [];
                    for (let i = 0; i < filtered_allocations.length - 1; i++) {
                        if (filtered_allocations[i].attributes.port + 1 === filtered_allocations[i + 1].attributes.port) {
                            consecutive_pairs.push([filtered_allocations[i].attributes.id, filtered_allocations[i + 1].attributes.id]);
                        }
                    }
                    if (consecutive_pairs.length > 0) {
                        // Use the first consecutive pair of allocations
                        const [allocation_1, allocation_2] = consecutive_pairs[0];
                        // Create a server for the user
                        const data_create_server = {
                            "name": `${first_name} | Barotrauma`,
                            "user": user_id,
                            "egg": 44,
                            "docker_image": "ghcr.io/milord-thatonemodder/trusted-seas-barotrauma-pterodactyl:main",
                            "startup": "./mod_manager.sh && ./custom_script.sh && export LD_LIBRARY_PATH=\"$LD_LIBRARY_PATH:$PWD/linux64\" && port={{SERVER_PORT}} && ./DedicatedServer -port $port -queryport $(( $port + 1 ))",
                            "environment": {
                                "SRCDS_APPID": "1026340",
                                "AUTO_UPDATE": "1",
                                "SERVER_NAME_PREFIX": "Lighthouse Servers",
                                "CAN_BE_PASSWORDED": "0",
                                "CAN_BE_PRIVATE": "0",
                                "SERVER_REMOVE_MODS": "0"  
                            },
                            "limits": {
                                "memory": 4096,
                                "swap": 0,
                                "disk": 0,
                                "io": 500,
                                "cpu": 0
                            },
                            "feature_limits": {
                                "databases": 0,
                                "backups": 0
                            },
                            "allocation": {
                                "default": allocation_1,
                                "additional": [
                                    allocation_2
                                ]
                            }
                        };

                        const response_create_server = await axios.post(url_create_server, data_create_server, { headers });

                        if (response_create_server.status >= 200 && response_create_server.status < 300) {
                            interaction.channel.send({ embeds: [embedSuccess] });
                        } else {
                            interaction.followUp("Failed to create server.");
                        }
                    }
                } else {
                    interaction.channel.send({ embeds: [embedNoAllocations] });
                }
            
            } catch (error) {
                console.log(`An error occurred: ${error.message}`);
            }
        };

        let answered = false;

        // Create a new collector and filter for y, n, yes or no
        const collector = interaction.channel.createMessageCollector({
            filter: (message) =>
                ['y', 'n', 'yes', 'no'].includes(message.content.toLowerCase()) && message.author.id === interaction.user.id,
            time: 10000, // Time in milliseconds (10 seconds)
        });

        collector.on('collect', async (message) => {
            const userResponse = message.content.toLowerCase();

            if (userResponse === 'y' || userResponse === 'yes') {
                let email, username, first_name, discord_id;
                // Ask for user email
                await interaction.channel.send({ embeds: [embedInputEmail] });
                const emailCollector = interaction.channel.createMessageCollector({
                    filter: (message) => message.author.id === interaction.user.id,
                    time: 60000, // Time in milliseconds (60 seconds)
                    max: 1,
                });

                emailCollector.on('collect', async (message) => {
                    if (message.content.toLowerCase().trim() == 'exit') {
                        interaction.channel.send({ embeds: [embedExit] });
                        return;
                    }
                    email = message.content.trim();
                    // Ask for username
                    interaction.channel.send({ embeds: [embedInputUsername] });
                    
                    const usernameCollector = interaction.channel.createMessageCollector({
                        filter: (message) => message.author.id === interaction.user.id,
                        time: 60000,
                        max: 1,
                    });

                    usernameCollector.on('collect', async (message) => {
                        if (message.content.toLowerCase().trim() == 'exit') {
                            interaction.channel.send({ embeds: [embedExit] });
                            return;
                        }
                        username = message.content.trim();
                        // Ask for first name
                        interaction.channel.send({ embeds: [embedInputFirstName] });
                        const firstNameCollector = interaction.channel.createMessageCollector({
                            filter: (message) => message.author.id === interaction.user.id,
                            time: 60000,
                            max: 1,
                        });

                        firstNameCollector.on('collect', async (message) => {
                            if (message.content.toLowerCase().trim() == 'exit') {
                                interaction.channel.send({ embeds: [embedExit] });
                                return;
                            }
                            first_name = message.content.trim();

                            // Ask for Discord ID
                            interaction.channel.send({ embeds: [embedInputDiscordID] });
                            const discordIdCollector = interaction.channel.createMessageCollector({
                                filter: (message) => message.author.id === interaction.user.id,
                                time: 60000,
                                max: 1,
                            });

                            discordIdCollector.on('collect', async (message) => {
                                discord_id = message.content.trim();
                                if (message.content.toLowerCase().trim() == 'exit') {
                                    interaction.channel.send({ embeds: [embedExit] });
                                    return;
                                }
                                // Stop all collectors
                                emailCollector.stop();
                                usernameCollector.stop();
                                firstNameCollector.stop();
                                discordIdCollector.stop();

                                // Create the data_create_user object with the collected information
                                const data_create_user = {
                                    email: email,
                                    username: username,
                                    first_name: first_name,
                                    last_name: discord_id,
                                };

                                // Handle the logic for making the account
                                const createUserResult = await create_user(data_create_user);
                                user_id = createUserResult.user_id;
                                // Node selection
                                interaction.channel.send({ embeds: [embedSelectNode] });
                                const nodeCollector = interaction.channel.createMessageCollector({
                                    filter: (message) => message.author.id === interaction.user.id,
                                    time: 60000,
                                    max: 1,
                                });
                                nodeCollector.on('collect', async (message) => {
                                    try {
                                        node_selection = message.content.toLowerCase().trim();
                                        const nodeSelectionResult = await select_node(node_selection);
                                        node_id = nodeSelectionResult.node_id;
                                        await create_server(first_name, user_id, node_id)
                                    } catch (error) {
                                        console.log(`An error occurred: ${error.message}`);
                                    }
                                });
                            });
                        });
                    });
                }); 


                answered = true;
            } else if (userResponse === 'n' || userResponse === 'no') {
                await interaction.channel.send({ embeds: [embedSearch] });
                let search_input;
                const inputCollector = interaction.channel.createMessageCollector({
                    filter: (message) => message.author.id === interaction.user.id,
                    time: 60000, // Time in milliseconds (60 seconds)
                    max: 1,
                });

                inputCollector.on('collect', async (message) => {
                    search_input = message.content.trim();
                    inputCollector.stop();
                    // UNDEFINED MY ASS
                    const searchUserResult = await search_user(search_input);
                    // flawless design
                    try {
                        if (searchUserResult.user_id !== null && searchUserResult.first_name !== null) {
                            user_id = searchUserResult.user_id;
                            first_name = searchUserResult.first_name;
                            // Node selection
                            interaction.channel.send({ embeds: [embedSelectNode] });
                            const nodeCollector = interaction.channel.createMessageCollector({
                                filter: (message) => message.author.id === interaction.user.id,
                                time: 60000,
                                max: 1,
                            });
                            nodeCollector.on('collect', async (message) => {
                                try {
                                    node_selection = message.content.toLowerCase().trim();
                                    const nodeSelectionResult = await select_node(node_selection);
                                    node_id = nodeSelectionResult.node_id;
                                    await create_server(first_name, user_id, node_id)
                                } catch (error) {
                                    console.log(`An error occurred: ${error.message}`);
                                }
                            });
                        } else {
                            const embedNotFound = new EmbedBuilder()
                            .setColor(0xD71818)
                            .setTitle('Server Creation Tool')
                            .setDescription(`No user found with the provided search input: ${search_input}`)
                            .setTimestamp()
                            .setFooter({ text: 'Lighthouse Servers', iconURL: 'https://cdn.discordapp.com/avatars/875273473742761985/4d4abddda78f66f3c95b9c5fc3e052d5.webp?size=2048' })
                            interaction.channel.send({ embeds: [embedNotFound] });
                        }
                    } catch (error) {
                        console.log(`An error occurred: ${error.message}`);
                    }
                });
                answered = true;

            };

            // Stop the main collector
            collector.stop();
        });

        // Listen for event end if timeout
        collector.on('end', () => {
            if (!answered) {
                interaction.followUp('Got no response.');
            }
        });
    },
};
