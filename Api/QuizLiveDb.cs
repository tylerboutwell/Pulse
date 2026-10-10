using Api.Models;
using Microsoft.EntityFrameworkCore;

public class QuizLiveDb : DbContext
{
    public QuizLiveDb(DbContextOptions<QuizLiveDb> options)
        : base(options) { }

    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Player> Players => Set<Player>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<GameQuestion> GameQuestions => Set<GameQuestion>();
    public DbSet<PlayerAnswer> PlayerAnswers => Set<PlayerAnswer>();
}