using Api.Models;
using Microsoft.AspNetCore.SignalR;

namespace Api.Hubs;

public interface IGameClient
{
    Task PlayerJoined(Player player);
    Task GameStarted(Game game);
    Task UpdateScores(List<Player> players);
    Task ChangeQuestion(Question question, int order, int totalQuestions);
    Task GameFinished();
    Task PlayAgain(int gameId, Dictionary<int, int> playerIdMap);
}

public class GameHub : Hub<IGameClient>
{
    public async Task JoinGame(int gameId)
    {
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            $"game-{gameId}"
        );
    }
}