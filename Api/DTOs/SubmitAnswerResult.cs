using Api.DTOs;
using Api.Models;

public class SubmitAnswerResult
{
    public bool IsCorrect { get; set; }
    public List<Player> Players { get; set; } = [];
    public bool IsGameFinished { get; set; }
    public Game? Game { get; set; }
    public int Order { get; set; } = 0;
    public int TotalQuestions { get; set; } = 0;
    public QuestionDTO QuestionDto { get; set; } = new();
    public bool AllPlayersAnswered { get; set; } = false;
    public DateTime QuestionEndsAt { get; set; } = DateTime.UtcNow;
}
