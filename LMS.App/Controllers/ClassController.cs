using LMS.Common.ViewModels.Class;
using LMS.Data.Entity;
using LMS.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Route("class")]
    public class ClassController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IClassService _classService;

        public ClassController(UserManager<User> userManager, IClassService classService)
        {
            _userManager = userManager;
            _classService = classService;
        }

        [Route("saveNewClass")]
        [HttpPost]
        public async Task<IActionResult> SaveNewClass([FromBody] ClassViewModel classViewModel)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _classService.SaveNewClass(classViewModel, userId);
            return Ok("success");
        }

        [Route("updateClass")]
        [HttpPost]
        public async Task<IActionResult> UpdateClass([FromBody] ClassViewModel classViewModel)
        {
            await _classService.UpdateClass(classViewModel);
            return Ok("success");
        }

        [Route("deleteClassById")]
        [HttpPost]
        public async Task<IActionResult> DeleteClassById(Guid classId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _classService.DeleteClassById(classId, userId);
            return Ok();
        }

        [Route("getClassById")]
        [HttpPost]
        public async Task<IActionResult> GetClassById(Guid classId)
        {
            var response = await _classService.GetClassById(classId);
            return Ok(response);
        }

        [Route("getAllClasses")]
        [HttpPost]
        public async Task<IActionResult> GetAllClasses()
        {
            var response = await _classService.GetAllClasses();
            return Ok(response);
        }
    }
}
