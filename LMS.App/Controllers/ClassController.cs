﻿using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Data.Entity;
using LMS.Services;
using LMS.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Authorize]
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
        public async Task<IActionResult> UpdateClass(ClassUpdateViewModel classUpdateViewModel)
        {
            var response = await _classService.UpdateClass(classUpdateViewModel);
            return Ok(response);
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
        [HttpGet]
        public async Task<IActionResult> GetClassById(string className)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _classService.GetClassById(className, userId);
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

        [Route("saveClassLanguages")]
        [HttpPost]
        public async Task<IActionResult> SaveClassLanguages([FromBody] SaveClassLanguageViewModel model)
        {
            await _classService.SaveClassLanguages(model.LanguageIds, new Guid(model.ClassId));
            return Ok();
        }

        [Route("deleteClassLanguage")]
        [HttpPost]
        public async Task<IActionResult> DeleteClassLanguage([FromBody] ClassLanguageViewModel model)
        {
            await _classService.DeleteClassLanguage(model);
            return Ok();
        }

        [Route("saveClassTeachers")]
        [HttpPost]
        public async Task<IActionResult> SaveClassTeachers([FromBody] SaveClassTeacherViewModel model)
        {
            await _classService.SaveClassTeachers(model.TeacherIds, new Guid(model.ClassId));
            return Ok();
        }

        [Route("deleteClassTeacher")]
        [HttpPost]
        public async Task<IActionResult> DeleteClassTeacher([FromBody] ClassTeacherViewModel model)
        {
            await _classService.DeleteClassTeacher(model);
            return Ok();
        }

        [Route("saveClassCertificates")]
        [HttpPost]
        public async Task<IActionResult> SaveClassCertificates(SaveClassCertificateViewModel model)
        {
            await _classService.SaveClassCertificates(model);
            return Ok();
        }

        [Route("deleteClassCertificate")]
        [HttpPost]
        public async Task<IActionResult> DeleteClassCertificate([FromBody] ClassCertificateViewModel model)
        {
            await _classService.DeleteClassCertificate(model);
            return Ok();
        }

        [Route("getBasicClassInfo")]
        [HttpGet]
        public async Task<IActionResult> GetBasicClassInfo(Guid classId)
        {
            var response = await _classService.GetBasicClassInfo(classId);
            return Ok(response);
        }

        [Route("isClassNameExist")]
        [HttpGet]
        public async Task<IActionResult> IsClassNameExist(string className)
        {
            return Ok(await _classService.IsClassNameExist(className));
        }

        [Route("getClassByName")]
        [HttpGet]
        public async Task<IActionResult> GetClassByName(string className,string schoolName)
        {
            var response = await _classService.GetClassByName(className,schoolName);
            return Ok(response);
        }

        [Route("convertToCourse")]
        [HttpPost]
        public async Task<IActionResult> ConvertToCourse(string className)
        {
           var response = await _classService.ConvertToCourse(className);
            return Ok(response);
        }

        [Route("classView")]
        [HttpPost]
        public async Task<IActionResult> ClassView([FromBody] ClassViewsViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            model.UserId = userId;
            var response = await _classService.ClassView(model);
            return Ok(response);
        }

        [Route("getPostsByClass")]
        [HttpGet]
        public async Task<IActionResult> GetPostsByClass(Guid classId, int pageNumber, int pageSize = 4)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _classService.GetPostsByClassId(classId, userId, pageNumber, pageSize);
            return Ok(response);
        }

        [Route("getReelsByClass")]
        [HttpGet]
        public async Task<IActionResult> GetReelsByClass(Guid classId, int pageNumber, int pageSize = 4)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _classService.GetReelsByClassId(classId, userId, pageNumber, pageSize);
            return Ok(response);
        }

        [Route("getClassFilters")]
        [HttpGet]
        public async Task<IActionResult> GetClassFilters(string userId,Guid schoolId)
        {
            var response = await _classService.GetClassFilters(userId, schoolId);
            return Ok(response);
        }

        [Route("saveClassFilters")]
        [HttpPost]
        public async Task<IActionResult> SaveClassFilters([FromBody] List<UserClassCourseFilterViewModel> model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _classService.SaveClassFilters(model, userId);
            return Ok();
        }

        [Route("getClassInfoForCertificate")]
        [HttpGet]
        public async Task<IActionResult> GetClassInfoForCertificate(Guid classId)
        {
            var response = await _classService.GetClassInfoForCertificate(classId);
            return Ok(response);
        }

    }
}
