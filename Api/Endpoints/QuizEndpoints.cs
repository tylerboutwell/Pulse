using Api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints
{
    public class QuizEndpoints
    {
        public static void Map(WebApplication app)
        {
            var quizzes = app.MapGroup("/quizzes/");

            quizzes.MapGet("/", GetQuizzes);
            quizzes.MapGet("/{id}", GetQuiz);
            quizzes.MapPost("/", CreateQuiz);

            static async Task<Ok<List<Quiz>>> GetQuizzes(QuizLiveDb db)
                {
                    return TypedResults.Ok(await db.Quizzes.ToListAsync());
                };

            static async Task<Results<Ok<Quiz>, NotFound>> GetQuiz(int id, QuizLiveDb db)
                {
                return await db.Quizzes.FindAsync(id)
                    is Quiz quiz
                    ? TypedResults.Ok(quiz)
                    : TypedResults.NotFound();
                };

            static async Task<Created<Quiz>> CreateQuiz(Quiz quiz, QuizLiveDb db)
            {
                db.Quizzes.Add(quiz);
                await db.SaveChangesAsync();
                return TypedResults.Created($"/quizzes/{quiz.Id}", quiz);
            };

        }
    }
}
