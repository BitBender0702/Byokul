using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    public class OwnerController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
