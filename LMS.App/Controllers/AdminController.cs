﻿using LMS.Common.ViewModels.Admin;
using LMS.Services.Admin;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Route("admins")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [Route("getRegisteredUsers")]
        [HttpGet]
        public async Task<IActionResult> GetRegisteredUsers()
        {
            var response = await _adminService.GetRegisteredUsers();
            return Ok(response);
        }

        [Route("banUser")]
        [HttpPost]
        public async Task<IActionResult> BanUser([FromBody] BanUsersViewModel model)
        {
            var response = await _adminService.BanUser(model);
            return Ok(response);
        }

        [Route("verifyUser")]
        [HttpPost]
        public async Task<IActionResult> VerifyUser([FromBody] VerifyUsersViewModel model)
        {
            var response = await _adminService.VerifyUser(model);
            return Ok(response);
        }

        [Route("getRegisteredSchools")]
        [HttpGet]
        public async Task<IActionResult> GetRegisteredSchoools()
        {
            var response = await _adminService.GetRegisteredSchools();
            return Ok(response);
        }

        [Route("banSchool")]
        [HttpPost]
        public async Task<IActionResult> BanSchool([FromBody] BanSchoolsViewModel model)
        {
            var response = await _adminService.BanSchool(model);
            return Ok(response);
        }


        [Route("verifySchool")]
        [HttpPost]
        public async Task<IActionResult> VerifySchool([FromBody] VerifySchoolsViewModel model)
        {
            var response = await _adminService.VerifySchool(model);
            return Ok(response);
        }

        [Route("getRegisteredClasses")]
        [HttpGet]
        public async Task<IActionResult> GetRegisteredClasses()
        {
            var response = await _adminService.GetRegisteredClasses();
            return Ok(response);
        }

        [Route("getRegisteredCourses")]
        [HttpGet]
        public async Task<IActionResult> GetRegisteredCourses()
        {
            var response = await _adminService.GetRegisteredCourses();
            return Ok(response);
        }

        [Route("disableClass")]
        [HttpPost]
        public async Task<IActionResult> DisableClass([FromBody] DisableClassCourseViewModel model)
        {
            var response = await _adminService.DisableClass(model);
            return Ok(response);
        }

        [Route("disableCourse")]
        [HttpPost]
        public async Task<IActionResult> DisableCourse([FromBody] DisableClassCourseViewModel model)
        {
            var response = await _adminService.DisableCourse(model);
            return Ok(response);
        }


        [Route("getDashboardDetails")]
        [HttpGet]
        public async Task<IActionResult> GetDashboardDetails()
        {
            var response = await _adminService.GetDashboardDetails();
            return Ok(response);
        }

        [Route("getAllSchoolTransactions")]
        [HttpGet]
        public async Task<IActionResult> GetAllSchoolTransactions()
        {
            var response = await _adminService.GetAllSchoolTransactions();
            return Ok(response);
        }

        [Route("getAllClassCourseTransactions")]
        [HttpGet]
        public async Task<IActionResult> GetAllClassCourseTransactions()
        {
            var response = await _adminService.GetAllClassCourseTransactions();
            return Ok(response);
        }
    }
}
