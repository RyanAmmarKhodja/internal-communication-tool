namespace campus_insider.DTOs
{
    public class EquipmentCreateDto
    {
        public string Name { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string? Description { get; set; }
    }

}
