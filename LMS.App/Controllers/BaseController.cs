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
            //var results = await userManager.FindByEmailAsync(User.Identity.Name.ToString());
            //return results.Id;
            return "d2e00a9d-c26a-4389-a8b3-470a575ef8f4";
        }
    }
}

