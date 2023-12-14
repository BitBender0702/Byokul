using LMS.Common.Enums;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
using LMS.Services;
using LMS.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Authorize]
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
        public async Task<IActionResult> UpdateCourse(CourseViewModel courseViewModel)
        {
            var response = await _courseService.UpdateCourse(courseViewModel);
            return Ok(response);
        }

        [Route("deleteCourseById")]
        [HttpPost]
        public async Task<IActionResult> DeleteCourseById(Guid courseId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _courseService.DeleteCourseById(courseId, userId);
            return Ok();
        }

        [Route("restoreCourseById")]
        [HttpPost]
        public async Task<IActionResult> RestoreCourseById(Guid courseId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _courseService.RestoreCourseById(courseId, userId);
            return Ok();
        }

        [Route("getCourseByName")]
        [HttpGet]
        public async Task<IActionResult> GetCourseByName(string courseName)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _courseService.GetCourseByName(courseName, userId);
            return Ok(response);
        }

        [Route("getCourseById")]
        [HttpGet]
        public async Task<IActionResult> GetCourseById(Guid courseId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _courseService.GetCourseById(courseId, userId);
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
            await _courseService.SaveCourseTeachers(model.TeacherIds, new Guid(model.CourseId));
            return Ok();
        }

        [Route("deleteCourseTeacher")]
        [HttpPost]
        public async Task<IActionResult> DeleteCourseTeacher([FromBody] CourseTeacherViewModel model)
        {
            try
            {
                var res = await _courseService.DeleteCourseTeacher(model);
                if (res)
                {
                    return Ok(new { Success = true, Message = Constants.TeacherDeletedSuccesfully });
                }
                throw new Exception(Constants.CourseOrTeacherIdNotExist);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, ErrorMessage = ex.Message });
            }
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
            var response = await _courseService.ConvertToClass(courseId);
            return Ok(response);
        }

        //[Route("getCourseByName")]
        //[HttpGet]
        //public async Task<IActionResult> GetCourseByName(string courseName, string schoolName)
        //{
        //    var response = await _courseService.GetCourseByName(courseName, schoolName);
        //    return Ok(response);
        //}

        [Route("isCourseNameExist")]
        [HttpGet]
        public async Task<IActionResult> IsCourseNameExist(string courseName)
        {
            return Ok(await _courseService.IsCourseNameExist(courseName));
        }

        [Route("courseView")]
        [HttpPost]
        public async Task<IActionResult> CourseView([FromBody] CourseViewsViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            model.UserId = userId;
            var response = await _courseService.CourseView(model);
            return Ok(response);
        }

        [Route("getPostsByCourse")]
        [HttpGet]
        public async Task<IActionResult> GetPostsByCourse(Guid courseId, int pageNumber, int pageSize = 6)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _courseService.GetPostsByCourseId(courseId, userId, pageNumber, pageSize);
            return Ok(response);
        }

        [Route("getReelsByCourse")]
        [HttpGet]
        public async Task<IActionResult> getReelsByCourse(Guid courseId, int pageNumber, int pageSize = 8)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _courseService.GetReelsByCourseId(courseId, userId, pageNumber, pageSize);
            return Ok(response);
        }

        [Route("getCourseFilters")]
        [HttpGet]
        public async Task<IActionResult> GetCourseFilters(string userId, Guid schoolId)
        {
            var response = await _courseService.GetCourseFilters(userId, schoolId);
            return Ok(response);
        }

        [Route("saveCourseFilters")]
        [HttpPost]
        public async Task<IActionResult> SaveCourseFilters([FromBody] List<UserClassCourseFilterViewModel> model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _courseService.SaveCourseFilters(model, userId);
            return Ok(new { Success = true, Message = "Course Filter Saved" });
        }

        [Route("getCourseInfoForCertificate")]
        [HttpGet]
        public async Task<IActionResult> GetCourseInfoForCertificate(Guid courseId)
        {
            var response = await _courseService.GetCourseInfoForCertificate(courseId);
            return Ok(response);
        }

        [Route("enableDisableCourse")]
        [HttpPost]
        public async Task<IActionResult> EnableDisableCourse(Guid courseId)
        {
            await _courseService.EnableDisableCourse(courseId);
            return Ok();
        }

        [Route("getSliderReelsByCourseId")]
        [HttpGet]
        public async Task<IActionResult> GetSliderReelsByCourseId(Guid courseId, Guid postId, ScrollTypesEnum scrollType)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _courseService.GetSliderReelsByCourseId(courseId, userId, postId, scrollType);
            return Ok(response);
        }

        [Route("enableDisableComments")]
        [HttpPost]
        public async Task<IActionResult> EnableDisableComments(Guid courseId, bool isHideComments)
        {
            await _courseService.EnableDisableComments(courseId, isHideComments);
            return Ok();
        }

        [Route("courseRating")]
        [HttpPost]
        public async Task<IActionResult> CourseRating([FromBody] ClassCourseRatingViewModel courseRating)
        {
            var userId = await GetUserIdAsync(this._userManager);
            if (userId == null)
            {
                return Ok(new { Success = false, Message = Constants.UserNotLoggedIn });
            }
            courseRating.UserId = userId;
            if ((int)courseRating.Rating > 5 || (int)courseRating.Rating < 1)
            {
                return Ok(new { Success = false, Message = Constants.RatingMustBeBetween1To5 });
            }
            var courseRatings = await _courseService.CourseRating(courseRating);
            if (courseRatings != null)
            {
                return Ok(new { Success = true, Message = Constants.CourseRatedSuccessfully, CourseRating = courseRatings });
            }
            else
            {
                return Ok(new { Success = false, Message = Constants.CourseNotRatedSuccessfully, CourseRating = courseRatings });
            }

        }
        [Route("banUnbanStudentFromCourse")]
        [HttpPost]
        public async Task<IActionResult> BanUnbanStudentFromClass([FromBody] BanUnbanStudentModel banUnbanStudent)
        {
            var user = await GetUserIdAsync(this._userManager);
            if (user == null)
            {
                return Ok(new { Success = false, Message = Constants.UserNotLoggedIn });
            }
            banUnbanStudent.BannerId = Guid.Parse(user);

            var courseBan = await GetCourseById((Guid)banUnbanStudent.CourseId);
            if (courseBan == null)
            {
                return Ok(new { Success = false, Message = "Course doesnot exist" });
            }
            var isStudentBanUnbanned = await _courseService.BanUnbanStudentFromCourse(banUnbanStudent);
            if (isStudentBanUnbanned == true)
            {
                return Ok(new { Success = true, Message = Constants.StudentIsBanned });
            }
            else if (isStudentBanUnbanned == false)
            {
                return Ok(new { Success = true, Message = Constants.StudentIsUnBanned });
            }
            else if (isStudentBanUnbanned == null)
            {
                return Ok(new { Success = false, Message = Constants.NoPermissionForBan });
            }
            return Ok();
        }

        [Route("coursesGlobalSearch")]
        [HttpGet]
        public async Task<IActionResult> CoursesGlobalSearch(string searchString, int pageNumber, int pageSize)
        {
            var user = await _courseService.CoursesGlobalSearch(searchString, pageNumber, pageSize);
            return Ok(user);
        }

        [Route("joinFreeCourse")]
        [HttpPost]
        public async Task<IActionResult> JoinFreeCourse(Guid courseId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _courseService.JoinFreeCourse(courseId, userId);
            if (response)
            {
                return Ok(new { Success = true, Message = Constants.ClassJoinedSuccessfully });
            }
            return Ok(new { Success = false, Message = Constants.CourseIdInvalidOrStudentExist });
        }

        [Route("getCoursePopupDetails")]
        [HttpGet]
        public async Task<IActionResult> GetCoursePopupDetails(Guid courseId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _courseService.GetCoursePopupDetails(courseId, userId);
            return Ok(response);
        }

    }
}
