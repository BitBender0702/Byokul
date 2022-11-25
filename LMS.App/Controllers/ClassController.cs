using LMS.Common.ViewModels.Class;
using LMS.Data.Entity;
using LMS.Services;
using LMS.Services.Common;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Route("class")]
    public class ClassController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IClassService _classService;
        private readonly ICommonService _commonService;

        public ClassController(UserManager<User> userManager, IClassService classService, ICommonService commonService)
        {
            _userManager = userManager;
            _classService = classService;
            _commonService = commonService;
        }

        [Route("saveNewClass")]
        [HttpPost]
        public async Task<IActionResult> SaveNewClass(ClassViewModel classViewModel)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var classId = await _classService.SaveNewClass(classViewModel, userId);
            return Ok(classId);
        }

        [Route("getClassEditDetails")]
        [HttpGet]
        public async Task<IActionResult> GetClassEditDetails(Guid classId)
        {
            var response = await _classService.GetClassEditDetails(classId);
            return Ok(response);
        }

        [Route("updateClass")]
        [HttpPost]
        public async Task<IActionResult> UpdateClass([FromBody] ClassUpdateViewModel classUpdateViewModel)
        {
            await _classService.UpdateClass(classUpdateViewModel);
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

        [Route("getDisciplines")]
        [HttpGet]
        public async Task<IActionResult> GetDisciplines()
        {
            var response = await _commonService.GetDisciplines();
            return Ok(response);
        }

        [Route("languageList")]
        [HttpGet]
        public async Task<IActionResult> LanguageList()
        {
            return Ok(await _commonService.LanguageList());
        }

        [Route("getServiceType")]
        [HttpGet]
        public async Task<IActionResult> GetServiceType()
        {
            return Ok(await _commonService.GetServiceType());
        }

        [Route("getAccessibility")]
        [HttpGet]
        public async Task<IActionResult> GetAccessibility()
        {
            return Ok(await _commonService.GetAccessibility());
        }

    }
}
