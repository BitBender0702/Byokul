using LMS.Data.Entity;
using LMS.Services.UserDashboard;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

namespace LMS.App.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("userdashboard")]
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
        public async Task<IActionResult> DashboardDetails()
                {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _userDashboardService.UserDashboard(userId);
            return Ok(response);
        }
    }
}
