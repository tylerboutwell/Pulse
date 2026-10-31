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
            var disney = new Quiz { Title = "Disney", Description = "Test your knowledge of Disney movies and characters!"};
            var hunting = new Quiz { Title = "Hunting", Description = "Test your knowledge of hunting, wildlife, and the outdoors!"};

            db.Quizzes.AddRange(sports, movies, music, tech, disney, hunting);
            db.SaveChanges();

            var questions = new List<Question>
        {
            // Sports
            Q(sports, "Which NBA player scored 100 points in a single game?",
                "Kobe Bryant", "Wilt Chamberlain", "Michael Jordan", "Kareem Abdul-Jabbar", "B"),
            Q(sports, "How many players from one team are on the court in a standard basketball game?",
                "4", "5", "6", "7", "B"),
            Q(sports, "Which country has won the most FIFA Men's World Cup titles?",
                "Germany", "Argentina", "Italy", "Brazil", "D"),
            Q(sports, "In baseball, what does ERA stand for?",
                "Earned Run Average", "Estimated Run Allowance", "Extra Run Average", "Earned Record Assessment", "A"),
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
            Q(movies, "What is the name of the fictional hotel in The Shining?",
                "Bates Motel", "Overlook Hotel", "Grand Budapest Hotel", "Continental Hotel", "B"),

            Q(movies, "Who played the Joker in the 2008 film The Dark Knight?",
                "Joaquin Phoenix", "Jack Nicholson", "Heath Ledger", "Jared Leto", "C"),

            Q(movies, "In Jurassic Park, what kind of dinosaur is used to kill Dennis Nedry?",
                "Tyrannosaurus rex", "Velociraptor", "Dilophosaurus", "Brachiosaurus", "C"),

            Q(movies, "Which movie features the fictional boxer Rocky Balboa?",
                "Raging Bull", "Creed", "Million Dollar Baby", "Rocky", "D"),
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
            Q(music, "Which band released the album 'Dark Side of the Moon'?",
                "The Rolling Stones", "Pink Floyd", "The Who", "Led Zeppelin", "B"),

            Q(music, "What is the stage name of the rapper whose real name is Calvin Broadus?",
                "Dr. Dre", "Ice Cube", "Snoop Dogg", "Eminem", "C"),

            Q(music, "Which singer was known as the 'Queen of Soul'?",
                "Whitney Houston", "Tina Turner", "Diana Ross", "Aretha Franklin", "D"),

            Q(music, "Which instrument is prominently featured in the opening of 'Sweet Child O' Mine'?",
                "Piano", "Electric guitar", "Bass guitar", "Saxophone", "B"),
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
            Q(tech, "Which data structure uses the Last-In, First-Out (LIFO) principle?",
                "Queue", "Stack", "Linked list", "Hash table", "B"),

            Q(tech, "What does DNS translate domain names into?",
                "MAC addresses", "IP addresses", "Port numbers", "Subnet masks", "B"),

            Q(tech, "Which HTTP method is typically used to partially update an existing resource?",
                "GET", "POST", "PUT", "PATCH", "D"),

            Q(tech, "What does RAM stand for?",
                "Read Access Memory", "Random Access Memory", "Rapid Application Memory", "Remote Access Module", "B"),
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

            // Disney
            Q(disney, "What is the name of the kingdom where Elsa and Anna live?",
                "Corona", "Arendelle", "Agrabah", "DunBroch", "B"),

            Q(disney, "In The Lion King, what is Scar's real name?",
                "Taka", "Kovu", "Mufasa", "Zazu", "A"),

            Q(disney, "Which Disney movie was the first feature-length animated film ever released?",
                "Pinocchio", "Fantasia", "Snow White and the Seven Dwarfs", "Cinderella", "C"),

            Q(disney, "What type of fish is Nemo?",
                "Blue tang", "Clownfish", "Angelfish", "Butterflyfish", "B"),

            Q(disney, "In Aladdin, what is the name of Princess Jasmine's pet tiger?",
                "Rajah", "Abu", "Iago", "Sultan", "A"),

            Q(disney, "Which Pixar movie features a character named Remy who dreams of becoming a chef?",
                "Luca", "Ratatouille", "Coco", "Up", "B"),

            Q(disney, "What is the name of the demigod who helps Moana restore the heart of Te Fiti?",
                "Tamatoa", "Tui", "Maui", "Te Kā", "C"),

            Q(disney, "In Beauty and the Beast, what is the name of the enchanted candlestick?",
                "Cogsworth", "Lumière", "Chip", "Maurice", "B"),

            Q(disney, "Which Disney villain turns into a dragon during the final battle in Sleeping Beauty?",
                "Ursula", "The Evil Queen", "Lady Tremaine", "Maleficent", "D"),

            Q(disney, "What is the name of Andy's neighbor in the original Toy Story?",
                "Sid Phillips", "Al McWhiggin", "Bonnie Anderson", "Lotso", "A"),

            Q(disney, "Which Disney princess has a raccoon named Meeko as a companion?",
                "Mulan", "Pocahontas", "Tiana", "Rapunzel", "B"),

            Q(disney, "In Monsters, Inc., what is the name of the little girl who enters the monster world?",
                "Boo", "Darla", "Abby", "Lilo", "A"),

            // Hunting
            Q(hunting, "During which phase of the whitetail deer's reproductive cycle does the peak rut occur?",
                "Gestation", "Estrus", "Fawning", "Antler shedding", "B"),

            Q(hunting, "What is the primary purpose of a deer's interdigital gland?",
                "Marking territory through scent", "Lubricating its hooves", "Attracting predators", "Regulating body temperature", "A"),

            Q(hunting, "Which of these cartridges is commonly known for its effectiveness at long-range deer hunting?",
                ".30-30 Winchester", ".308 Winchester", ".45 ACP", ".22 LR", "B"),

            Q(hunting, "What is the term for a male deer shedding its antlers?",
                "Velvet stripping", "Casting", "Rutting", "Raking", "B"),

            Q(hunting, "Which part of a deer's body contains its primary scent-producing glands?",
                "Forehead", "Interdigital area", "Shoulder", "Tail", "B"),

            Q(hunting, "What is a deer scrape primarily used for?",
                "Feeding on minerals", "Communicating through scent marking", "Sharpening antlers", "Creating bedding areas", "B"),

            Q(hunting, "What is the primary purpose of a ballistic coefficient?",
                "Measure bullet expansion", "Measure bullet weight", "Describe a bullet's ability to resist air resistance", "Determine muzzle velocity", "C"),

            Q(hunting, "Which of the following is generally considered the most important factor when tracking a wounded deer?",
                "Following the direction of the wind", "Identifying blood sign and its characteristics", "Moving as quickly as possible", "Following the largest tracks", "B"),

            Q(hunting, "What is the name for the soft, blood-rich tissue covering developing deer antlers?",
                "Marrow", "Velvet", "Keratin", "Cartilage", "B"),

            Q(hunting, "Which waterfowl species is commonly identified by the distinctive green head of the adult male?",
                "Wood duck", "Canvasback", "Mallard", "Northern pintail", "C"),

            Q(hunting, "What does the term 'shot placement' refer to in hunting?",
                "The distance between hunter and target", "The positioning of the bullet or arrow impact on the animal", "The type of ammunition used", "The angle of the firearm's barrel", "B"),

            Q(hunting, "What is the primary purpose of a hunter's orange clothing?",
                "Preventing scent detection", "Keeping the hunter warm", "Increasing visibility to other hunters", "Camouflaging against foliage", "C"),
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