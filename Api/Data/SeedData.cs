using Api.Models;


namespace Api.Data
{
    public static class SeedData
    {
        public static void Seed(QuizLiveDb db)
        {
            // Don't reseed if data already exists
            if (db.Quizzes.Any()) return;

            var sports = new Quiz { Title = "Sports", Description = "Test your knowledge of sports!" };
            var movies = new Quiz { Title = "Movies", Description = "Test your knowledge of movies!" };
            var music = new Quiz { Title = "Music", Description = "Test your knowledge of music!" };
            var tech = new Quiz { Title = "Tech", Description = "Test your knowledge of tech and programming!" };

            db.Quizzes.AddRange(sports, movies, music, tech);
            db.SaveChanges();

            var questions = new List<Question>
        {
            // Sports
            Q(sports, "Which country won the FIFA World Cup in 2018?",
                "Germany", "Brazil", "France", "Argentina", "C"),
            Q(sports, "Who holds the record for the most home runs in a single MLB season?",
                "Babe Ruth", "Barry Bonds", "Mark McGwire", "Sammy Sosa", "B"),
            Q(sports, "Which golfer has won the most men's major championships?",
                "Tiger Woods", "Arnold Palmer", "Ben Hogan", "Jack Nicklaus", "D"),
            Q(sports, "Which city hosted the 2016 Summer Olympics?",
                "Rio de Janeiro", "London", "Beijing", "Athens", "A"),
            Q(sports, "Which Grand Slam tennis tournament is played on clay?",
                "Wimbledon", "US Open", "Australian Open", "French Open", "D"),
            Q(sports, "How many points is a touchdown worth before the extra point?",
                "3", "6", "7", "8", "B"),
            Q(sports, "Which country invented the sport of cricket?",
                "Australia", "India", "England", "South Africa", "C"),
            Q(sports, "In which sport is the Stanley Cup awarded?",
                "Basketball", "Ice hockey", "Baseball", "American football", "B"),

            // Movies
            Q(movies, "Who directed the movie 'Inception'?",
                "Christopher Nolan", "Steven Spielberg", "James Cameron", "Quentin Tarantino", "A"),
            Q(movies, "Which movie won the Academy Award for Best Picture in 2020?",
                "1917", "Joker", "Parasite", "Once Upon a Time in Hollywood", "C"),
            Q(movies, "Which film features the line \"I'll be back\"?",
                "Predator", "RoboCop", "Die Hard", "The Terminator", "D"),
            Q(movies, "Which film is the highest-grossing of all time (not adjusted for inflation)?",
                "Avengers: Endgame", "Avatar", "Titanic", "Star Wars: The Force Awakens", "B"),
            Q(movies, "Who played Jack Dawson in 'Titanic'?",
                "Leonardo DiCaprio", "Brad Pitt", "Matt Damon", "Tom Cruise", "A"),
            Q(movies, "What is the name of the fictional country in 'Black Panther'?",
                "Zamunda", "Latveria", "Wakanda", "Sokovia", "C"),
            Q(movies, "Which studio produced the original 'Toy Story'?",
                "DreamWorks", "Pixar", "Illumination", "Blue Sky Studios", "B"),
            Q(movies, "In 'The Matrix', which color pill does Neo take?",
                "Blue", "Green", "Red", "Yellow", "C"),

            // Music
            Q(music, "Who is known as the 'King of Pop'?",
                "Elvis Presley", "Michael Jackson", "Prince", "Madonna", "B"),
            Q(music, "Which band released the album 'Abbey Road'?",
                "The Rolling Stones", "Pink Floyd", "The Beatles", "Led Zeppelin", "C"),
            Q(music, "How many strings does a standard guitar have?",
                "4", "5", "6", "7", "C"),
            Q(music, "Which band was fronted by Freddie Mercury?",
                "Genesis", "The Who", "Journey", "Queen", "D"),
            Q(music, "Which artist released the 2016 album 'Lemonade'?",
                "Rihanna", "Beyoncé", "Adele", "Taylor Swift", "B"),
            Q(music, "Which instrument has 88 keys on a standard model?",
                "Piano", "Pipe organ", "Harpsichord", "Accordion", "A"),
            Q(music, "Which band recorded 'Stairway to Heaven'?",
                "Deep Purple", "Black Sabbath", "Led Zeppelin", "The Eagles", "C"),
            Q(music, "Which rapper's real name is Marshall Mathers?",
                "Eminem", "Dr. Dre", "50 Cent", "Jay-Z", "A"),

            // Tech
            Q(tech, "What does HTML stand for?",
                "HyperText Markup Language", "High Tech Modern Language", "HyperTransfer Markup Language", "Home Tool Markup Language", "A"),
            Q(tech, "Who created the Linux kernel?",
                "Bill Gates", "Linus Torvalds", "Steve Jobs", "Dennis Ritchie", "B"),
            Q(tech, "Which HTTP status code means 'Not Found'?",
                "200", "301", "403", "404", "D"),
            Q(tech, "What does SQL stand for?",
                "Simple Question Language", "Sequential Query Logic", "Structured Query Language", "Standard Query Library", "C"),
            Q(tech, "Which language is used to style web pages?",
                "CSS", "JavaScript", "SQL", "Python", "A"),
            Q(tech, "What does API stand for?",
                "Applied Program Integration", "Automated Process Interface", "Advanced Protocol Instruction", "Application Programming Interface", "D"),
            Q(tech, "Which company originally created JavaScript?",
                "Microsoft", "Sun Microsystems", "Netscape", "Google", "C"),
            Q(tech, "Which data structure follows the First-In, First-Out (FIFO) principle?",
                "Stack", "Tree", "Queue", "Graph", "C"),
        };

            db.Questions.AddRange(questions);
            db.SaveChanges();
        }

        private static Question Q(Quiz quiz, string text, string a, string b, string c, string d, string correct) =>
            new Question
            {
                Text = text,
                QuizId = quiz.Id,
                OptionA = a,
                OptionB = b,
                OptionC = c,
                OptionD = d,
                CorrectOption = correct
            };
    }
}