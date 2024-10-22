﻿using LMS.Common.Enums;
using LMS.Common.ViewModels.Chat;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Student;
using LMS.Data.Entity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public interface ISchoolService
    {
        Task<SchoolViewModel> SaveNewSchool(SchoolViewModel leadViewModel, string createdById);
        Task<SchoolUpdateViewModel> GetSchoolEditDetails(Guid schoolId);
        Task<SchoolUpdateViewModel> UpdateSchool(SchoolUpdateViewModel schoolUpdateViewModel);
        Task<SchoolDetailsViewModel> GetSchoolByName(string schoolName,string loginUserId);
        Task<SchoolDetailsViewModel> GetSchoolById(Guid schoolId, string loginUserId);
        Task<List<SchoolViewModel>> GetAllSchools(string userId);
        Task DeleteSchoolById(Guid schoolId, string deletedById);
        Task RestoreSchoolById(Guid schoolId, string deletedById);
        Task<IEnumerable<SpecializationViewModel>> SpecializationList();
        Task<IEnumerable<LanguageViewModel>> LanguageList();
        //Task<IEnumerable<SchoolFollowerViewModel>> FollowerList(Guid schoolId);
        Task<bool> FollowUnFollowSchool(FollowUnFollowViewModel model, string userId);
        Task SaveSchoolUser(SchoolUserViewModel schoolUserViewModel);
        Task SaveSchoolCertificates(SaveSchoolCertificateViewModel model);
        Task DeleteSchoolCertificate(SchoolCertificateViewModel model);
        Task SaveSchoolDefaultLogo(string logoUrl);
        Task<IEnumerable<SchoolDefaultLogoViewmodel>> GetSchoolDefaultLogos();
        Task SaveSchoolLanguages(IEnumerable<string> languageIds, Guid schoolId);
        Task DeleteSchoolLanguage(SchoolLanguageViewModel model);
        Task SaveSchoolTeachers(SaveSchoolTeacherViewModel model);
        Task<bool> DeleteSchoolTeacher(SchoolTeacherViewModel model);
        Task<SchoolViewModel> GetBasicSchoolInfo(Guid schoolId, string userId);
        Task<List<SchoolFollowerViewModel>> GetSchoolFollowers(Guid schoolId, int pageNumber, string? searchString);
        Task<string> IsSchoolNameExist(string schoolName);
        //Task<SchoolViewModel> GetSchoolByName(string schoolName);
        //Task<IEnumerable<CombineClassCourseViewModel>> GetSchoolClassCourse(Guid? schoolId, string userId, int pageNumber);
        Task<IEnumerable<CombineClassCourseViewModel>> GetSchoolClasses(Guid? schoolId, string userId, int pageNumber);
        Task<IEnumerable<CombineClassCourseViewModel>> GetSchoolCourses(Guid? schoolId, string userId, int pageNumber);
        Task<bool> PinUnpinClassCourse(Guid id, ClassCourseEnum type, bool isPinned);
        Task<List<UserSchoolsViewModel>> GetUserAllSchools(string userId);
        Task<IEnumerable<PostDetailsViewModel>> GetPostsBySchool(Guid schoolId, string loginUserId, int pageNumber, int pageSize);
        Task<IEnumerable<PostDetailsViewModel>> GetReelsBySchool(Guid schoolId, string loginUserId, int pageNumber, int pageSize);
        Task<SchoolsClassCourseViewModel> GetSchoolsClassCourse(IEnumerable<string> schoolIds);
        Task<bool> SaveClassCourse(string userId, Guid id, ClassCourseEnum type);
        Task<IEnumerable<CombineClassCourseViewModel>> GetSavedClassCourse(string userId, int pageNumber);
        Task<bool> PinUnpinSavedClassCourse(Guid id, bool isPinned,ClassCourseEnum type, string userId);
        Task<IEnumerable<StudentViewModel>> GetClassStudentsBySchoolId(Guid schoolId);
        Task<IEnumerable<StudentViewModel>> GetCourseStudentsBySchoolId(Guid schoolId);
        Task EnableDisableSchool(Guid schoolId);
        Task<bool> BanFollower(string followerId,Guid schoolId);
        Task<bool> UnBanFollower(string followerId, string schoolId);
        Task<IEnumerable<GlobalSearchViewModel>> SchoolsGlobalSearch(string searchString, int pageNumber, int pageSize);
        Task<IEnumerable<PostDetailsViewModel>> GetSliderReelsBySchoolId(Guid schoolId, string loginUserId, Guid lastReelId, ScrollTypesEnum scrollType);
        Task<List<AllSchoolFollowersViewModel>> GetAllSchoolFollowers(Guid schoolId);
        Task<SchoolsClassCourseViewModel> GetSchoolClassCourseList(Guid schoolId);
        Task<List<ClassesBySchoolViewModel>> GetClassListBySchoolId(Guid schoolId);
        Task<StorageSpace> IsAvailableStorageSpace(Guid schoolId, double filesSizeInGigabyte, string userId);

        //Task<List<SchoolFollower>> GetBannedUser(Guid schoolId, string userId);

        Task<List<SchoolFollowerViewModel>> GetBannedUser(Guid schoolId, int pageNumber, string? searchString);
        Task<bool> SaveSharedClassCourse(string userId, Guid Id, ClassCourseEnum type);


    }
}
