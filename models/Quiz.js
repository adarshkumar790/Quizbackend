const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    type: { type: String, enum: ['text', 'image'], required: true },
    value: { type: String, required: true }, 
});

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [OptionSchema], 
    correctAnswer: { type: String }, 
    timeLimit: { type: Number, default: 30 } 
});

const QuizSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['poll', 'qa'], required: true },
    questions: [QuestionSchema],
    impressions: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
