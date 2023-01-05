using AutoMapper;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
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
    public class ClassService : IClassService
    {
        public string containerName = "classthumbnail";
        private readonly IMapper _mapper;
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<ClassLanguage> _classLanguageRepository;
        private IGenericRepository<ClassTeacher> _classTeacherRepository;
        private IGenericRepository<ClassStudent> _classStudentRepository;
        private IGenericRepository<ClassDiscipline> _classDisciplineRepository;
        private IGenericRepository<Post> _postRepository;
        private IGenericRepository<PostAttachment> _postAttachmentRepository;
        private IGenericRepository<PostTag> _postTagRepository;
        private IGenericRepository<ClassCertificate> _classCertificateRepository;
        private readonly UserManager<User> _userManager;
        private readonly IBlobService _blobService;

        public ClassService(IMapper mapper, IGenericRepository<Class> classRepository, IGenericRepository<ClassLanguage> classLanguageRepository, IGenericRepository<ClassTeacher> classTeacherRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<ClassDiscipline> classDisciplineRepository, IGenericRepository<Post> postRepository, IGenericRepository<PostAttachment> postAttachmentRepository, IGenericRepository<PostTag> postTagRepository, IGenericRepository<ClassCertificate> classCertificateRepository, UserManager<User> userManager, IBlobService blobService)
        {
            _mapper = mapper;
            _classRepository = classRepository;
            _classLanguageRepository = classLanguageRepository;
            _classTeacherRepository = classTeacherRepository;
            _classStudentRepository = classStudentRepository;
            _classDisciplineRepository = classDisciplineRepository;
            _postRepository = postRepository;
            _postAttachmentRepository = postAttachmentRepository;
            _postTagRepository = postTagRepository;
            _classCertificateRepository = classCertificateRepository;
            _userManager = userManager;
            _blobService = blobService;
        }
        public async Task<Guid> SaveNewClass(ClassViewModel classViewModel, string createdById)
        {

            var langList = JsonConvert.DeserializeObject<string[]>(classViewModel.LanguageIds.First());
            classViewModel.LanguageIds = langList;

            var teacherIdsList = JsonConvert.DeserializeObject<string[]>(classViewModel.TeacherIds.First());
            classViewModel.TeacherIds = teacherIdsList;

            var studentIds = JsonConvert.DeserializeObject<string[]>(classViewModel.StudentIds.First());
            classViewModel.StudentIds = studentIds;

            var disciplineIds = JsonConvert.DeserializeObject<string[]>(classViewModel.DisciplineIds.First());
            classViewModel.DisciplineIds = disciplineIds;

            classViewModel.ClassUrl = JsonConvert.DeserializeObject<string>(classViewModel.ClassUrl);

            if (classViewModel.Thumbnail != null)
            {
                classViewModel.ThumbnailUrl = await _blobService.UploadFileAsync(classViewModel.Thumbnail, containerName);
            }

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
                ClassUrl = classViewModel.ClassUrl,
                ThumbnailUrl = classViewModel.ThumbnailUrl,
                CreatedById = createdById,
                CreatedOn = DateTime.UtcNow
            };

            try
            {
                _classRepository.Insert(classes);
                _classRepository.Save();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            classViewModel.ClassId = classes.ClassId;

            if (classViewModel.LanguageIds.Any())
            {
                await SaveClassLanguages(classViewModel.LanguageIds, classes.ClassId);
            }

            if (classViewModel.DisciplineIds.Any())
            {
                await SaveClassDisciplines(classViewModel.DisciplineIds, classes.ClassId);
            }

            if (classViewModel.StudentIds.Any())
            {
                await SaveClassStudents(classViewModel.StudentIds, classes.ClassId);
            }

            if (classViewModel.TeacherIds.Any())
            {
                await SaveClassTeachers(classViewModel.TeacherIds, classes.ClassId);
            }

            return classViewModel.ClassId;

        }

        public async Task SaveClassLanguages(IEnumerable<string> languageIds, Guid classId)
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

        public async Task SaveClassTeachers(IEnumerable<string> teacherIds, Guid classId)
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

        public async Task<ClassUpdateViewModel> GetClassEditDetails(Guid classId)
        {
            var classes = await _classRepository.GetAll().Where(x => x.ClassId == classId)
                .Include(x => x.School)
                .Include(x => x.Accessibility)
                .Include(x => x.ServiceType)
                .Include(x => x.CreatedBy)
                .FirstOrDefaultAsync();


            var result = _mapper.Map<ClassUpdateViewModel>(classes);
            result.Languages = await GetLanguages(result.ClassId);
            return result;
        }

        public async Task<Guid> UpdateClass(ClassUpdateViewModel classUpdateViewModel)
        {
            var containerName = "classlogo";
            if (classUpdateViewModel.AvatarImage != null)
            {
                classUpdateViewModel.Avatar = await _blobService.UploadFileAsync(classUpdateViewModel.AvatarImage, containerName);
            }

            classUpdateViewModel.LanguageIds = JsonConvert.DeserializeObject<string[]>(classUpdateViewModel.LanguageIds.First());

            Class classes = _classRepository.GetById(classUpdateViewModel.ClassId);
            classes.Avatar = classUpdateViewModel.Avatar;
            classes.ClassName = classUpdateViewModel.ClassName;
            classes.NoOfStudents = classUpdateViewModel.NoOfStudents;
            classes.StartDate = classUpdateViewModel.StartDate;
            classes.EndDate = classUpdateViewModel.EndDate;
            classes.ServiceTypeId = classUpdateViewModel.ServiceTypeId;
            classes.AccessibilityId = classUpdateViewModel.AccessibilityId;
            classes.Price = classUpdateViewModel.Price;
            classes.Description = classUpdateViewModel.Description;

            _classRepository.Update(classes);
            _classRepository.Save();

            if (classUpdateViewModel.LanguageIds.Any())
            {
                await UpdateClassLanguages(classUpdateViewModel.LanguageIds, classUpdateViewModel.ClassId);
            }
            return classUpdateViewModel.ClassId;

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
                model.ClassCertificates = await GetCertificateByClassId(classes.ClassId);

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
            var courseList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == classId).OrderByDescending(x => x.IsPinned).ToListAsync();
            var result = _mapper.Map<List<PostDetailsViewModel>>(courseList);

            foreach (var post in result)
            {
                var attachment = await GetAttachmentsByPostId(post.Id);
                post.PostAttachments = attachment;
            }

            foreach (var post in result)
            {
                var tags = await GetTagsByPostId(post.Id);
                post.PostTags = tags;
            }


            //foreach (var post in result)
            //{
            //    var author = await _classRepository.GetAll().Include(x => x.School).Where(x => x.ClassId == post.ParentId).FirstOrDefaultAsync();
            //    post.Owner = _mapper.Map<OwnerViewModel>(author.School);
            //}

            //foreach (var post in result)
            //{
            //    var author = await _userManager.Users.Where(x => x.Id == post.CreatedBy).FirstOrDefaultAsync();
            //    post.Author = _mapper.Map<AuthorViewModel>(author);
            //}

            return result;
        }

        async Task<IEnumerable<ClassCertificateViewModel>> GetCertificateByClassId(Guid classId)
        {
            var classCertificate = _classCertificateRepository.GetAll().Where(x => x.ClassId == classId).ToList();
            var response = _mapper.Map<IEnumerable<ClassCertificateViewModel>>(classCertificate);
            return response;
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

        public async Task DeleteClassLanguage(ClassLanguageViewModel model)
        {
            var classLanguage = await _classLanguageRepository.GetAll().Where(x => x.ClassId == model.ClassId && x.LanguageId == model.LanguageId).FirstOrDefaultAsync();

            _classLanguageRepository.Delete(classLanguage.Id);
            _classLanguageRepository.Save();

        }

        public async Task SaveClassTeachers(SaveClassTeacherViewModel model)
        {
            foreach (var teacherId in model.TeacherIds)
            {
                var classTeacher = new ClassTeacher
                {
                    ClassId = new Guid(model.ClassId),
                    TeacherId = new Guid(teacherId)
                };

                _classTeacherRepository.Insert(classTeacher);
                try
                {
                    _classTeacherRepository.Save();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        public async Task DeleteClassTeacher(ClassTeacherViewModel model)
        {
            var classTeacher = await _classTeacherRepository.GetAll().Where(x => x.ClassId == model.ClassId && x.TeacherId == model.TeacherId).FirstOrDefaultAsync();

            _classTeacherRepository.Delete(classTeacher.Id);
            _classTeacherRepository.Save();

        }

        public async Task SaveClassCertificates(SaveClassCertificateViewModel classCertificates)
        {
            string containerName = "classcertificates";

            foreach (var certificate in classCertificates.Certificates)
            {
                string certificateUrl = await _blobService.UploadFileAsync(certificate, containerName);

                string certificateName = certificate.FileName;

                var classCertificate = new ClassCertificate
                {
                    CertificateUrl = certificateUrl,
                    Name = certificateName,
                    ClassId = classCertificates.ClassId
                };
                _classCertificateRepository.Insert(classCertificate);
                _classCertificateRepository.Save();
            }

        }

        public async Task DeleteClassCertificate(ClassCertificateViewModel model)
        {
            var classCertificate = await _classCertificateRepository.GetAll().Where(x => x.ClassId == model.ClassId && x.CertificateId == model.CertificateId).FirstOrDefaultAsync();

            _classCertificateRepository.Delete(classCertificate.CertificateId);
            _classCertificateRepository.Save();

        }

        public async Task<ClassViewModel> GetBasicClassInfo(Guid classId)
        {
            var classes = await _classRepository.GetAll().Include(x => x.School).Where(x => x.ClassId == classId).FirstOrDefaultAsync();

            var response = _mapper.Map<ClassViewModel>(classes);
            return response;

        }

        public async Task<ClassViewModel> GetClassByName(string className, string schoolName)
        {
            var classes = await _classRepository.GetAll().Include(x => x.School).Where(x => x.ClassName.Replace(" ", "").ToLower() == className && x.School.SchoolName.Replace(" ", "").ToLower() == schoolName).FirstOrDefaultAsync();
            if (classes != null)
            {
                return _mapper.Map<ClassViewModel>(classes);
            }
            return null;
        }

        public async Task<bool> IsClassNameExist(string className)  
        {
            var result = await _classRepository.GetAll().Where(x => x.ClassName == className).FirstOrDefaultAsync();
            if (result != null)
            {
                return false;
            }
            return true;
        }

        public async Task<bool> ConvertToCourse(Guid classId)
        {
            Class classes = _classRepository.GetById(classId);
            if (classes != null)
            {
                classes.IsCourse = true;
                _classRepository.Update(classes);
                _classRepository.Save();
                return true;
            }
            return false;
        }
    }
}
