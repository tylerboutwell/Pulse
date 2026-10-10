using Api.Models;

public class SubmitAnswerResult
{
    public bool IsCorrect { get; set; }
    public List<Player> Players { get; set; } = [];
    public bool IsGameFinished { get; set; }
    public Game? Game { get; set; }
    public int Order { get; set; } = 0;
    public int TotalQuestions { get; set; } = 0;
    public Question? Question { get; set; }
    public bool AllPlayersAnswered { get; set; } = false;
}
