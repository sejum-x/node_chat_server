const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
const express = require('express');

const Chat = require('./models/chats');
const Users = require('./models/users');
const ChatHistory = require('./models/chatHistory');

let chats = [
    { name: "Brawl", code: "1234" },
    { name: "Pryomni", code: "2222" },
    { name: "GMT", code: "3333" }
];

let chatHistory = {
    "1234": [
        { user: "User1", message: "Hello!" },
        { user: "User2", message: "Hi there!" }
    ],
    "2222": [
        { user: "User3", message: "Hey!" },
        { user: "User1", message: "How are you?" }
    ],
    "3333": [
        { user: "User2", message: "Good, thanks!" },
        { user: "User3", message: "What's up?" }
    ]
};

let users = [
    { name: "Admin", surname: "Adminenko", chats: ["1234", "2222"] },
    { name: "Ivan", surname: "Franchuk", chats: ["1234", "3333"] },
    { name: "Cat", surname: "Frisky", chats: ["2222", "3333"] }
];

app = express();

const dbURI = "mongodb+srv://franchukivan123:I9lNfORsO17CTLPM@chat.bjs0pvf.mongodb.net/ChatHistory?retryWrites=true&w=majority";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        // Зчитування чатів
        Chat.find()
            .then((result) => {
                chats = result.map(chat => ({ name: chat.name, code: chat.code }));
            })
            .catch((err) => {
                console.log(err);
                console.log('Error retrieving chats from database');
            });

        // Зчитування історії чатів
        ChatHistory.find()
            .then((result) => {
                result.forEach(entry => {
                    const chatCode = entry.chatCode;
                    if (!chatHistory[chatCode]) {
                        chatHistory[chatCode] = [];
                    }
                    chatHistory[chatCode].push(...entry.messages);
                });
            })
            .catch((err) => {
                console.log(err);
                console.log('Error retrieving chat history from database');
            });

        // Зчитування користувачів
        Users.find()
            .then((result) => {
                users = result.map(user => ({
                    name: user.name,
                    surname: user.surname,
                    chats: user.chats.map(chat => chat.chatCode)
                }));
            })
            .catch((err) => {
                console.log(err);
                console.log('Error retrieving users from database');
            });

        app.listen(3000, () => console.log('Connected to db and listening on http://localhost:3000'));
    })
    .catch((err) => console.log(err));


app.get('/add-chat', (req, res) => {
    const chat = new Chat({
        name: 'PZ',
        code: '2222'
    });

    chat.save()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/all-chats', (req, res) => {
    Chat.find()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/add-chat-history', (req, res) => {
    const chatHistoryDB = new ChatHistory({
        chatCode: '1234',
        messages: [
            {user: 'User1', message: 'Hello!'},
            {user: 'User2', message: 'Hello!'},
            {user: 'User3', message: 'Hello!'},]
    });

    chatHistoryDB.save()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/add-users', (req, res) => {
    const usersDB = new Users({
        name: 'Cat',
        surname: 'Frisky',
        chats: [
            {chatCode: '2222'},
            {chatCode: '3333'}
        ]
    });

    usersDB.save()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
});



// get info from db
app.get('/get-chats', (req, res) => {
    Chat.find()
        .then((result) => {
            chats = result.map(chat => ({ name: chat.name, code: chat.code }));
            res.send(chats);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error retrieving chats');
        });
});
app.get('/get-all-chat-history', (req, res) => {
    ChatHistory.find()
        .then((result) => {
            if (!result) {
                res.status(404).send('Chat histories not found');
                return;
            }
            const allChatHistories = {};
            result.forEach(entry => {
                const chatCode = entry.chatCode;
                if (!allChatHistories[chatCode]) {
                    allChatHistories[chatCode] = [];
                }
                allChatHistories[chatCode].push(...entry.messages);
            });
            res.send(allChatHistories);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error retrieving chat histories');
        });
});

app.get('/get-users', (req, res) => {
    Users.find()
        .then((result) => {
            users = result.map(user => ({
                name: user.name,
                surname: user.surname,
                chats: user.chats.map(chat => chat.chatCode)
            }));
            res.send(users);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error retrieving users');
        });
});

app.get('/delete-users', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { name: "Admin", surname: "Adminenko" },
            { $pull: { chats: { chatCode: "2222" } } },
            { new: true }
        );

        if (user) {
            console.log("Chat with code '2222' deleted for user 'Admin Adminenko'.");
            res.status(200).send("Chat deleted successfully.");
        } else {
            console.log("User 'Admin Adminenko' not found.");
            res.status(404).send("User not found.");
        }
    } catch (error) {
        console.error("Error deleting chat:", error);
        res.status(500).send("Error deleting chat.");
    }
});

