using Api.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Api.Hubs;

namespace Api.Services;

public class GameTimerService(
    IServiceScopeFactory scopeFactory,
    IHubContext<GameHub, IGameClient> hub,
    ILogger<GameTimerService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessGames(stoppingToken);
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing game timers");
            }

            await Task.Delay(500, stoppingToken);
        }
    }

    private async Task ProcessGames(CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();

        var db = scope.ServiceProvider.GetRequiredService<QuizLiveDb>();
        var now = DateTime.UtcNow;

        // Find questions whose timers have expired
        var expiredGames = await db.Games
            .Where(g =>
                g.Status == Status.InProgress &&
                !g.IsQuestionClosed &&
                g.QuestionEndsAt.HasValue &&
                g.QuestionEndsAt.Value <= now &&
                !g.RevealEndsAt.HasValue)
            .ToListAsync(cancellationToken);

        var closedQuestions = new List<(int GameId, string CorrectOption)>();

        foreach (var game in expiredGames)
        {
            var question = await db.Questions.FirstOrDefaultAsync(
                q => q.Id == game.CurrentQuestionId,
                cancellationToken);

            if (question is null)
                continue;

            // Close the question and start the reveal period
            game.IsQuestionClosed = true;
            game.QuestionEndsAt = null;
            game.RevealEndsAt = now.AddSeconds(
                GameTiming.RevealDurationSeconds);

            closedQuestions.Add((game.Id, question.CorrectOption));
        }

        await db.SaveChangesAsync(cancellationToken);

        // Tell everyone the question is closed and reveal the answer
        foreach (var closed in closedQuestions)
        {
            await hub.Clients.Group($"game-{closed.GameId}")
                .QuestionClosed(closed.CorrectOption);
        }

        // Find games whose reveal periods have ended
        var readyGames = await db.Games
            .Where(g =>
                g.Status == Status.InProgress &&
                g.RevealEndsAt.HasValue &&
                g.RevealEndsAt.Value <= now)
            .ToListAsync(cancellationToken);

        var questionChanges = new List<(
            int GameId,
            Question Question,
            int Order,
            int TotalQuestions,
            DateTime Deadline)>();

        var finishedGames = new List<int>();

        foreach (var game in readyGames)
        {
            var currentGameQuestion = await db.GameQuestions
                .FirstOrDefaultAsync(
                    gq => gq.GameId == game.Id &&
                          gq.QuestionId == game.CurrentQuestionId,
                    cancellationToken);

            if (currentGameQuestion is null)
            {
                game.Status = Status.Complete;
                game.RevealEndsAt = null;
                finishedGames.Add(game.Id);
                continue;
            }

            var totalQuestions = await db.GameQuestions
                .CountAsync(gq => gq.GameId == game.Id, cancellationToken);

            // Finish if this was the last question
            if (currentGameQuestion.Order >= totalQuestions)
            {
                game.Status = Status.Complete;
                game.RevealEndsAt = null;
                finishedGames.Add(game.Id);
                continue;
            }

            // Find the next question
            var nextGameQuestion = await db.GameQuestions
                .FirstOrDefaultAsync(
                    gq => gq.GameId == game.Id &&
                          gq.Order == currentGameQuestion.Order + 1,
                    cancellationToken);

            if (nextGameQuestion is null)
            {
                game.Status = Status.Complete;
                game.RevealEndsAt = null;
                finishedGames.Add(game.Id);
                continue;
            }

            var nextQuestion = await db.Questions.FirstOrDefaultAsync(
                q => q.Id == nextGameQuestion.QuestionId,
                cancellationToken);

            if (nextQuestion is null)
                continue;

            // Advance the game and start a new timer
            game.CurrentQuestionId = nextQuestion.Id;
            game.QuestionEndsAt = now.AddSeconds(
                GameTiming.QuestionDurationSeconds);
            game.RevealEndsAt = null;
            game.IsQuestionClosed = false;

            questionChanges.Add((
                game.Id,
                nextQuestion,
                nextGameQuestion.Order,
                totalQuestions,
                game.QuestionEndsAt.Value));
        }

        await db.SaveChangesAsync(cancellationToken);

        // Broadcast game progression
        foreach (var gameId in finishedGames)
        {
            await hub.Clients.Group($"game-{gameId}").GameFinished();
        }

        foreach (var change in questionChanges)
        {
            await hub.Clients.Group($"game-{change.GameId}")
                .ChangeQuestion(
                    change.Question,
                    change.Order,
                    change.TotalQuestions,
                    change.Deadline);
        }
    }
}