namespace Api.Models
{

    public enum Status
    {
        Waiting,
        InProgress,
        Complete
    }
    public class Game
    {
        public int Id { get; set; }

        public int? QuizId { get; set; }

        public string? QuizName { get; set; }

        public string? GameCode { get; set; }

        public Status Status { get; set; } = Status.Waiting;

        public int? CurrentQuestionId { get; set; }

    }
}
