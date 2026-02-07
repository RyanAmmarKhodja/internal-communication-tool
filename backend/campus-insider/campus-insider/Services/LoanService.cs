using campus_insider.Data;
using campus_insider.DTOs;
using campus_insider.Models;
using Microsoft.EntityFrameworkCore;

namespace campus_insider.Services
{
    // Result type to replace exceptions
    

    // Pagination wrapper
    public class PagedResult<T>
    {
        public List<T> Items { get; init; } = new();
        public int TotalCount { get; init; }
        public int PageNumber { get; init; }
        public int PageSize { get; init; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public bool HasPrevious => PageNumber > 1;
        public bool HasNext => PageNumber < TotalPages;
    }

    public class LoanService
    {
        private readonly AppDbContext _context;

        public LoanService(AppDbContext context)
        {
            _context = context;
        }

        #region --- Queries (Read) ---

        public async Task<PagedResult<LoanDto>> GetAllLoans(int pageNumber = 1, int pageSize = 20)
        {
            var query = _context.Loans.AsNoTracking();

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<LoanDto>
            {
                Items = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<LoanDto?> GetLoanById(long id)
        {
            var loan = await _context.Loans.AsNoTracking().FirstOrDefaultAsync(l => l.Id == id);
            return loan != null ? MapToDto(loan) : null;
        }

        public async Task<PagedResult<LoanDto>> GetLoansByStatus(string status, int pageNumber = 1, int pageSize = 20)
        {
            var query = _context.Loans.AsNoTracking().Where(l => l.Status == status);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<LoanDto>
            {
                Items = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<PagedResult<LoanDto>> GetUserLoans(long userId, string? status = null, int pageNumber = 1, int pageSize = 20)
        {
            var query = _context.Loans.AsNoTracking().Where(l => l.BorrowerId == userId);
            if (!string.IsNullOrEmpty(status)) query = query.Where(l => l.Status == status);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<LoanDto>
            {
                Items = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<List<LoanDto>> GetUserOverdueLoans(long userId)
        {
            var loans = await _context.Loans
                .AsNoTracking()
                .Where(l => l.BorrowerId == userId &&
                            l.Status == "APPROVED" &&
                            l.EndDate < DateTime.UtcNow)
                .ToListAsync();

            return loans.Select(MapToDto).ToList();
        }

        #endregion

        #region --- Core Logic (Write) ---

        public async Task<ServiceResult> RequestLoan(LoanDto request)
        {
            if (!await _context.Equipment.AnyAsync(e => e.Id == request.EquipmentId))
                return ServiceResult.Fail("Equipment not found.");

            if (!await IsAvailable(request.EquipmentId, request.StartDate, request.EndDate))
                return ServiceResult.Fail("Equipment is already booked for these dates.");

            var loan = new Loan
            {
                EquipmentId = request.EquipmentId,
                BorrowerId = request.BorrowerId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow
            };

            _context.Loans.Add(loan);
            await _context.SaveChangesAsync();
            return ServiceResult.Ok();
        }

        public async Task<ServiceResult> ApproveLoan(long loanId)
        {
            var loan = await _context.Loans.FindAsync(loanId);
            if (loan == null) return ServiceResult.Fail("Loan not found.");
            if (loan.Status != "PENDING") return ServiceResult.Fail("Only PENDING loans can be approved.");

            if (!await IsAvailable(loan.EquipmentId, loan.StartDate, loan.EndDate, loanId))
                return ServiceResult.Fail("Schedule conflict: Equipment no longer available.");

            loan.Status = "APPROVED";
            await _context.SaveChangesAsync();
            return ServiceResult.Ok();
        }

        public async Task<ServiceResult> RejectLoan(long loanId)
        {
            var loan = await _context.Loans.FindAsync(loanId);
            if (loan == null) return ServiceResult.Fail("Loan not found.");

            loan.Status = "DENIED";
            await _context.SaveChangesAsync();
            return ServiceResult.Ok();
        }

        public async Task<ServiceResult> CancelLoan(long loanId, long requestingUserId)
        {
            var loan = await _context.Loans.FindAsync(loanId);
            if (loan == null) return ServiceResult.Fail("Loan not found.");

            if (DateTime.UtcNow >= loan.StartDate)
                return ServiceResult.Fail("Loan has already started.");

            loan.Status = "CANCELLED";
            await _context.SaveChangesAsync();
            return ServiceResult.Ok();
        }

        public async Task<ServiceResult> CompleteLoan(long loanId)
        {
            var loan = await _context.Loans.FindAsync(loanId);
            if (loan == null || loan.Status != "APPROVED")
                return ServiceResult.Fail("Loan not found or not approved.");

            loan.Status = "COMPLETED";
            loan.ReturnedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return ServiceResult.Ok();
        }

        public async Task<ServiceResult> ExtendLoan(long loanId, DateTime newEndDate)
        {
            var loan = await _context.Loans.FindAsync(loanId);
            if (loan == null || loan.Status != "APPROVED")
                return ServiceResult.Fail("Loan not found or not approved.");

            if (newEndDate <= loan.EndDate)
                return ServiceResult.Fail("New date must be after current end date.");

            if (!await IsAvailable(loan.EquipmentId, loan.EndDate, newEndDate, loan.Id))
                return ServiceResult.Fail("Equipment is booked during the extension period.");

            loan.RequestedEndDate = newEndDate;
            loan.Status = "EXTENSION_PENDING";
            await _context.SaveChangesAsync();
            return ServiceResult.Ok();
        }

        public async Task<ServiceResult> ApproveExtension(long loanId)
        {
            var loan = await _context.Loans.FindAsync(loanId);
            if (loan == null || loan.Status != "EXTENSION_PENDING")
                return ServiceResult.Fail("No extension request found.");

            if (!await IsAvailable(loan.EquipmentId, loan.EndDate, loan.RequestedEndDate ?? loan.EndDate, loanId))
                return ServiceResult.Fail("Schedule conflict: Equipment no longer available for extension.");

            loan.EndDate = loan.RequestedEndDate ?? loan.EndDate;
            loan.RequestedEndDate = null;
            loan.Status = "APPROVED";
            await _context.SaveChangesAsync();
            return ServiceResult.Ok();
        }

        // Get all loans for equipment owned by this user
        public async Task<PagedResult<LoanDto>> GetOwnerLoans(long ownerId, string? status = null, int pageNumber = 1, int pageSize = 20)
        {
            var query = from loan in _context.Loans.AsNoTracking()
                        join equipment in _context.Equipment on loan.EquipmentId equals equipment.Id
                        where equipment.OwnerId == ownerId
                        select loan;

            if (!string.IsNullOrEmpty(status))
                query = query.Where(l => l.Status == status);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<LoanDto>
            {
                Items = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        #endregion

        #region --- Helpers & Validation ---

        private async Task<bool> IsAvailable(long equipmentId, DateTime start, DateTime end, long? excludeId = null)
        {
            return !await _context.Loans.AnyAsync(l =>
                l.EquipmentId == equipmentId &&
                l.Id != excludeId &&
                (l.Status == "APPROVED" || l.Status == "EXTENSION_PENDING") &&
                start < l.EndDate && end > l.StartDate);
        }

        // FIXED: No navigation property access, explicit join
        public async Task<bool> IsEquipmentOwner(long loanId, long userId)
        {
            return await _context.Loans
                .Where(l => l.Id == loanId)
                .Join(_context.Equipment,
                    loan => loan.EquipmentId,
                    equipment => equipment.Id,
                    (loan, equipment) => equipment.OwnerId)
                .AnyAsync(ownerId => ownerId == userId);
        }

        private static LoanDto MapToDto(Loan loan) => new LoanDto
        {
            Id = loan.Id,
            EquipmentId = loan.EquipmentId,
            BorrowerId = loan.BorrowerId,
            StartDate = loan.StartDate,
            EndDate = loan.EndDate,
            Status = loan.Status,
            CreatedAt = loan.CreatedAt
        };

        #endregion
    }
}