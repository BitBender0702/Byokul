using LMS.Common.Enums;
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
        private readonly IWebHostEnvironment _webHostEnvironment;
        public UserDashboardController(UserManager<User> userManager, IUserDashboardService userDashboardService, IWebHostEnvironment webHostEnvironment)
        {
            _userManager = userManager;
            _userDashboardService = userDashboardService;
            _webHostEnvironment = webHostEnvironment;
        }

        [Route("dashboardDetails")]
        [HttpGet]
        public async Task<IActionResult> DashboardDetails()
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _userDashboardService.UserDashboard(userId);
            return Ok(response);
        }

        [Route("getLanguageJson")]
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetLanguageJson(LanguageEnum language)
        {
            var directorypath = Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot", "assets", "i18n");
            if (language == LanguageEnum.English)
            {
                string filePath = Path.Combine(directorypath, "en.json");
                if (System.IO.File.Exists(filePath))
                {
                    string jsonContent = System.IO.File.ReadAllText(filePath);
                    return Content(jsonContent, "application/json");
                }
            }

            if (language == LanguageEnum.Turkish)
            {
                string filePath = Path.Combine(directorypath, "tr.json");
                if (System.IO.File.Exists(filePath))
                {
                    string jsonContent = System.IO.File.ReadAllText(filePath);
                    return Content(jsonContent, "application/json");
                }
            }

            if (language == LanguageEnum.Arabic)
            {
                string filePath = Path.Combine(directorypath, "ar.json");
                if (System.IO.File.Exists(filePath))
                {
                    string jsonContent = System.IO.File.ReadAllText(filePath);
                    return Content(jsonContent, "application/json");
                }
            }

            if (language == LanguageEnum.Spanish)
            {
                string filePath = Path.Combine(directorypath, "sp.json");
                if (System.IO.File.Exists(filePath))
                {
                    string jsonContent = System.IO.File.ReadAllText(filePath);
                    return Content(jsonContent, "application/json");
                }
            }

            return null;
        }
    }
}
