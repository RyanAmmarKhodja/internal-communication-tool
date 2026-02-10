namespace campus_insider.Models
{
    public class CarpoolTrip
    {
        public long Id { get; set; }

        public string Departure { get; set; } = null!;
        public string Destination { get; set; } = null!;
        public DateTime DepartureTime { get; set; }
        public string? VehicleDescription { get; set; }
        public int AvailableSeats { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }

        // Foreign key
        public long DriverId { get; set; }


        // Navigation
        public User Driver { get; set; } = null!;

        public List<CarpoolPassenger> Passengers { get; set; } = new();
    }


    public class CarpoolPassenger
    {
        public long Id { get; set; }
        public long CarpoolTripId { get; set; }
        public long UserId { get; set; }
        public DateTime JoinedAt { get; set; }

        // Navigation properties
        public CarpoolTrip CarpoolTrip { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
