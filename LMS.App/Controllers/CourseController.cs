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
        [HttpGet]
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


        [Route("saveCourseLanguages")]  
        [HttpPost]
        public async Task<IActionResult> SaveCourseLanguages([FromBody] SaveCourseLanguageViewModel model)
        {
            await _courseService.SaveCourseLanguages(model.LanguageIds, new Guid(model.CourseId));
            return Ok();
        }

        [Route("deleteCourseLanguage")]
        [HttpPost]
        public async Task<IActionResult> DeleteCourseLanguage([FromBody] CourseLanguageViewModel model)
        {
            await _courseService.DeleteCourseLanguage(model);
            return Ok();
        }

        [Route("saveCourseTeachers")]
        [HttpPost]
        public async Task<IActionResult> SaveCourseTeachers([FromBody] SaveCourseTeacherViewModel model)
        {
            await _courseService.SaveCourseTeachers(model.TeacherIds,new Guid(model.CourseId));
            return Ok();
        }

        [Route("deleteCourseTeacher")]
        [HttpPost]
        public async Task<IActionResult> DeleteCourseTeacher([FromBody] CourseTeacherViewModel model)
        {
            await _courseService.DeleteCourseTeacher(model);
            return Ok();
        }

        [Route("saveCourseCertificates")]
        [HttpPost]
        public async Task<IActionResult> SaveCourseCertificates(SaveCourseCertificateViewModel model)
        {
            await _courseService.SaveCourseCertificates(model);
            return Ok();
        }

        [Route("deleteCourseCertificate")]
        [HttpPost]
        public async Task<IActionResult> DeleteCourseCertificate([FromBody] CourseCertificateViewModel model)
        {
            await _courseService.DeleteCourseCertificate(model);
            return Ok();
        }

        [Route("convertToClass")]
        [HttpPost]
        public async Task<IActionResult> ConvertToClass(Guid courseId)
        {
            await _courseService.ConvertToClass(courseId);
            return Ok();
        }

    }
}
