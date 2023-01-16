using LMS.Common.Enums;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Data.Entity;
using LMS.Services;
using LMS.Services.Blob;
using LMS.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.IO.Compression;
using System.Security.Claims;

namespace LMS.App.Controllers
{
    [Route("school")]
    public class SchoolController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly ISchoolService _schoolService;
        private readonly IBlobService _blobService;
        private readonly ICommonService _commonService;

        public SchoolController(UserManager<User> userManager, ISchoolService schoolService,  IBlobService blobService)
        {
            _userManager = userManager;
            _schoolService = schoolService;
            _blobService = blobService;
        }

        [Route("saveNewSchool")]
        [HttpPost]
        public async Task<IActionResult> SaveNewSchool(SchoolViewModel schoolViewModel)
        {

            var langList = JsonConvert.DeserializeObject<string[]>(schoolViewModel.LanguageIds.First());
            schoolViewModel.LanguageIds = langList;
            //TODO: Need to Implement Blob here
            //await _blobService.DeleteFile("", containerName);
            //schoolViewModel.Avatar = await _blobService.UploadFileAsync(schoolViewModel.AvatarImage, containerName);
            var userId = await GetUserIdAsync(this._userManager);
            var schoolId = await _schoolService.SaveNewSchool(schoolViewModel, userId);
            return Ok(schoolId);
        }

        [Route("getSchoolEditDetails")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolEditDetails(Guid schoolId)
        {
            var response = await _schoolService.GetSchoolEditDetails(schoolId);
            return Ok(response);
        }

        [Route("updateSchool")]
        [HttpPost]
        public async Task<IActionResult> UpdateSchool(SchoolUpdateViewModel schoolUpdateViewModel)
        {
            var schoolId = await _schoolService.UpdateSchool(schoolUpdateViewModel);
            return Ok(schoolId);
        }

        [Route("getSchoolById")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolById(string schoolName)
        
        
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _schoolService.GetSchoolById(schoolName, userId);    
            return Ok(response);
        }

        [Route("getAllSchools")]
        [HttpGet]
        public async Task<IActionResult> GetAllSchools()
        {
            var response = await _schoolService.GetAllSchools();
            return Ok(response);
        }

        [Route("deleteSchoolById")]
        [HttpPost]
        public async Task<IActionResult> DeleteSchoolById(Guid schoolId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _schoolService.DeleteSchoolById(schoolId, userId);
            return Ok();
        }

        [Route("specializationList")]
        [HttpGet]
        public async Task<IActionResult> SpecializationList()
        {
            return Ok(await _schoolService.SpecializationList());
        }

        [Route("languageList")]
        [HttpGet]
        public async Task<IActionResult> LanguageList()
        {
            return Ok(await _schoolService.LanguageList());
        }

        [Route("followUnfollowSchool")]
        [HttpPost]
        public async Task<IActionResult> FollowUnfollowSchool([FromBody] FollowUnFollowViewModel model)
        {
            var followerId = await GetUserIdAsync(this._userManager);
            var response = await _schoolService.FollowUnFollowSchool(model, followerId);
            return Ok(response);
        }


        [Route("saveSchoolUser")]
        [HttpPost]
        public async Task<IActionResult> SaveSchoolUser([FromBody] SchoolUserViewModel schoolUserViewModel)
        {
            await _schoolService.SaveSchoolUser(schoolUserViewModel);
            return Ok("success");
        }

        [Route("saveSchoolCertificates")]
        [HttpPost]
        public async Task<IActionResult> SaveSchoolCertificates(SaveSchoolCertificateViewModel model)
        {
            await _schoolService.SaveSchoolCertificates(model);
            return Ok();
        }

        [Route("deleteSchoolCertificate")]
        [HttpPost]
        public async Task<IActionResult> DeleteSchoolCertificate([FromBody] SchoolCertificateViewModel model)
        {
            await _schoolService.DeleteSchoolCertificate(model);
            return Ok();
        }

        [Route("defaultLogoList")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolDefaultLogos()
        {
            return Ok(await _schoolService.GetSchoolDefaultLogos());
        }


        // if add languages from school profile
        [Route("saveSchoolLanguages")]
        [HttpPost]
        public async Task<IActionResult> SaveSchoolLanguages([FromBody]SaveSchoolLanguageViewModel model)
        {
            await _schoolService.SaveSchoolLanguages(model.LanguageIds, new Guid(model.SchoolId));
            return Ok();
        }

        [Route("deleteSchoolLanguage")]
        [HttpPost]
        public async Task<IActionResult> DeleteSchoolLanguage([FromBody]SchoolLanguageViewModel model)
        {
            await _schoolService.DeleteSchoolLanguage(model);
            return Ok();
        }

        [Route("saveSchoolTeachers")]
        [HttpPost]
        public async Task<IActionResult> SaveSchoolTeachers([FromBody] SaveSchoolTeacherViewModel model)
        {
            await _schoolService.SaveSchoolTeachers(model);
            return Ok();
        }

        [Route("deleteSchoolTeacher")]
        [HttpPost]
        public async Task<IActionResult> DeleteSchoolTeacher([FromBody] SchoolTeacherViewModel model)
        {
            await _schoolService.DeleteSchoolTeacher(model);
            return Ok();
        }

        [Route("getBasicSchoolInfo")]
        [HttpGet]
        public async Task<IActionResult> GetBasicSchoolInfo(Guid schoolId)
        {
            var school = await _schoolService.GetBasicSchoolInfo(schoolId);
            return Ok(school);
        }

        [Route("schoolFollowers")]
        [HttpGet]
        public async Task<IActionResult> SchoolFollowers(Guid schoolId)
        {
            return Ok(await _schoolService.GetSchoolFollowers(schoolId));
        }

        [Route("isSchoolNameExist")]
        [HttpGet]
        public async Task<IActionResult> IsSchoolNameExist(string schoolName)
        {
            return Ok(await _schoolService.IsSchoolNameExist(schoolName));
        }

        [Route("getSchoolByName")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolByName(string schoolName)
        {
            var response = await _schoolService.GetSchoolByName(schoolName);
            return Ok(response);
        }

        [Route("getSchoolClassCourse")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolClassCourse(Guid schoolId)
        {
            var response = await _schoolService.GetSchoolClassCourse(schoolId);
            return Ok(response);
        }

        [Route("pinUnpinClassCourse")]
        [HttpPost]
        public async Task<IActionResult> PinUnpinClassCourse(Guid id, ClassCourseEnum type, bool isPinned)
        {
            var response = await _schoolService.PinUnpinClassCourse(id, type, isPinned);
            return Ok(response);
        }

    }
}
