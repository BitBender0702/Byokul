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
            var results = await userManager.FindByEmailAsync(User.Identity.Name.ToString());
            return results.Id;
        }
    }
}

