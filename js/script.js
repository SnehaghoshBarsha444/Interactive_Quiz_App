function quizApp() {
    return {
        number: 15,
        category: 'any',
        difficulty: 'any',
        questions: [],
        currentQuestionIndex: 0,
        selectedAnswer: null,
        score: 0,
        started: false,
        finished: false,
        loading: false,
        timer: 30,
        timerInterval: null,
        timerWidth: 100,
        userAnswers: [], // Array to store user's answers

        // Computed property for the current question
        get currentQuestion() {
            return this.questions[this.currentQuestionIndex];
        },

        // Start the quiz by fetching questions
        async startQuiz() {
            this.loading = true;
            this.started = true;
            this.resetTimer();
            this.userAnswers = []; // Reset user answers
            let url = `https://opentdb.com/api.php?amount=${this.number}&type=multiple`;

            if (this.category !== 'any') {
                url += `&category=${this.category}`;
            }
            if (this.difficulty !== 'any') {
                url += `&difficulty=${this.difficulty}`;
            }

            try {
                const response = await fetch(url);
                const data = await response.json();
                this.questions = data.results.map(q => {
                    let answers = [...q.incorrect_answers];
                    answers.push(q.correct_answer);
                    return { 
                        ...q, 
                        answers: this.shuffle(answers) 
                    };
                });
                this.loading = false;
                this.startTimer();
            } catch (error) {
                console.error('Error fetching questions:', error);
                this.loading = false;
            }
        },

        // Select an answer
        selectAnswer(answer) {
            if (this.selectedAnswer) return;
            
            // Add animation class to the selected answer
            const buttons = document.querySelectorAll('.answer-option');
            buttons.forEach(button => {
                if (button.textContent.trim() === answer) {
                    button.classList.add('animate-bounce');
                }
            });
            
            this.selectedAnswer = answer;
            this.userAnswers[this.currentQuestionIndex] = answer; // Store user's answer
            if (answer === this.currentQuestion.correct_answer) {
                this.score++;
            }
            this.stopTimer();
        },

        // Get user's answer for a specific question
        getUserAnswer(index) {
            return this.userAnswers[index];
        },

        // Check if a specific question was answered correctly
        isQuestionCorrect(index) {
            return this.userAnswers[index] === this.questions[index].correct_answer;
        },

        // Get the CSS class for the result card
        getResultCardClass(index) {
            return {
                'bg-success/10 border-l-4 border-success': this.isQuestionCorrect(index),
                'bg-error/10 border-l-4 border-error': !this.isQuestionCorrect(index)
            };
        },

        // Get the CSS class for the user answer indicator
        getUserAnswerClass(index) {
            return {
                'bg-success': this.isQuestionCorrect(index),
                'bg-error': !this.isQuestionCorrect(index)
            };
        },

        // Get the CSS class for the user answer text
        getUserAnswerTextClass(index) {
            return {
                'text-success font-medium': this.isQuestionCorrect(index),
                'text-error font-medium': !this.isQuestionCorrect(index) && this.userAnswers[index],
                'text-gray-400': !this.userAnswers[index]
            };
        },

        // Check if the selected answer is correct
        get isCorrect() {
            return this.selectedAnswer === this.currentQuestion.correct_answer;
        },

        // Move to the next question or finish the quiz
        nextQuestion() {
            this.selectedAnswer = null;
            this.resetTimer();
            
            // Remove animation classes from answers
            const buttons = document.querySelectorAll('.answer-option');
            buttons.forEach(button => {
                button.classList.remove('animate-bounce');
            });
            
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
                // Add slide-in animation to new question
                const questionElement = document.querySelector('.question-transition');
                if (questionElement) {
                    questionElement.style.animation = 'none';
                    questionElement.offsetHeight; // Trigger reflow
                    questionElement.style.animation = null;
                }
                this.startTimer();
            } else {
                this.finished = true;
                this.stopTimer();
            }
        },

        // Reset the quiz to start over
        resetQuiz() {
            this.number = 15;
            this.category = 'any';
            this.difficulty = 'any';
            this.questions = [];
            this.currentQuestionIndex = 0;
            this.selectedAnswer = null;
            this.score = 0;
            this.started = false;
            this.finished = false;
            this.timer = 30;
            this.timerWidth = 100;
            this.userAnswers = [];
            this.stopTimer();
        },

        // Shuffle the answers array
        shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },

        // Timer functions
        startTimer() {
            this.timer = 30;
            this.timerWidth = 100;
            
            // Update timer bar every 100ms for smooth animation
            this.timerInterval = setInterval(() => {
                if (this.timer > 0) {
                    this.timer -= 0.1;
                    this.timerWidth = (this.timer / 30) * 100;
                    
                    // When timer is low, add pulse animation to timer
                    if (this.timer <= 5) {
                        const timerBar = document.querySelector('.timer-bar');
                        if (timerBar && !timerBar.classList.contains('animate-pulse')) {
                            timerBar.classList.add('animate-pulse');
                        }
                    }
                    
                    // Update display timer to show only whole seconds
                    if (Math.floor(this.timer) !== this.timer) {
                        document.querySelector('.timer-bar').style.width = `${this.timerWidth}%`;
                    }
                } else {
                    this.selectAnswer(null); // Time's up, no answer selected
                    this.nextQuestion();
                }
            }, 100); // Update every 100ms for smooth animation
        },

        stopTimer() {
            clearInterval(this.timerInterval);
            const timerBar = document.querySelector('.timer-bar');
            if (timerBar) {
                timerBar.classList.remove('animate-pulse');
            }
        },

        resetTimer() {
            this.stopTimer();
            this.timer = 30;
            this.timerWidth = 100;
        },

        // Determine button classes based on answer state
        buttonClass(answer) {
            if (!this.selectedAnswer) {
                return '';
            }
            if (answer === this.currentQuestion.correct_answer) {
                return 'bg-success text-white';
            }
            if (answer === this.selectedAnswer) {
                return 'bg-error text-white';
            }
            return 'opacity-50';
        }
    }
}