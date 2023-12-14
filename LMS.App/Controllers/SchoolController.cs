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
    [Authorize]
    [Route("school")]
    public class SchoolController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly ISchoolService _schoolService;
        private readonly IBlobService _blobService;
        private readonly ICommonService _commonService;
        private readonly IClassService _classService;
        private readonly ICourseService _courseService;

        public SchoolController(UserManager<User> userManager, ISchoolService schoolService, IBlobService blobService, IClassService classService, ICourseService courseService)
        {
            _userManager = userManager;
            _schoolService = schoolService;
            _blobService = blobService;
            _classService = classService;
            _courseService = courseService;
        }

        [Route("saveNewSchool")]
        [HttpPost]
        public async Task<IActionResult> SaveNewSchool(SchoolViewModel schoolViewModel)
        {

            var langList = JsonConvert.DeserializeObject<string[]>(schoolViewModel.LanguageIds.First());
            schoolViewModel.LanguageIds = langList;
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
            var response = await _schoolService.UpdateSchool(schoolUpdateViewModel);
            return Ok(response);
        }

        [Route("getSchoolByName")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolByName(string schoolName)

        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _schoolService.GetSchoolByName(schoolName, userId);
            return Ok(response);
        }

        [Route("getSchoolById")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolById(Guid schoolId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _schoolService.GetSchoolById(schoolId, userId);
            return Ok(response);
        }

        [Route("getAllSchools")]
        [HttpGet]
        public async Task<IActionResult> GetAllSchools()
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _schoolService.GetAllSchools(userId);
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

        [Route("restoreSchoolById")]
        [HttpPost]
        public async Task<IActionResult> RestoreSchoolById(Guid schoolId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _schoolService.RestoreSchoolById(schoolId, userId);
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
        public async Task<IActionResult> SaveSchoolLanguages([FromBody] SaveSchoolLanguageViewModel model)
        {
            await _schoolService.SaveSchoolLanguages(model.LanguageIds, new Guid(model.SchoolId));
            return Ok();
        }

        [Route("deleteSchoolLanguage")]
        [HttpPost]
        public async Task<IActionResult> DeleteSchoolLanguage([FromBody] SchoolLanguageViewModel model)
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
            var result = await _schoolService.DeleteSchoolTeacher(model);
            if (result)
            {
                return Ok(new { Success = true, Message = Constants.TeacherDeletedSuccesfully });
            }
            return BadRequest(new { Success = false, ErrorMessage = Constants.FailedToDeleteTeacher });
        }

        [Route("getBasicSchoolInfo")]
        [HttpGet]
        public async Task<IActionResult> GetBasicSchoolInfo(Guid schoolId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var school = await _schoolService.GetBasicSchoolInfo(schoolId, userId);
            return Ok(school);
        }

        [Route("schoolFollowers")]
        [HttpGet]
        public async Task<IActionResult> SchoolFollowers(Guid schoolId, int pageNumber, string? searchString)
        {
            return Ok(await _schoolService.GetSchoolFollowers(schoolId, pageNumber, searchString));
        }

        [Route("isSchoolNameExist")]
        [HttpGet]
        public async Task<IActionResult> IsSchoolNameExist(string schoolName)
        {

            var response = await _schoolService.IsSchoolNameExist(schoolName);
            return Ok(new { result = response });
        }

        //[Route("getSchoolByName")]
        //[HttpGet]
        //public async Task<IActionResult> GetSchoolByName(string schoolName)
        //{
        //    var response = await _schoolService.GetSchoolByName(schoolName);
        //    return Ok(response);
        //}

        //[Route("getSchoolClassCourse")]
        //[HttpGet]
        //public async Task<IActionResult> GetSchoolClassCourse(Guid schoolId, int pageNumber)
        //{
        //    var userId = await GetUserIdAsync(this._userManager);
        //    var response = await _schoolService.GetSchoolClassCourse(schoolId, userId, pageNumber);
        //    return Ok(response);
        //}

        [Route("getSchoolClasses")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolClasses(Guid schoolId, int pageNumber)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _schoolService.GetSchoolClasses(schoolId, userId, pageNumber);
            return Ok(response);
        }

        [Route("getSchoolCourses")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolCourses(Guid schoolId, int pageNumber)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _schoolService.GetSchoolCourses(schoolId, userId, pageNumber);
            return Ok(response);
        }

        [Route("pinUnpinClassCourse")]
        [HttpPost]
        public async Task<IActionResult> PinUnpinClassCourse(Guid id, ClassCourseEnum type, bool isPinned)
        {
            var response = await _schoolService.PinUnpinClassCourse(id, type, isPinned);
            return Ok(response);
        }

        [Route("likeUnlikeClassCourse")]
        [HttpPost]
        public async Task<IActionResult> LikeUnlikeClassCourse([FromBody] LikeUnlikeClassCourse model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            model.UserId = userId;
            if (model.Type == ClassCourseEnum.Class)
            {
                var result = await _classService.LikeUnlikeClass(model);
                return Ok(new { Success = true, response = result });
            }
            if (model.Type == ClassCourseEnum.Course)
            {
                var result = await _courseService.LikeUnlikeCourse(model);
                return Ok(new { Success = true, response = result });
            }
            return Ok(new { Success = false, Message = Constants.ClassOrCourseIdInvalid });
        }

        [Route("getUserAllSchools")]
        [HttpGet]
        public async Task<IActionResult> GetUserAllSchools(string userId)
        {
            var response = await _schoolService.GetUserAllSchools(userId);
            return Ok(response);
        }

        [Route("getPostsBySchool")]
        [HttpGet]
        public async Task<IActionResult> GetPostsBySchool(Guid schoolId, int pageNumber, int pageSize = 1)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _schoolService.GetPostsBySchool(schoolId, userId, pageNumber, pageSize);
            return Ok(response);
        }

        [Route("getReelsBySchool")]
        [HttpGet]
        public async Task<IActionResult> GetReelsBySchool(Guid schoolId, int pageNumber, int pageSize = 8)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _schoolService.GetReelsBySchool(schoolId, userId, pageNumber, pageSize);
            return Ok(response);
        }

        [Route("getSchoolsClassCourse")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolsClassCourse(IEnumerable<string> schoolIds)
        {
            schoolIds = JsonConvert.DeserializeObject<string[]>(schoolIds.First());
            var response = await _schoolService.GetSchoolsClassCourse(schoolIds);
            return Ok(response);
        }

        [Route("saveClassCourse")]
        [HttpPost]
        public async Task<IActionResult> SaveClassCourse(string userId, Guid id, ClassCourseEnum type)
        {
            var response = await _schoolService.SaveClassCourse(userId, id, type);
            if (response)
            {
                return Ok(new { Success = true, Message = Constants.ClassCourseSavedSuccessully });
            }
            return Ok(new { Success = true, Message = Constants.ClassCourseUnSavedSuccessully });
        }

        [Route("getSavedClassCourse")]
        [HttpPost]
        public async Task<IActionResult> GetSavedClassCourse(string userId, int pageNumber)
        {
            var response = await _schoolService.GetSavedClassCourse(userId, pageNumber);
            return Ok(response);
        }

        [Route("pinUnpinSavedClassCourse")]
        [HttpPost]
        public async Task<IActionResult> PinUnpinSavedClassCourse(Guid id, bool isPinned, ClassCourseEnum type)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _schoolService.PinUnpinSavedClassCourse(id, isPinned, type, userId);
            if (response)
            {
                return Ok(new { Success = true, Message = Constants.ClassOrCoursePinnedSuccessfully });
            }
            return Ok(new { Success = true, Message = Constants.ClassOrCourseUnPinnedSuccessfully });
        }

        [Route("enableDisableSchool")]
        [HttpPost]
        public async Task<IActionResult> EnableDisableSchool(Guid schoolId)
        {
            await _schoolService.EnableDisableSchool(schoolId);
            return Ok();
        }

        [Route("banFollower")]
        [HttpPost]
        public async Task<IActionResult> BanFollower(string followerId, Guid schoolId)
        {
            var reponse = await _schoolService.BanFollower(followerId, schoolId);
            if (reponse)
            {
                return Ok(new { Success = true, Message = Constants.FollowerBannedSuccessfully });
            }
            return Ok(new { Success = false, Message = Constants.FollowerOrSchoolIdNotValid });
        }

        [Route("unBanFollower")]
        [HttpPost]
        public async Task<IActionResult> UnBanFollower(string followerId, string schoolId)
        {
            var reponse = await _schoolService.UnBanFollower(followerId, schoolId);
            if (reponse)
            {
                return Ok(new { Success = true, Message = Constants.FollowerUnBannedSuccessully });
            }
            return Ok(new { Success = false, Message = Constants.FollowerOrSchoolIdNotValid });
        }

        [Route("schoolsGlobalSearch")]
        [HttpGet]
        public async Task<IActionResult> SchoolsGlobalSearch(string searchString, int pageNumber, int pageSize)
        {
            var user = await _schoolService.SchoolsGlobalSearch(searchString, pageNumber, pageSize);
            return Ok(user);
        }

        [Route("getSliderReelsBySchoolId")]
        [HttpGet]
        public async Task<IActionResult> GetSliderReelsBySchoolId(Guid schoolId, Guid postId, ScrollTypesEnum scrollType)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _schoolService.GetSliderReelsBySchoolId(schoolId, userId, postId, scrollType);
            return Ok(response);
        }

        [Route("getAllSchoolFollowers")]
        [HttpGet]
        public async Task<IActionResult> GetAllSchoolFollowers(Guid schoolId)
        {
            return Ok(await _schoolService.GetAllSchoolFollowers(schoolId));
        }

        [Route("getSchoolClassCourseList")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolClassCourseList(Guid schoolId)
        {
            var response = await _schoolService.GetSchoolClassCourseList(schoolId);
            return Ok(response);
        }

        [Route("getClassListBySchoolId")]
        [HttpGet]
        public async Task<IActionResult> GetClassListBySchoolId(Guid schoolId)
        {
            var response = await _schoolService.GetClassListBySchoolId(schoolId);
            return Ok(response);
        }

        [Route("isAvailableStorageSpace")]
        [HttpGet]
        public async Task<IActionResult> IsAvailableStorageSpace(Guid schoolId, double filesSizeInGigabyte)
        {
            var userId = await GetUserIdAsync(this._userManager);

            var availableSpace = await _schoolService.IsAvailableStorageSpace(schoolId, filesSizeInGigabyte, userId);
            if (availableSpace.AvailableSpace < 0)
            {
                return Ok(new { Success = false, Data = availableSpace, Message = Constants.SchoolHasNotStorageSpace });
            }
            return Ok(new { Success = true, Data = availableSpace, Message = Constants.SchoolHasStorageSpace });
        }

        [Route("getBannedUser")]
        [HttpGet]
        public async Task<IActionResult> GetBannedUser(Guid schoolId, int pageNumber, string searchString)
        {
            //var userId = await GetUserIdAsync(this._userManager);
            var allBannedUsers = await _schoolService.GetBannedUser(schoolId, pageNumber, searchString);
            if (allBannedUsers == null)
            {
                return Ok(new { Success = false, Data = allBannedUsers, Message = Constants.HasAllBannedUser });
            }
            return Ok(new { Success = true, Data = allBannedUsers, Message = Constants.HasAllBannedUser });
        }

        [Route("saveSharedClassCourse")]
        [HttpPost]
        public async Task<IActionResult> SaveSharedClassCourse(string userId, Guid Id, ClassCourseEnum type)
        {
            var response = await _schoolService.SaveSharedClassCourse(userId, Id, type);
            if (response)
            {
                return Ok(new { Success = true, Message = Constants.ClassOrCourseSharedSuccessfully });
            }
            return Ok(new { Success = false, Message = Constants.ClassOrCourseNotSharedSuccessfully });
        }
    }
}
