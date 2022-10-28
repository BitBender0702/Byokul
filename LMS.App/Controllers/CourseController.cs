using LMS.Common.ViewModels.Course;
using LMS.Data.Entity;
using LMS.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Route("course")]
    public class CourseController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly ICourseService _courseService;

        public CourseController(UserManager<User> userManager, ICourseService courseService)
        {
            _userManager = userManager;
            _courseService = courseService;
        }

        [Route("saveNewCourse")]
        [HttpPost]
        public async Task<IActionResult> SaveNewCourse([FromBody] CourseViewModel courseViewModel)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _courseService.SaveNewCourse(courseViewModel, userId);
            return Ok("success");
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
    }
}
