using campus_insider.DTOs;
using campus_insider.Models;
using campus_insider.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace campus_insider.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/loans")]
    public class LoansController : ControllerBase
    {
        private readonly LoanService _loanService;

        public LoansController(LoanService loanService)
        {
            _loanService = loanService;
        }

        private long GetCurrentUserId()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return long.TryParse(userIdString, out long userId) ? userId : 0;
        }

        #region --- ADMIN/PUBLIC QUERIES ---

        // GET /api/loans?pageNumber=1&pageSize=20
        [HttpGet]
        public async Task<ActionResult<PagedResult<LoanDto>>> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _loanService.GetAllLoans(pageNumber, pageSize);
            return Ok(result);
        }

        // GET /api/loans/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LoanDto>> GetById(long id)
        {
            var loan = await _loanService.GetLoanById(id);
            if (loan == null) return NotFound(new { message = "Loan not found." });
            return Ok(loan);
        }

        // GET /api/loans/status/pending?pageNumber=1&pageSize=20
        [HttpGet("status/{status}")]
        public async Task<ActionResult<PagedResult<LoanDto>>> GetByStatus(
            string status,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _loanService.GetLoansByStatus(status, pageNumber, pageSize);
            return Ok(result);
        }

        #endregion

        #region --- BORROWER ACTIONS ---

        // POST /api/loans/request
        [HttpPost("request")]
        public async Task<IActionResult> RequestLoan([FromBody] LoanRequestDto request)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var loanDto = new LoanDto
            {
                BorrowerId = userId,
                EquipmentId = request.EquipmentId,
                StartDate = request.StartDate,
                EndDate = request.EndDate
            };

            var result = await _loanService.RequestLoan(loanDto);
            if (!result.Success) return BadRequest(new { message = result.ErrorMessage });

            return StatusCode(201, new { message = "Loan requested successfully." });
        }

        // PATCH /api/loans/5/cancel
        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> Cancel(long id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var loan = await _loanService.GetLoanById(id);
            if (loan == null) return NotFound(new { message = "Loan not found." });
            if (loan.BorrowerId != userId) return Forbid();

            var result = await _loanService.CancelLoan(id, userId);
            if (!result.Success) return BadRequest(new { message = result.ErrorMessage });

            return Ok(new { message = "Loan cancelled successfully." });
        }

        // PATCH /api/loans/5/extend
        [HttpPatch("{id}/extend")]
        public async Task<IActionResult> Extend(long id, [FromBody] ExtendLoanDto extendDto)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var loan = await _loanService.GetLoanById(id);
            if (loan == null) return NotFound(new { message = "Loan not found." });
            if (loan.BorrowerId != userId) return Forbid();

            var result = await _loanService.ExtendLoan(id, extendDto.NewEndDate);
            if (!result.Success) return BadRequest(new { message = result.ErrorMessage });

            return Ok(new { message = "Extension requested successfully." });
        }

        // PATCH /api/loans/5/complete
        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> Complete(long id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var loan = await _loanService.GetLoanById(id);
            if (loan == null) return NotFound(new { message = "Loan not found." });
            if (loan.BorrowerId != userId) return Forbid();

            var result = await _loanService.CompleteLoan(id);
            if (!result.Success) return BadRequest(new { message = result.ErrorMessage });

            return Ok(new { message = "Loan completed successfully." });
        }

        // GET /api/loans/my-loans?status=APPROVED&pageNumber=1&pageSize=20
        [HttpGet("my-loans")]
        public async Task<ActionResult<PagedResult<LoanDto>>> GetMyLoans(
            [FromQuery] string? status = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var result = await _loanService.GetUserLoans(userId, status, pageNumber, pageSize);
            return Ok(result);
        }

        // GET /api/loans/my-loans/overdue
        [HttpGet("my-loans/overdue")]
        public async Task<ActionResult<List<LoanDto>>> GetMyOverdueLoans()
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var result = await _loanService.GetUserOverdueLoans(userId);
            return Ok(result);
        }

        #endregion

        #region --- EQUIPMENT OWNER ACTIONS ---

        // PATCH /api/loans/5/approve
        [HttpPatch("{id}/approve")]
        public async Task<IActionResult> Approve(long id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var isOwner = await _loanService.IsEquipmentOwner(id, userId);
            if (!isOwner) return Forbid();

            var result = await _loanService.ApproveLoan(id);
            if (!result.Success) return BadRequest(new { message = result.ErrorMessage });

            return Ok(new { message = "Loan approved successfully." });
        }

        // PATCH /api/loans/5/reject
        [HttpPatch("{id}/reject")]
        public async Task<IActionResult> Reject(long id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var isOwner = await _loanService.IsEquipmentOwner(id, userId);
            if (!isOwner) return Forbid();

            var result = await _loanService.RejectLoan(id);
            if (!result.Success) return BadRequest(new { message = result.ErrorMessage });

            return Ok(new { message = "Loan rejected successfully." });
        }

        // PATCH /api/loans/5/approve-extension
        [HttpPatch("{id}/approve-extension")]
        public async Task<IActionResult> ApproveExtension(long id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var isOwner = await _loanService.IsEquipmentOwner(id, userId);
            if (!isOwner) return Forbid();

            var result = await _loanService.ApproveExtension(id);
            if (!result.Success) return BadRequest(new { message = result.ErrorMessage });

            return Ok(new { message = "Extension approved successfully." });
        }

        // GET /api/loans/my-equipment-loans?status=PENDING
        [HttpGet("my-equipment-loans")]
        public async Task<ActionResult<PagedResult<LoanDto>>> GetMyEquipmentLoans(
            [FromQuery] string? status = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var result = await _loanService.GetOwnerLoans(userId, status, pageNumber, pageSize);
            return Ok(result);
        }
        #endregion
    }

    #region --- DTOs for Request Bodies ---

    public class LoanRequestDto
    {
        public long EquipmentId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class ExtendLoanDto
    {
        public DateTime NewEndDate { get; set; }
    }

    #endregion
}