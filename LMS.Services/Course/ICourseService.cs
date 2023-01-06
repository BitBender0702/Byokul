﻿using LMS.Common.ViewModels.Course;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public interface ICourseService
    {
        Task<Guid> SaveNewCourse(CourseViewModel courseViewModel, string createdById);
        Task<Guid> UpdateCourse(CourseViewModel courseViewModel);
        Task DeleteCourseById(Guid classId, string deletedById);
        Task<CourseDetailsViewModel> GetCourseById(Guid courseId);
        Task<IEnumerable<CourseViewModel>> GetAllCourses();
        Task<CourseViewModel> GetBasicCourseInfo(Guid courseId);
        Task SaveCourseLanguages(IEnumerable<string> languageIds, Guid courseId);
        Task DeleteCourseLanguage(CourseLanguageViewModel model);
        Task SaveCourseTeachers(IEnumerable<string> teacherIds, Guid courseId);
        Task DeleteCourseTeacher(CourseTeacherViewModel model);
        Task SaveCourseCertificates(SaveCourseCertificateViewModel model);
        Task DeleteCourseCertificate(CourseCertificateViewModel model);
        Task<bool> ConvertToClass(Guid courseId);
        Task<CourseViewModel> GetCourseByName(string courseName, string schoolName);
        Task<bool> IsCourseNameExist(string className);

    }
}
