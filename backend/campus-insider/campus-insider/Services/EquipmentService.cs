using campus_insider.Data;
using campus_insider.DTOs;
using campus_insider.Models;
using Microsoft.EntityFrameworkCore;

namespace campus_insider.Services
{
    public class EquipmentService
    {
        private readonly AppDbContext _context;

        public EquipmentService(AppDbContext context)
        {
            _context = context; 
        }

        public async Task<List<Equipment>> GetAllAsync() {
            return await _context.Equipment.AsNoTracking().ToListAsync();
        
        }

        public async Task<Equipment> GetByIdAsync(long id)
        {
            return await _context.Equipment.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<Equipment> CreateAsync(Equipment equipment)
        {
            _context.Equipment.Add(equipment);
            await _context.SaveChangesAsync();
            return equipment;
        }
    }
}
