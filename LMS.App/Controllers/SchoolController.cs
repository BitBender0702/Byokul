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
        public async Task<IActionResult> SaveNewSchool([FromBody] SchoolViewModel schoolViewModel)
        {
            //TODO: Need to Implement Blob here
            //await _blobService.DeleteFile("", containerName);
            //schoolViewModel.Avatar = await _blobService.UploadFileAsync(schoolViewModel.AvatarImage, containerName);
            var userId = await GetUserIdAsync(this._userManager);
            await _schoolService.SaveNewSchool(schoolViewModel, userId);
            return Ok("success");
        }

        [Route("updateSchool")]
        [HttpPost]
        public async Task<IActionResult> UpdateSchool([FromBody] SchoolViewModel schoolViewModel)
        {
            await _schoolService.UpdateSchool(schoolViewModel);
            return Ok("success");
        }

        [Route("getSchoolById")]
        [HttpPost]
        public async Task<IActionResult> GetSchoolById(Guid schoolId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _schoolService.GetSchoolById(schoolId, userId);
            return Ok(response);
        }

        [Route("getAllSchools")]
        [HttpPost]
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

        [Route("countryList")]
        [HttpGet]
        public async Task<IActionResult> CountryList()
        {
            return Ok(await _schoolService.CountryList());
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

        [Route("saveSchoolFollower")]
        [HttpPost]
        public async Task<IActionResult> SaveSchoolFollower([FromBody] SchoolFollowerViewModel schoolFollowerViewModel)
        {
            Request.Headers.LastOrDefault();
            var userId = await GetUserIdAsync(this._userManager);
            await _schoolService.SaveSchoolFollower(schoolFollowerViewModel);
            return Ok("success");
        }

        [Route("followerList")]
        [HttpGet]
        public async Task<IActionResult> FollowerList(Guid schoolId)
        {
            return Ok(await _schoolService.FollowerList(schoolId));
        }

        [Route("saveSchoolUser")]
        [HttpPost]
        public async Task<IActionResult> SaveSchoolUser([FromBody] SchoolUserViewModel schoolUserViewModel)
        {
            await _schoolService.SaveSchoolUser(schoolUserViewModel);
            return Ok("success");
        }
    }
}
