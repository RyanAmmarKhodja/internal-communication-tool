namespace campus_insider.DTOs
{
    public class LoanDto
    {
        public int Id { get; set; }
        public EquipmentResponseDto Equipment { get; set; }
        public UserResponseDto Borrower { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt {  get; set; }
    }
}
