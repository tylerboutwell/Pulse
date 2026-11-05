using Api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints
{
    public class PlayerEndpoints
    {
        public static void Map(WebApplication app)
        {
            var players = app.MapGroup("/players");

            players.MapGet("/", GetPlayers);
            players.MapGet("/{id}", GetPlayer);

            static async Task<Ok<List<Player>>> GetPlayers(QuizLiveDb db)
            {
                var players = await db.Players.ToListAsync();

                return TypedResults.Ok(players);
            };

            static async Task<Results<Ok<Player>, NotFound>> GetPlayer(int id, QuizLiveDb db)
            {
            return await db.Players.FindAsync(id)
                is Player player
                ? TypedResults.Ok(player)
                : TypedResults.NotFound();
            };
        }
    }
}
