using AutoMapper;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Student;
using LMS.Common.ViewModels.Teacher;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public class ClassService : IClassService
    {
        private readonly IMapper _mapper;
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<ClassLanguage> _classLanguageRepository;
        private IGenericRepository<ClassTeacher> _classTeacherRepository;
        private IGenericRepository<ClassStudent> _classStudentRepository;
        private IGenericRepository<ClassDiscipline> _classDisciplineRepository;

        public ClassService(IMapper mapper, IGenericRepository<Class> classRepository, IGenericRepository<ClassLanguage> classLanguageRepository, IGenericRepository<ClassTeacher> classTeacherRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<ClassDiscipline> classDisciplineRepository)
        {
            _mapper = mapper;
            _classRepository = classRepository;
            _classLanguageRepository = classLanguageRepository;
            _classTeacherRepository = classTeacherRepository;
            _classStudentRepository = classStudentRepository;
            _classDisciplineRepository = classDisciplineRepository;
        }
        public async Task SaveNewClass(ClassViewModel classViewModel, string createdById)
        {
            var classes = new Class
            {
                ClassName = classViewModel.ClassName,
                NoOfStudents = classViewModel.NoOfStudents,
                StartDate = classViewModel.StartDate,
                EndDate = classViewModel.EndDate,
                SchoolId = classViewModel.SchoolId,
                ServiceTypeId = classViewModel.ServiceTypeId,
                Description = classViewModel.Description,
                Price = classViewModel.Price,
                AccessibilityId = classViewModel.AccessibilityId,
                CreatedById = createdById,
                CreatedOn = DateTime.UtcNow
            };

            _classRepository.Insert(classes);
            _classRepository.Save();
            classViewModel.ClassId = classes.ClassId;

            if (classViewModel.LanguageIds != null)
            {
                await SaveClassLanguages(classViewModel.LanguageIds, classes.ClassId);
            }

            if (classViewModel.DisciplineIds != null)
            {
                await SaveClassDisciplines(classViewModel.DisciplineIds, classes.ClassId);
            }

            if (classViewModel.StudentIds != null)
            {
                await SaveClassStudents(classViewModel.StudentIds, classes.ClassId);
            }

            if (classViewModel.TeacherIds != null)
            {
                await SaveClassTeachers(classViewModel.TeacherIds, classes.ClassId);
            }

        }

        async Task SaveClassLanguages(IEnumerable<string> languageIds, Guid classId)
        {
            foreach (var languageId in languageIds)
            {
                var classLanguage = new ClassLanguage
                {
                    ClassId = classId,
                    LanguageId = new Guid(languageId)
                };

                _classLanguageRepository.Insert(classLanguage);
                _classLanguageRepository.Save();
            }
        }

        async Task SaveClassDisciplines(IEnumerable<string> disciplineIds, Guid classId)
        {
            foreach (var disciplineId in disciplineIds)
            {
                var classDiscipline = new ClassDiscipline
                {
                    ClassId = classId,
                    DisciplineId = new Guid(disciplineId)
                };

                _classDisciplineRepository.Insert(classDiscipline);
                _classDisciplineRepository.Save();
            }
        }

        async Task SaveClassStudents(IEnumerable<string> studentIds, Guid classId)
        {
            foreach (var studentId in studentIds)
            {
                var classStudent = new ClassStudent
                {
                    ClassId = classId,
                    StudentId = new Guid(studentId)
                };

                _classStudentRepository.Insert(classStudent);
                _classStudentRepository.Save();
            }
        }

        async Task SaveClassTeachers(IEnumerable<string> teacherIds, Guid classId)
        {
            foreach (var teacherId in teacherIds)
            {
                var classTeacher = new ClassTeacher
                {
                    ClassId = classId,
                    TeacherId = new Guid(teacherId)
                };

                _classTeacherRepository.Insert(classTeacher);
                _classTeacherRepository.Save();
            }
        }

        public async Task UpdateClass(ClassViewModel classViewModel)
        {
            Class classes = _classRepository.GetById(classViewModel.ClassId);
            classes.ClassName = classViewModel.ClassName;
            classes.SchoolId = classViewModel.SchoolId;
            classes.NoOfStudents = classViewModel.NoOfStudents;
            classes.StartDate = classViewModel.StartDate;
            classes.EndDate = classViewModel.EndDate;
            classes.ServiceTypeId = classViewModel.ServiceTypeId;
            classes.AccessibilityId = classViewModel.AccessibilityId;
            classes.Description = classViewModel.Description;
            classes.Price = classViewModel.Price;

            _classRepository.Update(classes);
            _classRepository.Save();

            if (classViewModel.LanguageIds != null)
            {
                await UpdateClassLanguages(classViewModel.LanguageIds, classViewModel.ClassId);
            }

            if (classViewModel.DisciplineIds != null)
            {
                await UpdateClassDisciplines(classViewModel.DisciplineIds, classViewModel.ClassId);
            }

            if (classViewModel.StudentIds != null)
            {
                await UpdateClassStudents(classViewModel.StudentIds, classViewModel.ClassId);
            }

            if (classViewModel.TeacherIds != null)
            {
                await UpdateClassTeachers(classViewModel.TeacherIds, classViewModel.ClassId);
            }
        }

        async Task UpdateClassLanguages(IEnumerable<string> languageIds, Guid classId)
        {
            var classLanguages = _classLanguageRepository.GetAll().Where(x => x.ClassId == classId).ToList();

            if (classLanguages.Any())
            {
                _classLanguageRepository.DeleteAll(classLanguages);
            }
            await SaveClassLanguages(languageIds, classId);
        }

        async Task UpdateClassDisciplines(IEnumerable<string> disciplineIds, Guid classId)
        {
            var classDisciplines = _classDisciplineRepository.GetAll().Where(x => x.ClassId == classId).ToList();

            if (classDisciplines.Any())
            {
                _classDisciplineRepository.DeleteAll(classDisciplines);
            }
            await SaveClassDisciplines(disciplineIds, classId);
        }

        async Task UpdateClassStudents(IEnumerable<string> studentIds, Guid classId)
        {
            var classStudents = _classStudentRepository.GetAll().Where(x => x.ClassId == classId).ToList();

            if (classStudents.Any())
            {
                _classStudentRepository.DeleteAll(classStudents);
            }
            await SaveClassStudents(studentIds, classId);
        }

        async Task UpdateClassTeachers(IEnumerable<string> teacherIds, Guid classId)
        {
            var classTeachers = _classTeacherRepository.GetAll().Where(x => x.ClassId == classId).ToList();

            if (classTeachers.Any())
            {
                _classTeacherRepository.DeleteAll(classTeachers);
            }
            await SaveClassTeachers(teacherIds, classId);
        }

        public async Task<ClassDetailsViewModel> GetClassById(Guid classId)
        {
            ClassDetailsViewModel model = new ClassDetailsViewModel();
            if (classId != null)
            {
                var classes = await _classRepository.GetAll()
                    .Include(x => x.ServiceType)
                    .Include(x => x.School)
                    .ThenInclude(x => x.Country)
                    .Include(x => x.School)
                    .ThenInclude(x => x.Specialization)
                    .Include(x => x.Accessibility)
                    .Include(x => x.CreatedBy)
                    .Where(x => x.ClassId == classId).FirstOrDefaultAsync();

                try
                {
                    model = _mapper.Map<ClassDetailsViewModel>(classes);
                }
                catch (Exception ex)
                {
                    throw ex;
                }

                model.Languages = await GetLanguages(classes.ClassId);
                model.Disciplines = await GetDisciplines(classes.ClassId);
                model.Students = await GetStudents(classes.ClassId);
                model.Teachers = await GetTeachers(classes.ClassId);

                return model;
            }
            return null;
        }

        async Task<IEnumerable<LanguageViewModel>> GetLanguages(Guid classId)
        {
            var classLanguages = _classLanguageRepository.GetAll()
                .Include(x => x.Language)
                .Where(x => x.ClassId == classId).ToList();

            var languageViewModel = new List<LanguageViewModel>();
            foreach (var res in classLanguages)
            {
                languageViewModel.Add(_mapper.Map<LanguageViewModel>(res.Language));
            }
            return languageViewModel;
        }

        async Task<IEnumerable<DisciplineViewModel>> GetDisciplines(Guid classId)
        {
            var classDisciplines = _classDisciplineRepository.GetAll()
                .Include(x => x.Discipline)
                .Where(x => x.ClassId == classId).ToList();
            var discipleneViewModel = new List<DisciplineViewModel>();
            foreach (var res in classDisciplines)
            {
                discipleneViewModel.Add(_mapper.Map<DisciplineViewModel>(res.Discipline));
            }
            //var response = _mapper.Map<IEnumerable<SchoolCertificateViewModel>>(classLanguages);
            //return response;
            return discipleneViewModel;
        }

        async Task<IEnumerable<StudentViewModel>> GetStudents(Guid classId)
        {
            var classStudents = _classStudentRepository.GetAll()
                .Include(x => x.Student)
                .ThenInclude(x => x.CreatedBy)
                .Where(x => x.ClassId == classId).ToList();
            var studentViewModel = new List<StudentViewModel>();
            foreach (var res in classStudents)
            {
                studentViewModel.Add(_mapper.Map<StudentViewModel>(res.Student));
            }
            return studentViewModel;
        }

        async Task<IEnumerable<TeacherViewModel>> GetTeachers(Guid classId)
        {
            var classTeachers = _classTeacherRepository.GetAll()
                .Include(x => x.Teacher)
                .Where(x => x.ClassId == classId).ToList();
            var teacherViewModel = new List<TeacherViewModel>();
            foreach (var res in classTeachers)
            {
                teacherViewModel.Add(_mapper.Map<TeacherViewModel>(res.Teacher));
            }
            return teacherViewModel;
        }

        public async Task DeleteClassById(Guid classId, string deletedByid)
        {
            Class classes = _classRepository.GetById(classId);
            classes.IsDeleted = true;
            classes.DeletedById = deletedByid;
            classes.DeletedOn = DateTime.UtcNow;
            _classRepository.Update(classes);
            _classRepository.Save();
        }

        public async Task<IEnumerable<ClassViewModel>> GetAllClasses()
        {
            IEnumerable<ClassViewModel> model = _classRepository.GetAll().Where(x => !x.IsDeleted).Select(x => new ClassViewModel
            {
                ClassId = x.ClassId,
                ClassName = x.ClassName
            });

            return model;
        }
    }
}
