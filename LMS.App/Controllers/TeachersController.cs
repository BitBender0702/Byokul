using LMS.Common.ViewModels.Teacher;
using LMS.Data.Entity;
using LMS.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Route("teachers")]
    public class TeachersController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly ITeacherService _teacherService;

        public TeachersController(UserManager<User> userManager, ITeacherService teacherService)
        {
            _userManager = userManager;
            _teacherService = teacherService;
        }

        [Route("saveNewTeacher")]
        [HttpPost]
        public async Task<IActionResult> SaveNewTeacher([FromBody] TeacherViewModel teacherViewModel, Guid schoolId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _teacherService.SaveNewTeacher(teacherViewModel, schoolId, userId);
            return Ok("success");
        }

        [Route("updateTeacher")]
        [HttpPost]
        public async Task<IActionResult> UpdateTeacher([FromBody] TeacherViewModel teacherViewModel)
        {
            await _teacherService.UpdateTeacher(teacherViewModel);
            return Ok("success");
        }

        [Route("getTeacherById")]
        [HttpPost]
        public async Task<IActionResult> GetTeacherById(Guid teacherId)
        {
            var response = await _teacherService.GetTeacherById(teacherId);
            return Ok(response);
        }

        [Route("deleteTeacherById")]
        [HttpPost]
        public async Task<IActionResult> DeleteTeacherById(Guid teacherId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _teacherService.DeleteTeacherById(teacherId, userId);
            return Ok("success");
        }

        [Route("getAllTeachers")]
        [HttpGet]
        public async Task<IActionResult> GetAllTeachers()
        {
            var response = await _teacherService.GetAllTeachers();
            return Ok(response);
        }
    }
}