app.get('/get-last-three-messages', (req, res) => {
    // Identify the user, for example by a user id passed in the request
    const userId = req.query.userId;

    // Find the user in the database
    Users.findById(userId)
        .then(user => {
            // Get the chat codes the user is a part of
            const userChatCodes = user.chats.map(chat => chat.chatCode);

            // Filter the chat histories based on the user's chats
            ChatHistory.aggregate([
                { $match: { chatCode: { $in: userChatCodes } } },
                { $project: { chatCode: 1, messages: { $slice: ["$messages", -3] } } }
            ])
                .then((result) => {
                    const lastMessages = {};
                    result.forEach(chat => {
                        lastMessages[chat.chatCode] = chat.messages;
                    });
                    res.send(lastMessages);
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send('Error retrieving last three messages');
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Error retrieving user');
        });
});

// Function to fetch chats
function fetchChats() {
    return fetch('http://localhost:8080/get-chats')
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching chats:', error);
            throw error;
        });
}

// Function to fetch chat history for a specific chat code
function fetchChatHistory() {
    return fetch(`http://localhost:8080/get-all-chat-history`)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching chat history:', error);
            throw error;
        });
}

// Function to fetch users
function fetchUsers() {
    return fetch('http://localhost:8080/get-users')
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching users:', error);
            throw error;
        });
}



// Server
const http = require('http').createServer();
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
    }
});
const rooms = new Set();



io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('message', (data) => {
        const { text, name, surname } = data;
        io.to(socket.room).emit('message', `${name} ${surname}: ${text}`);

        // Add a timestamp to each new message
        const message = { user: `${name} ${surname}`, message: text, timestamp: new Date() };
        chatHistory[socket.room].push(message);

        // Update the chat history in the database
        ChatHistory.findOneAndUpdate(
            { chatCode: socket.room },
            { $push: { messages: message } },
            { upsert: true, new: true }
        ).then((result) => {
            //console.log('Chat history updated in database:', result);
        }).catch((err) => {
            console.error('Error updating chat history in database:', err);
        });
    });


    socket.on('createChat', ({ chatName, chatCode, name, surname }) => {
        // Додавання нового чату до списку чатів та створення порожньої історії чату
        const chat = new Chat({
            name: chatName,
            code: chatCode
        });

        chats.push({ name: chatName, code: chatCode });
        chatHistory[chatCode] = [];

        const user = users.find(user => user.name === name && user.surname === surname);
        if (user) {
            user.chats.push(chatCode);
        }
        console.log(`New chat created: ${chatName} (${chatCode})`);

        chat.save()
            .then(() => {

                // Оновлення користувачів, які беруть участь у чаті
                if (user) {


                    // Оновлення користувача в базі даних
                    Users.findOneAndUpdate(
                        { name: name, surname: surname },
                        { $push: { chats: { chatCode: chatCode } } }, // Push an object, not just a string
                        { new: true }
                    ).then((result) => {
                        //console.log('User updated in database:', result);
                    }).catch((err) => {
                        console.error('Error updating user in database:', err);
                    });
                }

                // Створення порожньої історії чату в базі даних
                const chatHistoryDB = new ChatHistory({
                    chatCode: chatCode,
                    messages: []
                });

                chatHistoryDB.save()
                    .then(() => {
                        console.log('Chat history created in database');
                    })
                    .catch((err) => {
                        console.error('Error creating chat history in database:', err);
                    });

            })
            .catch((err) => {
                console.log(err);
                console.log('Error creating new chat');
            });

        // Надіслати оновлені дані користувачам
        io.emit('chats', chats);
        io.emit('users', users);
    });

    socket.on('addChat', ({ chatCode, name, surname }) => {
        // Оновлення користувачів, які беруть участь у чаті
        Users.findOneAndUpdate(
            { name: name, surname: surname },
            { $push: { chats: { chatCode: chatCode } } },
            { new: true }
        ).then((updatedUser) => {
            console.log(`User updated with new chat: ${updatedUser}`);
            // Оновлення змінної users
            const index = users.findIndex(user => user.name === updatedUser.name && user.surname === updatedUser.surname);
            if (index !== -1) {
                users[index].chats = updatedUser.chats.map(chat => chat.chatCode);
            }
            io.emit('users', users);
        }).catch((err) => {
            console.error('Error updating user:', err);
        });
        // Логування дії на серверній консолі
        console.log(`New chat joined: ${chatCode}`);

        // Надіслати оновлені дані користувачам
        io.emit('chats', chats);
        io.emit('users', users);
    });

    socket.on('joinRoom', (room) => {
        if (!rooms.has(room)) {
            rooms.add(room);
            console.log(`Room ${room} created`);
        }
        socket.join(room);
        console.log(`${socket.id} joined room ${room}`);
        socket.room = room;
        io.to(room).emit('userJoined', `User ${socket.id.substr(0, 2)}`);
    });

    // Server-side events to handle requests for data
    socket.on('getChats', () => {
        socket.emit('chats', chats);
    });

    socket.on('getChatHistory', (code) => {
        socket.emit('chatHistory', chatHistory[code] || []);
    });

    socket.on('getUsers', () => {
        socket.emit('users', users);
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

http.listen(8080, () => console.log('listening on http://localhost:8080'));