using AutoMapper;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.Student;
using LMS.Common.ViewModels.Teacher;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.AspNetCore.Identity;
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
        private IGenericRepository<Post> _postRepository;
        private IGenericRepository<PostAttachment> _postAttachmentRepository;
        private readonly UserManager<User> _userManager;

        public ClassService(IMapper mapper, IGenericRepository<Class> classRepository, IGenericRepository<ClassLanguage> classLanguageRepository, IGenericRepository<ClassTeacher> classTeacherRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<ClassDiscipline> classDisciplineRepository, IGenericRepository<Post> postRepository, IGenericRepository<PostAttachment> postAttachmentRepository, UserManager<User> userManager)
        {
            _mapper = mapper;
            _classRepository = classRepository;
            _classLanguageRepository = classLanguageRepository;
            _classTeacherRepository = classTeacherRepository;
            _classStudentRepository = classStudentRepository;
            _classDisciplineRepository = classDisciplineRepository;
            _postRepository = postRepository;
            _postAttachmentRepository = postAttachmentRepository;
            _userManager = userManager;
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

        public async Task UpdateClass(ClassUpdateViewModel classUpdateViewModel)
        {
            Class classes = _classRepository.GetById(classUpdateViewModel.ClassId);
            classes.Avatar = classUpdateViewModel.Avatar;
            classes.ClassName = classUpdateViewModel.ClassName;
            classes.SchoolId = classUpdateViewModel.SchoolId;
            classes.NoOfStudents = classUpdateViewModel.NoOfStudents;
            classes.StartDate = classUpdateViewModel.StartDate;
            classes.EndDate = classUpdateViewModel.EndDate;
            classes.ServiceTypeId = classUpdateViewModel.ServiceTypeId;
            classes.AccessibilityId = classUpdateViewModel.AccessibilityId;
            classes.Price = classUpdateViewModel.Price;
            classes.Description = classUpdateViewModel.Description;

            _classRepository.Update(classes);
            _classRepository.Save();

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
                model.Posts = await GetPostsByClassId(classes.ClassId);

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
            return discipleneViewModel;
        }

        async Task<int> GetStudents(Guid classId)
        {
            var classStudents = _classStudentRepository.GetAll()
                .Include(x => x.Student)
                .ThenInclude(x => x.CreatedBy)
                .Where(x => x.ClassId == classId).ToList();
            return classStudents.Count();
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

        public async Task<IEnumerable<PostDetailsViewModel>> GetPostsByClassId(Guid classId)
        {
            var courseList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == classId).ToListAsync();
            var result = _mapper.Map<List<PostDetailsViewModel>>(courseList);

            foreach (var post in result)
            {
                var attachment = await GetAttachmentsByPostId(post.Id);
                post.PostAttachments = attachment;
            }


            foreach (var post in result)
            {
                var author = await _classRepository.GetAll().Include(x => x.School).Where(x => x.ClassId == post.ParentId).FirstOrDefaultAsync();
                post.Owner = _mapper.Map<OwnerViewModel>(author.School);
            }

            foreach (var post in result)
            {
                var author = await _userManager.Users.Where(x => x.Id == post.CreatedBy).FirstOrDefaultAsync();
                post.Author = _mapper.Map<AuthorViewModel>(author);
            }

            return result;
        }

        public async Task<IEnumerable<PostAttachmentViewModel>> GetAttachmentsByPostId(Guid postId)
        {
            var attacchmentList = await _postAttachmentRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.PostId == postId).ToListAsync();

            var result = _mapper.Map<List<PostAttachmentViewModel>>(attacchmentList);
            return result;
        }
    }
}
