using LMS.Common.ViewModels.School;
using LMS.Data.Entity;
using LMS.Services;
using LMS.Services.Blob;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Security.Claims;

namespace LMS.App.Controllers
{
    [Authorize]
    [Route("school")]
    public class SchoolController : BaseController
    {
        public string containerName = "Test";
        private readonly UserManager<User> _userManager;
        private readonly ISchoolService _schoolService;
        private readonly IBlobService _blobService;

        public SchoolController(UserManager<User> userManager, ISchoolService schoolService, IBlobService blobService)
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
            var response = await _schoolService.GetSchoolById(schoolId);
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
        public async Task<IActionResult> FollowerList()
        {
            return Ok(await _schoolService.FollowerList());
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
