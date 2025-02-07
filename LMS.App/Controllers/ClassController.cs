﻿using LMS.Common.Enums;
using LMS.Common.ViewModels.Chat;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
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
        private IGenericRepository<School> _schoolRepository;

        public ClassController(UserManager<User> userManager, IClassService classService, ICommonService commonService, IGenericRepository<School> schoolRepository)
        {
            _userManager = userManager;
            _classService = classService;
            _commonService = commonService;
            _schoolRepository = schoolRepository;
        }

        [Route("saveNewClass")]
        [HttpPost]
        public async Task<IActionResult> SaveNewClass(ClassViewModel classViewModel)
        {
            //var userId = await GetUserIdAsync(this._userManager);
            var school = _schoolRepository.GetById(classViewModel.SchoolId);
            var classId = await _classService.SaveNewClass(classViewModel, school.CreatedById);
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

        [Route("restoreClassById")]
        [HttpPost]
        public async Task<IActionResult> RestoreClassById(Guid classId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _classService.RestoreClassById(classId, userId);
            return Ok();
        }

        [Route("getClassByName")]
        [HttpGet]
        public async Task<IActionResult> GetClassByName(string className)


        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _classService.GetClassByName(className, userId, false);
            return Ok(response);
        }

        [Route("getClassById")]
        [HttpGet]
        public async Task<IActionResult> GetClassById(Guid classId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _classService.GetClassById(classId, userId);
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
            try
            {
                var res = await _classService.DeleteClassTeacher(model);
                if (res)
                {
                    return Ok(new { Success = true, Message = Constants.TeacherDeletedSuccesfully });
                }
                throw new Exception(Constants.ClassOrTeacherIdNotExist);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, ErrorMessage = ex.Message });
            }
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

        //[Route("getClassByName")]
        //[HttpGet]
        //public async Task<IActionResult> GetClassByName(string className,string schoolName)
        //{
        //    var response = await _classService.GetClassByName(className,schoolName);
        //    return Ok(response);
        //}

        //[Route("convertToCourse")]
        //[HttpPost]
        //public async Task<IActionResult> ConvertToCourse(string className)
        //{
        //    var response = await _classService.ConvertToCourse(className);
        //    return Ok(response);
        //}

        [Route("convertToCourse")]
        [HttpPost]
        public async Task<IActionResult> ConvertToCourse(Guid classId)
        {
            var response = await _classService.ConvertToCourse(classId);
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
        public async Task<IActionResult> GetPostsByClass(Guid classId, int pageNumber, int pageSize = 6)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _classService.GetPostsByClassId(classId, userId, pageNumber, pageSize);
            return Ok(response);
        }

        [Route("getReelsByClass")]
        [HttpGet]
        public async Task<IActionResult> GetReelsByClass(Guid classId, int pageNumber, int pageSize = 8)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _classService.GetReelsByClassId(classId, userId, pageNumber, pageSize);
            return Ok(response);
        }

        [Route("getClassFilters")]
        [HttpGet]
        public async Task<IActionResult> GetClassFilters(string userId, Guid schoolId)
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
            return Ok(new { Success = true, Message = "Class Filter Saved" });
            //return Ok();
        }

        [Route("getClassInfoForCertificate")]
        [HttpGet]
        public async Task<IActionResult> GetClassInfoForCertificate(Guid classId)
        {
            var response = await _classService.GetClassInfoForCertificate(classId);
            return Ok(response);
        }

        [Route("enableDisableClass")]
        [HttpPost]
        public async Task<IActionResult> EnableDisableClass(Guid classId)
        {
            await _classService.EnableDisableClass(classId);
            return Ok();
        }

        [Route("classGlobalSearch")]
        [HttpGet]
        public async Task<IActionResult> ClassGlobalSearch(string searchString, int pageNumber, int pageSize)
        {
            var user = await _classService.ClassGlobalSearch(searchString, pageNumber, pageSize);
            return Ok(user);
        }

        [Route("getSliderReelsByClassId")]
        [HttpGet]
        public async Task<IActionResult> GetSliderReelsByClassId(Guid classId, Guid postId, ScrollTypesEnum scrollType)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _classService.GetSliderReelsByClassId(classId, userId, postId, scrollType);
            return Ok(response);
        }

        [Route("enableDisableComments")]
        [HttpPost]
        public async Task<IActionResult> EnableDisableComments(Guid classId, bool isHideComments)
        {
            await _classService.EnableDisableComments(classId, isHideComments);
            return Ok();
        }

        [Route("classRating")]
        [HttpPost]
        public async Task<IActionResult> ClassRating([FromBody] ClassCourseRatingViewModel classRating)
        {
            var userId = await GetUserIdAsync(this._userManager);
            if (userId == null)
            {
                return Ok(new { Success = false, Message = Constants.UserNotLoggedIn });
            }
            classRating.UserId = userId;
            if ((int)classRating.Rating > 5 || (int)classRating.Rating < 1)
            {
                return Ok(new { Success = false, Message = Constants.RatingMustBeBetween1To5 });
            }
            var classRatings = await _classService.ClassRating(classRating);
            if (classRatings != null)
            {
                return Ok(new { Success = true, Message = Constants.ClassRatedSuccessfully, ClassRating = classRatings });
            }
            else
            {
                return Ok(new { Success = false, Message = Constants.ClassNotRatedSuccessfully, ClassRating = classRatings });
            }

        }

        [Route("banUnbanStudentFromClass")]
        [HttpPost]
        public async Task<IActionResult> BanUnbanStudentFromClass([FromBody] BanUnbanStudentModel banUnbanStudent)
        {
            var user = await GetUserIdAsync(this._userManager);
            if (user == null)
            {
                return Ok(new { Success = false, Message = Constants.UserNotLoggedIn });
            }
            banUnbanStudent.BannerId = Guid.Parse(user);
            var classBan = await GetClassById((Guid)banUnbanStudent.ClassId);
            if (classBan == null)
            {
                return Ok(new { Success = false, Message = "Class doesnot exist" });
            }
            var isStudentBanUnbanned = await _classService.BanUnbanStudentFromClass(banUnbanStudent);
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

        [Route("joinFreeClass")]
        [HttpPost]
        public async Task<IActionResult> JoinFreeClass(Guid classId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _classService.JoinFreeClass(classId, userId);
            if (response)
            {
                return Ok(new { Success = true, Message = Constants.CourseJoinedSuccessfully });
            }
            return Ok(new { Success = false, Message = Constants.ClassIdInvalidOrStudentExist });
        }


        [Route("getClassPopupDetails")]
        [HttpGet]
        public async Task<IActionResult> GetClassPopupDetails(Guid classId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _classService.GetClassPopupDetails(classId, userId);
            return Ok(response);
        }

    }
}
