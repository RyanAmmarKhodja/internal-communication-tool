namespace campus_insider.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public UserResponseDto User { get; set; }
        public string Type { get; set; }
        public string Content { get; set; }
        public string IsRead { get; set; }
        public DateTime CreatedAt {  get; set; }
    }
}
