using LMS.Data.Entity;
using LMS.Services.UserDashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

namespace LMS.App.Controllers
{
    //[Authorize]
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
            //var tokenInfo = new JwtSecurityToken(jwtEncodedString: token);
            //var id = await this._userManager.FindByEmailAsync(tokenInfo.Claims.FirstOrDefault(x => x.Value));
            var userId = await GetUserIdAsync(this._userManager);
            //var userId = "d2e00a9d-c26a-4389-a8b3-470a575ef8f4";
            var response = await _userDashboardService.UserDashboard(userId);
            return Ok(response);
        }
    }
}
