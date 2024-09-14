const express = require('express');
const { getQuiz, createQuiz, editQuiz, getQuizzes, takeQuiz, getQuizById } = require('../controllers/quizController');
const { authenticate } = require('../controllers/authController');
const router = express.Router();


router.get('/', getQuizzes);


router.get('/:id', getQuizById);


router.post('/create', authenticate, createQuiz);


router.put('/edit/:id', authenticate, editQuiz);


router.post('/take/:id', takeQuiz);



module.exports = router;
