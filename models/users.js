const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
        name:{
            type: String,
            required: true
        },
        surname:{
            type: String,
            required: true
        },
        chats:{
            type: [
                {
                    chatCode: { type: String, required: true }
                }
            ],
            required: true
        }
    }, { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
