namespace Api.DTOs
{

    public class PlayAgainRequest
    {
        public int QuizId { get; set; }

        public PlayAgainRequest() { }
        public PlayAgainRequest(int quizId)
        {
            QuizId = quizId;
        }
    }
}