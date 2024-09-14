const Quiz = require('../models/Quiz');


exports.createQuiz = async (req, res) => {
    const { title, type, questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: 'Questions must be an array' });
    }

    for (const question of questions) {
        if (!question.options || question.options.length !== 4) {
            return res.status(400).json({ error: 'Each question must have exactly 4 options' });
        }
        
        for (const option of question.options) {
            if (!['text', 'image'].includes(option.type) || !option.value) {
                return res.status(400).json({ error: 'Each option must have a valid type and value' });
            }
        }
        if (type === 'qa' && !question.correctAnswer) {
            return res.status(400).json({ error: 'Each question must have a correct answer for Q&A type quizzes' });
        }
        if (!question.questionText) {
            return res.status(400).json({ error: 'Each question must have a question text' });
        }
        if (typeof question.timeLimit !== 'number' || question.timeLimit <= 0) {
            return res.status(400).json({ error: 'Each question must have a valid time limit' });
        }
    }

    try {
        const quiz = new Quiz({ creator: req.user.id, title, type, questions });
        await quiz.save();
        res.status(201).json(quiz);
    } catch (err) {
        console.error('Error creating quiz:', err);
        res.status(400).json({ error: err.message });
    }
};

exports.editQuiz = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const quiz = await Quiz.findById(id);
        if (!quiz || quiz.creator.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (updates.questions) {
            if (!Array.isArray(updates.questions)) {
                return res.status(400).json({ error: 'Questions must be an array' });
            }

            for (const question of updates.questions) {
                if (!question.options || question.options.length !== 4) {
                    return res.status(400).json({ error: 'Each question must have exactly 4 options' });
                }
                for (const option of question.options) {
                    if (!['text', 'image'].includes(option.type) || !option.value) {
                        return res.status(400).json({ error: 'Each option must have a valid type and value' });
                    }
                }
                if (updates.type === 'qa' && !question.correctAnswer) {
                    return res.status(400).json({ error: 'Each question must have a correct answer for Q&A type quizzes' });
                }
                if (!question.questionText) {
                    return res.status(400).json({ error: 'Each question must have a question text' });
                }
                if (typeof question.timeLimit !== 'number' || question.timeLimit <= 0) {
                    return res.status(400).json({ error: 'Each question must have a valid time limit' });
                }
            }
        }

        Object.assign(quiz, updates); 
        await quiz.save(); 
        res.json(quiz); 
    } catch (err) {
        console.error('Error editing quiz:', err);
        res.status(400).json({ error: err.message });
    }
};

exports.editQuiz = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const quiz = await Quiz.findById(id);
        if (!quiz || quiz.creator.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Validation for questions
        if (updates.questions) {
            if (!Array.isArray(updates.questions)) {
                return res.status(400).json({ error: 'Questions must be an array' });
            }

            for (const question of updates.questions) {
                if (!question.options || question.options.length !== 4) {
                    return res.status(400).json({ error: 'Each question must have exactly 4 options' });
                }
                if (updates.type === 'qa' && !question.correctAnswer) {
                    return res.status(400).json({ error: 'Each question must have a correct answer for Q&A type quizzes' });
                }
                if (!question.questionText) {
                    return res.status(400).json({ error: 'Each question must have a question text' });
                }
                if (typeof question.timeLimit !== 'number' || question.timeLimit <= 0) {
                    return res.status(400).json({ error: 'Each question must have a valid time limit' });
                }
            }
        }

        Object.assign(quiz, updates); 
        await quiz.save(); 
        res.json(quiz); 
    } catch (err) {
        console.error('Error editing quiz:', err);
        res.status(400).json({ error: err.message });
    }
};

exports.getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().sort({ createdAt: -1 }); 
        res.json(quizzes);
    } catch (err) {
        console.error('Error fetching quizzes:', err);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
};


exports.getQuizById = async (req, res) => {
    const { id } = req.params;
    try {
        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        console.error('Error fetching quiz:', err);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
};

// Take a quiz
exports.takeQuiz = async (req, res) => {
    const { id } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
        return res.status(400).json({ error: 'Answers must be an array' });
    }

    try {
        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        quiz.impressions = (quiz.impressions || 0) + 1;
        await quiz.save();

        let score = 0;
        let results = [];

        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = question.correctAnswer === userAnswer;
            if (isCorrect) score += 1;

            results.push({
                questionText: question.questionText,
                correctAnswer: question.correctAnswer,
                userAnswer,
                isCorrect,
                timeLimit: question.timeLimit,
            });
        });

        res.json({
            score,
            totalQuestions: quiz.questions.length,
            results,
        });
    } catch (err) {
        console.error('Error taking quiz:', err);
        res.status(400).json({ error: err.message });
    }
};

