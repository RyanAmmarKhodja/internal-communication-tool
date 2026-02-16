namespace campus_insider.Models
{
    public class Equipment
    {
        public long Id { get; set; }

        public string Name { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }


        // Image fields
        public string? ImageUrl { get; set; } // Public URL to access image
        public string? ImageFileName { get; set; } // Original filename for reference

        
        // Foreign key
        public long OwnerId { get; set; }

        // Navigation
        public User Owner { get; set; } = null!;
        public ICollection<Loan> Loans { get; set; } = new List<Loan>();
    }

}
