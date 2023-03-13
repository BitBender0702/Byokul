using LMS.Data.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    public class BaseController : Controller
    {
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<string> GetUserIdAsync(UserManager<User> userManager)
        {
            var userClaim = User.FindFirst("jti");
            return userClaim.Value;
        }
    }
}

