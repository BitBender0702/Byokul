using AutoMapper;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
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
    public class CourseService : ICourseService
    {
        private readonly IMapper _mapper;
        private IGenericRepository<Course> _courseRepository;
        private IGenericRepository<CourseLanguage> _courseLanguageRepository;
        private IGenericRepository<CourseDiscipline> _courseDisciplineRepository;
        private IGenericRepository<CourseStudent> _courseStudentRepository;
        private IGenericRepository<CourseTeacher> _courseTeacherRepository;
        private IGenericRepository<Post> _postRepository;
        private readonly UserManager<User> _userManager;


        public CourseService(IMapper mapper, IGenericRepository<Course> courseRepository, IGenericRepository<CourseLanguage> courseLanguageRepository, IGenericRepository<CourseDiscipline> courseDisciplineRepository, IGenericRepository<CourseStudent> courseStudentRepository, IGenericRepository<CourseTeacher> courseTeacherRepository, IGenericRepository<Post> postRepository,UserManager<User> userManager)
        {
            _mapper = mapper;
            _courseRepository = courseRepository;
            _courseLanguageRepository = courseLanguageRepository;
            _courseDisciplineRepository = courseDisciplineRepository;
            _courseStudentRepository = courseStudentRepository;
            _courseTeacherRepository = courseTeacherRepository;
            _postRepository = postRepository;
            _userManager = userManager;
        }

        public async Task SaveNewCourse(CourseViewModel courseViewModel, string createdById)
        {
            var course = new Course
            {
                CourseName = courseViewModel.CourseName,
                SchoolId = courseViewModel.SchoolId,
                ServiceTypeId = courseViewModel.ServiceTypeId,
                AccessibilityId = courseViewModel.AccessibilityId,
                Description = courseViewModel.Description,
                Price = courseViewModel.Price,

                CreatedById = createdById,
                CreatedOn = DateTime.UtcNow
            };

            _courseRepository.Insert(course);
            _courseRepository.Save();
            courseViewModel.CourseId = course.CourseId;

            if (courseViewModel.LanguageIds != null)
            {
                await SaveCourseLanguages(courseViewModel.LanguageIds, course.CourseId);
            }

            if (courseViewModel.DisciplineIds != null)
            {
                await SaveCourseDisciplines(courseViewModel.DisciplineIds, course.CourseId);
            }

            if (courseViewModel.StudentIds != null)
            {
                await SaveCourseStudents(courseViewModel.StudentIds, course.CourseId);
            }

            if (courseViewModel.TeacherIds != null)
            {
                await SaveCourseTeachers(courseViewModel.TeacherIds, course.CourseId);
            }

        }

        async Task SaveCourseLanguages(IEnumerable<string> languageIds, Guid courseId)
        {
            foreach (var languageId in languageIds)
            {
                var courseLanguage = new CourseLanguage
                {
                    CourseId = courseId,
                    LanguageId = new Guid(languageId)
                };

                _courseLanguageRepository.Insert(courseLanguage);
                _courseLanguageRepository.Save();
            }
        }

        async Task SaveCourseDisciplines(IEnumerable<string> disciplineIds, Guid courseId)
        {
            foreach (var disciplineId in disciplineIds)
            {
                var courseDiscipline = new CourseDiscipline
                {
                    CourseId = courseId,
                    DisciplineId = new Guid(disciplineId)
                };

                _courseDisciplineRepository.Insert(courseDiscipline);
                _courseDisciplineRepository.Save();

            }
        }

        async Task SaveCourseStudents(IEnumerable<string> studentIds, Guid courseId)
        {
            foreach (var studentId in studentIds)
            {
                var courseStudent = new CourseStudent
                {
                    CourseId = courseId,
                    StudentId = new Guid(studentId)
                };

                _courseStudentRepository.Insert(courseStudent);
                _courseStudentRepository.Save();
            }
        }

        async Task SaveCourseTeachers(IEnumerable<string> teacherIds, Guid courseId)
        {
            foreach (var teacherId in teacherIds)
            {
                var courseTeacher = new CourseTeacher
                {
                    CourseId = courseId,
                    TeacherId = new Guid(teacherId)
                };
                _courseTeacherRepository.Insert(courseTeacher);
                _courseTeacherRepository.Save();
            }
        }

        public async Task UpdateCourse(CourseViewModel courseViewModel)
        {
            Course course = _courseRepository.GetById(courseViewModel.CourseId);
            course.CourseName = courseViewModel.CourseName;
            course.SchoolId = courseViewModel.SchoolId;
            course.ServiceTypeId = courseViewModel.ServiceTypeId;
            course.AccessibilityId = courseViewModel.AccessibilityId;
            course.Description = courseViewModel.Description;
            course.Price = courseViewModel.Price;

            _courseRepository.Update(course);
            _courseRepository.Save();

            if (courseViewModel.LanguageIds != null) {
                await UpdateCourseLanguages(courseViewModel.LanguageIds, courseViewModel.CourseId);
            }

            if (courseViewModel.DisciplineIds != null)
            {
                await UpdateCourseDisciplines(courseViewModel.DisciplineIds, courseViewModel.CourseId);
            }

            if (courseViewModel.StudentIds != null)
            {
                await UpdateCourseStudents(courseViewModel.StudentIds, courseViewModel.CourseId);
            }

            if (courseViewModel.TeacherIds != null)
            {
                await UpdateCourseTeachers(courseViewModel.TeacherIds, courseViewModel.CourseId);
            }

        }

        async Task UpdateCourseLanguages(IEnumerable<string> languageIds, Guid courseId)
        {
            var courseLanguages = _courseLanguageRepository.GetAll().Where(x => x.CourseId == courseId).ToList();

            if (courseLanguages.Any())
            {
                _courseLanguageRepository.DeleteAll(courseLanguages);
            }
            await SaveCourseLanguages(languageIds, courseId);
        }

        async Task UpdateCourseDisciplines(IEnumerable<string> disciplineIds, Guid courseId)
        {
            var courseDisciplines = _courseDisciplineRepository.GetAll().Where(x => x.CourseId == courseId).ToList();

            if (courseDisciplines.Any())
            {
                _courseDisciplineRepository.DeleteAll(courseDisciplines);
            }
            await SaveCourseDisciplines(disciplineIds, courseId);
        }

        async Task UpdateCourseStudents(IEnumerable<string> studentIds, Guid courseId)
        {
            var courseStudents = _courseStudentRepository.GetAll().Where(x => x.CourseId == courseId).ToList();

            if (courseStudents.Any())
            {
                _courseStudentRepository.DeleteAll(courseStudents);
            }
            await SaveCourseStudents(studentIds, courseId);
        }

        async Task UpdateCourseTeachers(IEnumerable<string> teacherIds, Guid courseId)
        {
            var courseTeachers = _courseTeacherRepository.GetAll().Where(x => x.CourseId == courseId).ToList();

            if (courseTeachers.Any())
            {
                _courseTeacherRepository.DeleteAll(courseTeachers);
            }
            await SaveCourseTeachers(teacherIds, courseId);
        }

        public async Task<CourseDetailsViewModel> GetCourseById(Guid courseId)
        {
            CourseDetailsViewModel model = new CourseDetailsViewModel();

            if (courseId != null)
            {
                var course = await _courseRepository.GetAll()
                    .Include(x => x.ServiceType)
                    .Include(x => x.School)
                    .ThenInclude(x => x.Country)
                    .Include(x => x.School)
                    .ThenInclude(x => x.Specialization)
                    .Include(x => x.Accessibility)
                    .Include(x => x.CreatedBy)
                    .Where(x => x.CourseId == courseId).FirstOrDefaultAsync();
                try
                {
                    model = _mapper.Map<CourseDetailsViewModel>(course);
                }
                catch (Exception ex)
                {
                    throw ex;
                }

                model.Languages = await GetLanguages(course.CourseId);
                model.Disciplines = await GetDisciplines(course.CourseId);
                model.Students = await GetStudents(course.CourseId);
                model.Teachers = await GetTeachers(course.CourseId);
                model.Posts = await GetPostsByCourseId(course.CourseId);

                return model;
            }
            return null;
        }

        async Task<IEnumerable<LanguageViewModel>> GetLanguages(Guid courseId)
        {
            var courseLanguages = _courseLanguageRepository.GetAll()
                .Include(x => x.Language)
                .Where(x => x.CourseId == courseId).ToList();

            var languageViewModel = new List<LanguageViewModel>();
            foreach (var res in courseLanguages)
            {
                languageViewModel.Add(_mapper.Map<LanguageViewModel>(res.Language));
            }
            return languageViewModel;
        }

        async Task<IEnumerable<DisciplineViewModel>> GetDisciplines(Guid courseId)
        {
            var courseDisciplines = _courseDisciplineRepository.GetAll()
                .Include(x => x.Discipline)
                .Where(x => x.CourseId == courseId).ToList();

            var discipleneViewModel = new List<DisciplineViewModel>();
            foreach (var res in courseDisciplines)
            {
                discipleneViewModel.Add(_mapper.Map<DisciplineViewModel>(res.Discipline));
            }
            return discipleneViewModel;
        }

        async Task<IEnumerable<StudentViewModel>> GetStudents(Guid courseId)
        {
            var courseStudents = _courseStudentRepository.GetAll()
                .Include(x => x.Student)
                .ThenInclude(x => x.CreatedBy)
                .Where(x => x.CourseId == courseId).ToList();

            var studentViewModel = new List<StudentViewModel>();
            foreach (var res in courseStudents)
            {
                studentViewModel.Add(_mapper.Map<StudentViewModel>(res.Student));
            }
            return studentViewModel;
        }

        async Task<IEnumerable<TeacherViewModel>> GetTeachers(Guid courseId)
        {
            var courseTeachers = _courseTeacherRepository.GetAll()
                .Include(x => x.Teacher)
                .Where(x => x.CourseId == courseId).ToList();

            var teacherViewModel = new List<TeacherViewModel>();
            foreach (var res in courseTeachers)
            {
                teacherViewModel.Add(_mapper.Map<TeacherViewModel>(res.Teacher));
            }
            return teacherViewModel;
        }

        public async Task DeleteCourseById(Guid courseId, string deletedByid)
        {
            Course course = _courseRepository.GetById(courseId);
            course.IsDeleted = true;
            course.DeletedById = deletedByid;
            course.DeletedOn = DateTime.UtcNow;
            _courseRepository.Update(course);
            _courseRepository.Save();
        }

        public async Task<IEnumerable<CourseViewModel>> GetAllCourses()
        {
            IEnumerable<CourseViewModel> model = _courseRepository.GetAll().Where(x => !x.IsDeleted).Select(x => new CourseViewModel
            {
                CourseId = x.CourseId,
                CourseName = x.CourseName,
            });

            return model;
        }

        public async Task<IEnumerable<PostDetailsViewModel>> GetPostsByCourseId(Guid courseId)
        {
            var courseList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == courseId).ToListAsync();
            var result = _mapper.Map<List<PostDetailsViewModel>>(courseList);

            foreach (var post in result)
            {
                var author = await _courseRepository.GetAll().Include(x => x.School).Where(x => x.CourseId == post.ParentId).FirstOrDefaultAsync();

                post.Owner = _mapper.Map<OwnerViewModel>(author.School);
            }

            foreach (var post in result)
            {
                var author = await _userManager.Users.Where(x => x.Id == post.CreatedBy).FirstOrDefaultAsync();

                post.Author = _mapper.Map<AuthorViewModel>(author);
            }

            return result;
        }
    }
}
