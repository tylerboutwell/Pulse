namespace Api.Models
{
	public class PlayerAnswer
	{
		public int Id { get; set; }

		public int PlayerId { get; set; }
		public int GameId { get; set; }
		public int QuestionId { get; set; }

		public string Answer { get; set; } = "";
		public bool IsCorrect { get; set; }
	}
}
