using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
