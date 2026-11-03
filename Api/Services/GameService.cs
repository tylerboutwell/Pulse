using Api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    public class GameService(QuizLiveDb db)
    {

        public async Task<(Game game, Player player)> CreateGame(int quizId, string playerName)
        {
            // generate random game code
            Random random = new Random();
            string gameCode = random.Next(1, 999).ToString();

            // While game code exists, generate new code
            while (db.Games.Any(game => game.GameCode == gameCode))
            {
                gameCode = random.Next(1, 999).ToString();
            }
            Game game = new Game
            {
                GameCode = gameCode,
                QuizId = quizId,
                QuizName = db.Quizzes.FirstOrDefault(q => q.Id == quizId)?.Title
            };
            db.Games.Add(game);
            await db.SaveChangesAsync();

            Player player = new Player
            {
                Name = playerName,
                IsHost = true,
                GameId = game.Id
            };
            db.Players.Add(player);
            await db.SaveChangesAsync();
            return (game, player);
        }

        public async Task<Player?> JoinGame(string gameCode, string playerName)
        {
            var game = await db.Games.FirstOrDefaultAsync(g => g.GameCode == gameCode);
            //Check if game exists
            if (game is null) return null;

            var player = new Player
            {
                Name = playerName,
                GameId = game.Id
            };

            db.Players.Add(player);
           

            await db.SaveChangesAsync();
            return player;

        }

        public async Task<Game> StartGame(int gameId)
        {
            // Find game
            var game = await db.Games.FindAsync(gameId);
            // Make sure game exists and is in waiting status
            if (game is null) throw new Exception("Game not found");
            if (game.Status != Status.Waiting) throw new Exception("Game is not in waiting status");

            //Get Questions
            IEnumerable<Question> questions = db.Questions.Where(question => question.QuizId == game.QuizId);

            // Make sure there are more than 0 questions
            if (!questions.Any()) throw new Exception("No questions available for the quiz");

            // Make sure there are players in the game
            if (!db.Players.Any(p => p.GameId == game.Id)) throw new Exception("No players in the game");

            // Randomize question order
            var shuffledQuestions = questions
            .OrderBy(q => Guid.NewGuid())
            .Take(8) // Take only 8 questions
            .ToList();

            // Create GameQuestions
            for (int i = 0; i < shuffledQuestions.Count; i++)
            {
                db.GameQuestions.Add(new GameQuestion
                {
                    GameId = game.Id,
                    QuestionId = shuffledQuestions[i].Id,
                    Order = i + 1
                });
            }

            //Set the first question as the current question
            game.CurrentQuestionId = shuffledQuestions[0].Id;

            game.QuestionEndsAt = DateTime.UtcNow.AddSeconds(
                GameTiming.QuestionDurationSeconds);

            game.RevealEndsAt = null;
            game.IsQuestionClosed = false;

            // Change game status
            game.Status = Status.InProgress;

            // Save changes
            await db.SaveChangesAsync();
            return game;
        }

        public async Task<(bool IsCorrect, List<Player> Players, List<PlayerAnswerDto> Answers, string correctOption, bool QuestionClosed)?> SubmitAnswer(int gameId, int playerId, string answer)
        {
            var player = await db.Players.FindAsync(playerId);
            if (player is null) return null;

            var game = await db.Games.FindAsync(player.GameId);
            if (game is null) return null;

            // Check whether the question is still accepting answers
            if (game.Status != Status.InProgress ||
                !game.QuestionEndsAt.HasValue ||
                game.QuestionEndsAt.Value <= DateTime.UtcNow ||
                game.RevealEndsAt.HasValue)
            {
                Console.WriteLine($"Game {game.Id} is not accepting answers at this time.");
                return null;
            }

            var question = await db.Questions.FindAsync(game.CurrentQuestionId);
            if (question is null) return null;

            // Check if this player has already answered
            var existingAnswer = await db.PlayerAnswers
                .AnyAsync(a =>
                    a.PlayerId == player.Id &&
                    a.GameId == game.Id &&
                    a.QuestionId == question.Id);

            if (existingAnswer)
            {
                // Reject duplicate submission
                return null;
            }

            var isCorrect = question.CorrectOption == answer;

            db.PlayerAnswers.Add(new PlayerAnswer
            {
                PlayerId = player.Id,
                GameId = game.Id,
                QuestionId = question.Id,
                Answer = answer,
                IsCorrect = isCorrect
            });

            if (isCorrect)
            {
                player.Score += 1;
            };

            await db.SaveChangesAsync();

            // Check whether all players have answered
            var totalPlayers = await db.Players
                .CountAsync(p => p.GameId == game.Id);

            var totalAnswers = await db.PlayerAnswers
                .CountAsync(a =>
                    a.GameId == game.Id &&
                    a.QuestionId == question.Id);

            if (totalAnswers >= totalPlayers)
            {
                game.IsQuestionClosed = true;
                game.QuestionEndsAt = null;
                game.RevealEndsAt = DateTime.UtcNow.AddSeconds(
                    GameTiming.RevealDurationSeconds);
                await db.SaveChangesAsync();
            }

            var players = await db.Players
                .Where(p => p.GameId == game.Id)
                .ToListAsync();

            var answers = await (
                from ans in db.PlayerAnswers
                join p in db.Players
                    on ans.PlayerId equals p.Id
                where ans.GameId == game.Id &&
                      ans.QuestionId == question.Id
                select new PlayerAnswerDto
                {
                    PlayerId = ans.PlayerId,
                    PlayerName = p.Name,
                    Answer = ans.Answer
                }
            ).ToListAsync();

            return (isCorrect, players, answers, question.CorrectOption, game.IsQuestionClosed);
        }

        public async Task<(Game game, List<Player> players, Dictionary<int, int> playerIdMap)?> PlayAgain(
            int previousGameId,
            int quizId)
                {
                    // Find the completed game
                    var previousGame = await db.Games
                        .FindAsync(previousGameId);

                    if (previousGame is null)
                        return null;

                    // Get the previous players
                    var previousPlayers = await db.Players
                        .Where(p => p.GameId == previousGameId)
                        .ToListAsync();

                    var previousHost = previousPlayers
                        .FirstOrDefault(p => p.IsHost);

                    if (previousHost is null)
                        return null;

                    // Create a new game and its host
                    var (newGame, newHost) = await CreateGame(
                        quizId,
                        previousHost.Name
                    );

                    var newPlayers = new List<Player> { newHost };

                    // Map previous player IDs to new player IDs
                    var newPlayersByOldId = new Dictionary<int, Player>
                    {
                        [previousHost.Id] = newHost
                    };

                    // Copy everyone except the host, who was already created
                    foreach (var oldPlayer in previousPlayers
                        .Where(p => p.Id != previousHost.Id))
                    {
                        var player = new Player
                        {
                            Name = oldPlayer.Name,
                            IsHost = oldPlayer.IsHost,
                            GameId = newGame.Id,
                            Score = 0
                        };

                        db.Players.Add(player);
                        newPlayers.Add(player);

                        newPlayersByOldId[oldPlayer.Id] = player;
                    }

                    await db.SaveChangesAsync();

                    // Build mapping after SaveChanges populates new player IDs
                    var playerIdMap = newPlayersByOldId.ToDictionary(
                        pair => pair.Key,
                        pair => pair.Value.Id
                    );

                    return (newGame, newPlayers, playerIdMap);
                }
    }
}
