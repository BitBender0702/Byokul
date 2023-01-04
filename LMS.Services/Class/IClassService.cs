﻿using LMS.Common.ViewModels.Class;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public interface IClassService
    {
        Task<Guid> SaveNewClass(ClassViewModel classViewModel, string createdById);
        Task<ClassUpdateViewModel> GetClassEditDetails(Guid classId);
        Task<Guid> UpdateClass(ClassUpdateViewModel classUpdateViewModel);
        Task DeleteClassById(Guid classId, string deletedById);
        Task<ClassDetailsViewModel> GetClassById(Guid classId);
        Task<IEnumerable<ClassViewModel>> GetAllClasses();
        Task SaveClassLanguages(IEnumerable<string> languageIds, Guid classId);
        Task DeleteClassLanguage(ClassLanguageViewModel model);
        Task SaveClassTeachers(IEnumerable<string> teacherIds, Guid courseId);
        Task DeleteClassTeacher(ClassTeacherViewModel model);
        Task SaveClassCertificates(SaveClassCertificateViewModel model);
        Task DeleteClassCertificate(ClassCertificateViewModel model);
        Task<ClassViewModel> GetBasicClassInfo(Guid classId);
        Task<ClassViewModel> GetClassByName(string className, string schoolName);
        Task<bool> IsClassNameExist(string className);
        Task<bool> ConvertToCourse(Guid classId);
    }
}
