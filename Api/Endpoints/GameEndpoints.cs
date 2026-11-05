using Microsoft.AspNetCore.Http.HttpResults;
using Api.Models;
using Microsoft.EntityFrameworkCore;
using Api.Services;
using Api.DTOs;
using Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Api.Endpoints
{
    public class GameEndpoints
    {
        public static void Map(WebApplication app)
        {
            var games = app.MapGroup("/games");

            games.MapGet("/{id}", GetGame);
            games.MapPost("/", CreateGame);
            games.MapGet("/{id}/players", GetPlayers);
            games.MapGet("/{id}/question", GetQuestion);
            games.MapPost("/{id}/start", StartGame);
            games.MapPost("/join", JoinGame);
            games.MapPost("/{id}/answer", AnswerQuestion);
            games.MapPost("/{id}/play-again", PlayAgain);

            static async Task<Results<Ok<Game>, NotFound>> GetGame(QuizLiveDb db, int id)
            {
                var game = await db.Games.FindAsync(id);
                if (game is null) return TypedResults.NotFound();
                return TypedResults.Ok(game);
            };

            static async Task<IResult> CreateGame(QuizLiveDb db, CreateGameRequest request, GameService gameService)
            {
                var result = await gameService.CreateGame(request.QuizId, request.PlayerName);
                return TypedResults.Created($"/games/{result.game.Id}", new
                {
                    Game = result.game,
                    PlayerId = result.player.Id
                });
            };

            static async Task<IResult> GetPlayers(int id, QuizLiveDb db)
            {
                var game = await db.Games.FindAsync(id);

                if (game == null)
                    return TypedResults.NotFound();

                var players = db.Players
                    .Where(p => p.GameId == game.Id)
                    .ToList();

                return TypedResults.Ok(players);
            }

            static async Task<IResult> GetQuestion(int id, QuizLiveDb db)
            {
                var game = await db.Games.FindAsync(id);
                if (game is null) return TypedResults.NotFound();
                var question = await db.Questions.FindAsync(game.CurrentQuestionId);
                if (question is null) return TypedResults.NotFound();
                var q = new QuestionDTO(question);
                var gameQuestion = await db.GameQuestions
                    .FirstOrDefaultAsync(gq =>
                        gq.GameId == id &&
                        gq.QuestionId == game.CurrentQuestionId);
                var totalQuestions = await db.GameQuestions
                    .CountAsync(gq => gq.GameId == id);

                var isQuestionClosed =
                    game.Status != Status.InProgress ||
                    !game.QuestionEndsAt.HasValue ||
                    game.QuestionEndsAt.Value <= DateTime.UtcNow ||
                    game.RevealEndsAt.HasValue;

                return TypedResults.Ok(new { question = q, gameQuestion.Order, totalQuestions, questionEndsAt = game.QuestionEndsAt, isQuestionClosed });
            }

            static async Task<Results<BadRequest, Ok<Game>>> StartGame(QuizLiveDb db, int id, GameService gameService, IHubContext<GameHub, IGameClient> hub)
            {
                var game = await gameService.StartGame(id);
                await hub.Clients.Group($"game-{game.Id}").GameStarted(game);
                return TypedResults.Ok(game);
            }

            static async Task<IResult> JoinGame(GameService gameService, JoinGameRequest request, IHubContext<GameHub, IGameClient> hub)
            {
                var player = await gameService.JoinGame(request.GameCode, request.PlayerName);
                if (player is null) return TypedResults.NotFound();
                await hub.Clients.Group($"game-{player.GameId}").PlayerJoined(player);
                return TypedResults.Ok(player);

            }

            static async Task<IResult> AnswerQuestion(QuizLiveDb db, int id, AnswerQuestionRequest request, GameService gameService, IHubContext<GameHub, IGameClient> hub)
            {
                var result = await gameService.SubmitAnswer(id, request.PlayerId, request.Answer);
                if (result is null) return TypedResults.NotFound();


                await hub.Clients.Group($"game-{id}")
                    .UpdateScores(result.Value.Players, result.Value.Answers);

                if (result.Value.QuestionClosed)
                {
                    await hub.Clients.Group($"game-{id}")
                        .QuestionClosed(result.Value.correctOption);
                }

                return TypedResults.Ok(new
                {
                    IsCorrect = result.Value.IsCorrect
                });
            }

            static async Task BroadcastNextQuestion(
                IHubContext<GameHub, IGameClient> hub,
                int id,
                SubmitAnswerResult result)
                        {
                            await Task.Delay(TimeSpan.FromSeconds(2));

                            await hub.Clients.Group($"game-{id}")
                                .ChangeQuestion(result.QuestionDto, result.Order, result.TotalQuestions, result.QuestionEndsAt);
                        }

            static async Task<IResult> PlayAgain(
                QuizLiveDb db,
                int id,
                PlayAgainRequest request,
                GameService gameService,
                IHubContext<GameHub, IGameClient> hub)
                        {
                            // Validate the selected quiz
                            var quizExists = await db.Quizzes
                                .AnyAsync(q => q.Id == request.QuizId);

                            if (!quizExists)
                                return Results.BadRequest("Invalid quiz ID.");

                            // Create the next game
                            var result = await gameService.PlayAgain(
                                id,
                                request.QuizId
                            );

                            if (result is null)
                                return Results.NotFound(
                                    "Game not found or no host exists."
                                );

                            var (newGame, newPlayers, playerIdMap) = result.Value;

                            var newHost = newPlayers
                                .First(p => p.IsHost);

                            // Notify the players in the old game that play again has been initiated
                            await hub.Clients.Group($"game-{id}").PlayAgain(newGame.Id, playerIdMap);

                            // Return the new game's details
                            return Results.Ok(new
                            {
                                id = newGame.Id,
                                gameCode = newGame.GameCode,
                                playerId = newHost.Id
                            });
            }
        }
    }
}
