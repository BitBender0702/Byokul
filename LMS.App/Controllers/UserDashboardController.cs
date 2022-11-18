using LMS.Data.Entity;
using LMS.Services.UserDashboard;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Route("userDashboard")]
    [ApiController]
    public class UserDashboardController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IUserDashboardService _userDashboardService;
        public UserDashboardController(UserManager<User> userManager, IUserDashboardService userDashboardService)
        {
            _userManager = userManager;
            _userDashboardService = userDashboardService;
        }

        [Route("dashboardDetails")]
        [HttpGet]
        public async Task<IActionResult> UserDashboard()
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _userDashboardService.UserDashboard(userId);
            return Ok(response);
        }
    }
}
