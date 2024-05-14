const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskId: {
        type: Number,
        required: true,
        unique: true
    },
    text: {
        type: String,
        required: true
    },
    importance: {
        type: String,
        enum: ['normal', 'high', 'critical'],
        default: 'normal',
        required: true
    },
    stage: {
        type: String,
        enum: ['todo', 'doing', 'done'],
        default: 'todo',
        required: true
    }
}, { timestamps: true });


const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
