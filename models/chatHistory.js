const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatHistorySchema = new Schema({
    chatCode: {
        type: String,
        required: true
    },
    messages: {
        type: [
            {
                user: { type: String, required: true },
                message: { type: String, required: true },
                timestamp: { type: Date, default: Date.now }
            }
        ],
        required: true
    }
}, { timestamps: true });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
module.exports = ChatHistory;