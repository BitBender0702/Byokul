using LMS.Common.ViewModels.Course;
using LMS.Data.Entity;
using LMS.Services;
using LMS.Services.Common;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Route("course")]
    public class CourseController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly ICourseService _courseService;
        private readonly ICommonService _commonService;

        public CourseController(UserManager<User> userManager, ICourseService courseService, ICommonService commonService)
        {
            _userManager = userManager;
            _courseService = courseService;
            _commonService = commonService;
        }

        [Route("saveNewCourse")]
        [HttpPost]
        public async Task<IActionResult> SaveNewCourse(CourseViewModel courseViewModel)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var courseId = await _courseService.SaveNewCourse(courseViewModel, userId);
            return Ok(courseId);
        }

        [Route("updateCourse")]
        [HttpPost]
        public async Task<IActionResult> UpdateCourse([FromBody] CourseViewModel courseViewModel)
        {
            await _courseService.UpdateCourse(courseViewModel);
            return Ok("success");
        }

        [Route("deleteCourseById")]
        [HttpPost]
        public async Task<IActionResult> DeleteCourseById(Guid courseId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _courseService.DeleteCourseById(courseId, userId);
            return Ok();
        }

        [Route("getCourseById")]
        [HttpPost]
        public async Task<IActionResult> GetCourseById(Guid courseId)
        {
            var response = await _courseService.GetCourseById(courseId);
            return Ok(response);
        }

        [Route("getAllCourses")]
        [HttpPost]
        public async Task<IActionResult> GetAllCourses()
        {
            var response = await _courseService.GetAllCourses();
            return Ok(response);
        }

        [Route("languageList")]
        [HttpGet]
        public async Task<IActionResult> LanguageList()
        {
            return Ok(await _commonService.LanguageList());
        }

        [Route("getDisciplines")]
        [HttpGet]
        public async Task<IActionResult> GetDisciplines()
        {
            var response = await _commonService.GetDisciplines();
            return Ok(response);
        }

        [Route("getBasicCourseInfo")]
        [HttpGet]
        public async Task<IActionResult> GetBasicCourseInfo(Guid courseId)
        {
            var response = await _courseService.GetBasicCourseInfo(courseId);
            return Ok(response);
        }

    }
}
