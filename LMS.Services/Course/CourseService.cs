﻿using AutoMapper;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Student;
using LMS.Common.ViewModels.Teacher;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using LMS.Services.Blob;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
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
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<PostAttachment> _postAttachmentRepository;
        private IGenericRepository<PostTag> _postTagRepository;
        private IGenericRepository<CourseTag> _courseTagRepository;
        private IGenericRepository<CourseCertificate> _courseCertificateRepository;
        private readonly UserManager<User> _userManager;
        private readonly IBlobService _blobService;
        private readonly IClassService _classService;
        private readonly IUserService _userService;


        public CourseService(IMapper mapper, IGenericRepository<Course> courseRepository, IGenericRepository<CourseLanguage> courseLanguageRepository, IGenericRepository<CourseDiscipline> courseDisciplineRepository, IGenericRepository<CourseStudent> courseStudentRepository, IGenericRepository<CourseTeacher> courseTeacherRepository, IGenericRepository<Post> postRepository, IGenericRepository<Class> classRepository,IGenericRepository<PostAttachment> postAttachmentRepository, IGenericRepository<PostTag> postTagRepository, IGenericRepository<CourseCertificate> courseCertificateRepository, IGenericRepository<CourseTag> courseTagRepository, UserManager<User> userManager, IBlobService blobService, IClassService classService, IUserService userService)
        {
            _mapper = mapper;
            _courseRepository = courseRepository;
            _courseLanguageRepository = courseLanguageRepository;
            _courseDisciplineRepository = courseDisciplineRepository;
            _courseStudentRepository = courseStudentRepository;
            _courseTeacherRepository = courseTeacherRepository;
            _postRepository = postRepository;
            _classRepository = classRepository;
            _postAttachmentRepository = postAttachmentRepository;
            _postTagRepository = postTagRepository;
            _courseCertificateRepository = courseCertificateRepository;
            _courseTagRepository = courseTagRepository;
            _userManager = userManager;
            _blobService = blobService;
            _classService = classService;
            _userService = userService;
        }

        public async Task<Guid> SaveNewCourse(CourseViewModel courseViewModel, string createdById)
        {
            var containerName = "coursethumbnail";
            var langList = JsonConvert.DeserializeObject<string[]>(courseViewModel.LanguageIds.First());
            courseViewModel.LanguageIds = langList;

            var teacherIdsList = JsonConvert.DeserializeObject<string[]>(courseViewModel.TeacherIds.First());
            courseViewModel.TeacherIds = teacherIdsList;

            var studentIds = JsonConvert.DeserializeObject<string[]>(courseViewModel.StudentIds.First());
            courseViewModel.StudentIds = studentIds;

            var disciplineIds = JsonConvert.DeserializeObject<string[]>(courseViewModel.DisciplineIds.First());
            courseViewModel.DisciplineIds = disciplineIds;

            courseViewModel.CourseUrl = JsonConvert.DeserializeObject<string>(courseViewModel.CourseUrl);

            courseViewModel.CourseTags = JsonConvert.DeserializeObject<string[]>(courseViewModel.CourseTags.First());

            if (courseViewModel.Thumbnail != null)
            {
                courseViewModel.ThumbnailUrl = await _blobService.UploadFileAsync(courseViewModel.Thumbnail, containerName);
            }

            var course = new Course
            {
                CourseName = courseViewModel.CourseName,
                SchoolId = courseViewModel.SchoolId,
                ServiceTypeId = courseViewModel.ServiceTypeId,
                AccessibilityId = courseViewModel.AccessibilityId,
                Description = courseViewModel.Description,
                Price = courseViewModel.Price,
                CourseUrl = courseViewModel.CourseUrl,
                ThumbnailUrl = courseViewModel.ThumbnailUrl,
                CreatedById = createdById,
                CreatedOn = DateTime.UtcNow
            };

            _courseRepository.Insert(course);
            _courseRepository.Save();
            courseViewModel.CourseId = course.CourseId;

            if (courseViewModel.LanguageIds.Any())
            {
                await SaveCourseLanguages(courseViewModel.LanguageIds, course.CourseId);
            }

            if (courseViewModel.DisciplineIds.Any())
            {
                await SaveCourseDisciplines(courseViewModel.DisciplineIds, course.CourseId);
            }

            if (courseViewModel.StudentIds.Any())
            {
                await SaveCourseStudents(courseViewModel.StudentIds, course.CourseId);
            }

            if (courseViewModel.TeacherIds.Any())
            {
                await SaveCourseTeachers(courseViewModel.TeacherIds, course.CourseId);
            }

            if (courseViewModel.CourseTags != null)
            {
                await SaveCourseTags(courseViewModel.CourseTags, courseViewModel.CourseId);
            }

            return courseViewModel.CourseId;

        }

        public async Task SaveCourseLanguages(IEnumerable<string> languageIds, Guid courseId)
        {
            var courses = await GetAllCourses();
            var isCourseExist = courses.Where(x => x.CourseId == courseId).FirstOrDefault();
            if (isCourseExist == null)
            {
                await _classService.SaveClassLanguages(languageIds, courseId);
            }
            else
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

        public async Task SaveCourseTeachers(IEnumerable<string> teacherIds, Guid courseId)
        {
            var courses = await GetAllCourses();
            var isCourseExist = courses.Where(x => x.CourseId == courseId).FirstOrDefault();
            if (isCourseExist == null)
            {
                await _classService.SaveClassTeachers(teacherIds, courseId);
            }
            else
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
        }

        public async Task<Guid> UpdateCourse(CourseViewModel courseViewModel)
        {
            var containerName = "courselogo";
            if (courseViewModel.AvatarImage != null)
            {
                courseViewModel.Avatar = await _blobService.UploadFileAsync(courseViewModel.AvatarImage, containerName);
            }

            courseViewModel.LanguageIds = JsonConvert.DeserializeObject<string[]>(courseViewModel.LanguageIds.First());

            Course course = _courseRepository.GetById(courseViewModel.CourseId);
            course.Avatar = courseViewModel.Avatar;
            course.CourseName = courseViewModel.CourseName;
            course.ServiceTypeId = courseViewModel.ServiceTypeId;
            course.AccessibilityId = courseViewModel.AccessibilityId;
            course.Description = courseViewModel.Description;
            course.Price = courseViewModel.Price;

            _courseRepository.Update(course);
            _courseRepository.Save();

            if (courseViewModel.LanguageIds != null)
            {
                await UpdateCourseLanguages(courseViewModel.LanguageIds, courseViewModel.CourseId);
            }

            return courseViewModel.CourseId;

            //if (courseViewModel.DisciplineIds != null)
            //{
            //    await UpdateCourseDisciplines(courseViewModel.DisciplineIds, courseViewModel.CourseId);
            //}

            //if (courseViewModel.StudentIds != null)
            //{
            //    await UpdateCourseStudents(courseViewModel.StudentIds, courseViewModel.CourseId);
            //}

            //if (courseViewModel.TeacherIds != null)
            //{
            //    await UpdateCourseTeachers(courseViewModel.TeacherIds, courseViewModel.CourseId);
            //}

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

        public async Task<CourseDetailsViewModel> GetCourseById(Guid courseId,string loginUserid)
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

                if (course == null)
                {
                    
                    var classDetails = await _classService.GetClassById(courseId, loginUserid);

                    var courses = new CourseDetailsViewModel();
                    courses.CourseId = classDetails.ClassId;
                    courses.CourseName = classDetails.ClassName;
                    courses.School = classDetails.School;
                    courses.ServiceType = classDetails.ServiceType;
                    courses.Accessibility = classDetails.Accessibility;
                    courses.School.Country = classDetails.School.Country;
                    courses.School.Specialization = classDetails.School.Specialization;
                    courses.CreatedBy = classDetails.CreatedBy;
                    courses.Avatar = classDetails.Avatar;
                    courses.CourseUrl = classDetails.ClassUrl;
                    courses.Languages = classDetails.Languages;
                    courses.Disciplines = classDetails.Disciplines;
                    courses.Students = classDetails.Students;
                    courses.Teachers = classDetails.Teachers;
                    courses.Posts = classDetails.Posts;
                    courses.IsConvertable = true;


                    courses.CourseCertificates = _mapper.Map<IEnumerable<CourseCertificateViewModel>>(classDetails.ClassCertificates);

                    return courses;



                }
                model = _mapper.Map<CourseDetailsViewModel>(course);

                model.Languages = await GetLanguages(course.CourseId);
                model.Disciplines = await GetDisciplines(course.CourseId);
                model.Students = await GetStudents(course.CourseId);
                model.Teachers = await GetTeachers(course.CourseId);
                model.Posts = await GetPostsByCourseId(course.CourseId, loginUserid);
                model.CourseCertificates = await GetCertificateByCourseId(course.CourseId);


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

        async Task<int> GetStudents(Guid courseId)
        {
            var courseStudents = _courseStudentRepository.GetAll()
                .Include(x => x.Student)
                .ThenInclude(x => x.CreatedBy)
                .Where(x => x.CourseId == courseId).ToList();

            return courseStudents.Count();
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

        public async Task<IEnumerable<PostDetailsViewModel>> GetPostsByCourseId(Guid courseId,string loginUserId)
        {
            var courseList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == courseId).OrderByDescending(x => x.IsPinned).ToListAsync();
            var result = _mapper.Map<List<PostDetailsViewModel>>(courseList);

            foreach (var post in result)
            {
                post.PostAttachments = await GetAttachmentsByPostId(post.Id);
                post.Likes = await _userService.GetLikesOnPost(post.Id);
                post.Views = await _userService.GetViewsOnPost(post.Id);
                if (post.Likes.Any(x => x.UserId == loginUserId && x.PostId == post.Id))
                {
                    post.IsPostLikedByCurrentUser = true;
                }
                else
                {
                    post.IsPostLikedByCurrentUser = false;
                }
            }

            foreach (var post in result)
            {
                var tags = await GetTagsByPostId(post.Id);
                post.PostTags = tags;
            }

            //foreach (var post in result)
            //{
            //    var author = await _courseRepository.GetAll().Include(x => x.School).Where(x => x.CourseId == post.ParentId).FirstOrDefaultAsync();

            //    post.Owner = _mapper.Map<OwnerViewModel>(author.School);
            //}

            //foreach (var post in result)
            //{
            //    var author = await _userManager.Users.Where(x => x.Id == post.CreatedBy).FirstOrDefaultAsync();

            //    post.Author = _mapper.Map<AuthorViewModel>(author);
            //}

            return result;
        }

        async Task<IEnumerable<CourseCertificateViewModel>> GetCertificateByCourseId(Guid courseId)
        {
            var courseCertificate = _courseCertificateRepository.GetAll().Where(x => x.CourseId == courseId).ToList();
            var response = _mapper.Map<IEnumerable<CourseCertificateViewModel>>(courseCertificate);
            return response;
        }

        public async Task<CourseViewModel> GetBasicCourseInfo(Guid courseId)
        {
            var course = await _courseRepository.GetAll().Include(x => x.School).Where(x => x.CourseId == courseId).FirstOrDefaultAsync();

            if (course == null)
            {
                var classDetails = await _classRepository.GetAll().Include(x => x.School).Where(x => x.ClassId == courseId).FirstOrDefaultAsync();
                var courses = new CourseViewModel();
                courses.CourseId = classDetails.ClassId;
                courses.CourseName = classDetails.ClassName;
                courses.IsConvertable = true;
                courses.School = _mapper.Map<SchoolViewModel>(classDetails.School);
                return courses;
            }

            var response = _mapper.Map<CourseViewModel>(course);
            return response;

        }

        public async Task DeleteCourseLanguage(CourseLanguageViewModel model)
        {
            var courseLanguage = await _courseLanguageRepository.GetAll().Where(x => x.CourseId == model.CourseId && x.LanguageId == model.LanguageId).FirstOrDefaultAsync();

            if (courseLanguage == null)
            {
                await _classService.DeleteClassLanguage(_mapper.Map<ClassLanguageViewModel>(model));
            }
            else
            {
                _courseLanguageRepository.Delete(courseLanguage.Id);
                _courseLanguageRepository.Save();
            }
        }

        public async Task DeleteCourseTeacher(CourseTeacherViewModel model)
        {
            var courseTeacher = await _courseTeacherRepository.GetAll().Where(x => x.CourseId == model.CourseId && x.TeacherId == model.TeacherId).FirstOrDefaultAsync();

            if (courseTeacher == null)
            {
                await _classService.DeleteClassTeacher(_mapper.Map<ClassTeacherViewModel>(model));
            }
            else
            {
                _courseTeacherRepository.Delete(courseTeacher.Id);
                _courseTeacherRepository.Save();
            }

        }

        public async Task<IEnumerable<PostAttachmentViewModel>> GetAttachmentsByPostId(Guid postId)
        {
            var attacchmentList = await _postAttachmentRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.PostId == postId).ToListAsync();

            var result = _mapper.Map<List<PostAttachmentViewModel>>(attacchmentList);
            return result;
        }

        public async Task<IEnumerable<PostTagViewModel>> GetTagsByPostId(Guid postId)
        {
            var tagList = await _postTagRepository.GetAll().Where(x => x.PostId == postId).ToListAsync();

            var result = _mapper.Map<List<PostTagViewModel>>(tagList);
            return result;
        }
        public async Task SaveCourseCertificates(SaveCourseCertificateViewModel courseCertificates)
        {
            string containerName = "coursecertificates";

            var courses = await GetAllCourses();
            var isCourseExist = courses.Where(x => x.CourseId == courseCertificates.CourseId).FirstOrDefault();
            if (isCourseExist == null)
            {
                await _classService.SaveClassCertificates(_mapper.Map<SaveClassCertificateViewModel>(courseCertificates));    
            }
            else
            {
                foreach (var certificate in courseCertificates.Certificates)
                {
                    string certificateUrl = await _blobService.UploadFileAsync(certificate, containerName);

                    string certificateName = certificate.FileName;

                    var classCertificate = new CourseCertificate
                    {
                        CertificateUrl = certificateUrl,
                        Name = certificateName,
                        CourseId = courseCertificates.CourseId
                    };
                    _courseCertificateRepository.Insert(classCertificate);
                    _courseCertificateRepository.Save();
                }
            }

        }

        public async Task DeleteCourseCertificate(CourseCertificateViewModel model)
        {
            var courseCertificate = await _courseCertificateRepository.GetAll().Where(x => x.CourseId == model.CourseId && x.CertificateId == model.CertificateId).FirstOrDefaultAsync();

            if (courseCertificate == null)
            {
                await _classService.DeleteClassCertificate(_mapper.Map<ClassCertificateViewModel>(model));
            }
            else
            {
                _courseCertificateRepository.Delete(courseCertificate.CertificateId);
                _courseCertificateRepository.Save();
            }

        }

        public async Task<bool> ConvertToClass(Guid courseId)
        {
            Class classes = _classRepository.GetById(courseId);
            if (classes != null)
            {
                classes.IsCourse = false;
                _classRepository.Update(classes);
                _classRepository.Save();
                return true;
            }
            return false;
        }

        public async Task<CourseViewModel> GetCourseByName(string courseName, string schoolName)
        {
            var course = await _courseRepository.GetAll().Include(x => x.School).Where(x => x.CourseName.Replace(" ", "").ToLower() == courseName && x.School.SchoolName.Replace(" ", "").ToLower() == schoolName).FirstOrDefaultAsync();
            if (course != null)
            {
                return _mapper.Map<CourseViewModel>(course);
            }
            return null;
        }

        public async Task<bool> IsCourseNameExist(string courseName)
        {
            var result = await _courseRepository.GetAll().Where(x => x.CourseName == courseName).FirstOrDefaultAsync();
            if (result != null)
            {
                return false;
            }
            return true;
        }

        async Task SaveCourseTags(IEnumerable<string> courseTags, Guid courseId)
        {
            foreach (var tagValue in courseTags)
            {
                var courseTag = new CourseTag
                {
                    CourseId = courseId,
                    CourseTagValue = tagValue
                };

                _courseTagRepository.Insert(courseTag);
                _courseTagRepository.Save();

            }
        }


    }
}
