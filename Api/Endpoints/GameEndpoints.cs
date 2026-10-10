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

            games.MapGet("/", GetGames);
            games.MapGet("/{id}", GetGame);
            games.MapPost("/", CreateGame);
            games.MapPut("/{id}", UpdateGame);
            games.MapDelete("/{id}", DeleteGame);
            games.MapGet("/{id}/players", GetPlayers);
            games.MapGet("/{id}/question", GetQuestion);
            games.MapPost("/{id}/start", StartGame);
            games.MapPost("/join", JoinGame);
            games.MapPost("/{id}/answer", AnswerQuestion);
            //games.MapPost("/{id}/next", NextQuestion);


            static async Task<Ok<List<Game>>> GetGames(QuizLiveDb db)
            {
                return TypedResults.Ok(await db.Games.ToListAsync());
            };

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

            static async Task<Results<NotFound, NoContent>> UpdateGame(QuizLiveDb db, Game inputGame, int id)
            {
                var game = await db.Games.FindAsync(id);
                if (game is null) return TypedResults.NotFound();
                game.GameCode = inputGame.GameCode;
                game.Status = inputGame.Status;

                await db.SaveChangesAsync();
                return TypedResults.NoContent();
            };

            static async Task<Results<NotFound, NoContent>> DeleteGame(QuizLiveDb db, int id)
            {
                var game = await db.Games.FindAsync(id);
                if (game is null) return TypedResults.NotFound();
                db.Games.Remove(game);
                await db.SaveChangesAsync();
                return TypedResults.NoContent();
            }

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
                var gameQuestion = await db.GameQuestions
                    .FirstOrDefaultAsync(gq =>
                        gq.GameId == id &&
                        gq.QuestionId == game.CurrentQuestionId);
                var totalQuestions = await db.GameQuestions
                    .CountAsync(gq => gq.GameId == id);
                return TypedResults.Ok(new { question, gameQuestion.Order, totalQuestions });
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
                var result = await gameService.SubmitAnswer(request.PlayerId, request.Answer);
                if (result is null) return TypedResults.NotFound();


                await hub.Clients.Group($"game-{id}").UpdateScores(result.Players);
                if (result.AllPlayersAnswered)
                {
                    if (result.IsGameFinished)
                    {
                        await hub.Clients.Group($"game-{id}").GameFinished();
                    }
                    else
                    {
                        await hub.Clients.Group($"game-{id}").ChangeQuestion(result.Question, result.Order, result.TotalQuestions);
                    }
                }
                return TypedResults.Ok(new { IsCorrect = result.IsCorrect});
            }
        }
    }
}
