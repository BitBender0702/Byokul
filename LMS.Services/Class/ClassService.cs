using AutoMapper;
using iText.Kernel.Geom;
using LMS.Common.Enums;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Student;
using LMS.Common.ViewModels.Teacher;
using LMS.Data.Entity;
using LMS.Data.Entity.Common;
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
using static iText.StyledXmlParser.Jsoup.Select.Evaluator;
using Class = LMS.Data.Entity.Class;

namespace LMS.Services
{
    public class ClassService : IClassService
    {
        public string containerName = "classthumbnail";
        private readonly IMapper _mapper;
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<Course> _courseRepository;
        private IGenericRepository<ClassLanguage> _classLanguageRepository;
        private IGenericRepository<ClassTeacher> _classTeacherRepository;
        private IGenericRepository<ClassStudent> _classStudentRepository;
        private IGenericRepository<ClassDiscipline> _classDisciplineRepository;
        private IGenericRepository<Post> _postRepository;
        private IGenericRepository<PostAttachment> _postAttachmentRepository;
        private IGenericRepository<PostTag> _postTagRepository;
        private IGenericRepository<ClassTag> _classTagRepository;
        private IGenericRepository<ClassCertificate> _classCertificateRepository;
        private readonly UserManager<User> _userManager;
        private IGenericRepository<ClassLike> _classLikeRepository;
        private IGenericRepository<ClassViews> _classViewsRepository;
        private IGenericRepository<School> _schoolRepository;
        private IGenericRepository<ClassCourseFilter> _classCourseFilterRepository;
        private IGenericRepository<UserClassCourseFilter> _userClassCourseFilterRepository;
        private IGenericRepository<UserSharedPost> _userSharedPostRepository;
        private IGenericRepository<SavedPost> _savedPostRepository;
        private IGenericRepository<ClassCourseTransaction> _classCourseTransactionRepository;
        private readonly IBlobService _blobService;
        private readonly IUserService _userService;
        private IConfiguration _config;

        private IGenericRepository<ClassCourseRating> _classCourseRatingRepository;

        public ClassService(IMapper mapper, IGenericRepository<Class> classRepository, IGenericRepository<ClassCourseRating> classCourseRatingRepository, IGenericRepository<Course> courseRepository, IGenericRepository<ClassLanguage> classLanguageRepository, IGenericRepository<ClassTeacher> classTeacherRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<ClassDiscipline> classDisciplineRepository, IGenericRepository<Post> postRepository, IGenericRepository<PostAttachment> postAttachmentRepository, IGenericRepository<PostTag> postTagRepository, IGenericRepository<ClassTag> classTagRepository, IGenericRepository<ClassCertificate> classCertificateRepository, UserManager<User> userManager, IBlobService blobService, IUserService userService, IGenericRepository<ClassLike> classLikeRepository, IGenericRepository<ClassViews> classViewsRepository, IGenericRepository<School> schoolRepository, IGenericRepository<ClassCourseFilter> classCourseFilterRepository, IGenericRepository<UserClassCourseFilter> userClassCourseFilterRepository, IGenericRepository<UserSharedPost> userSharedPostRepository, IGenericRepository<SavedPost> savedPostRepository, IConfiguration config, IGenericRepository<ClassCourseTransaction> classCourseTransactionRepository)
        {
            _mapper = mapper;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _classLanguageRepository = classLanguageRepository;
            _classTeacherRepository = classTeacherRepository;
            _classStudentRepository = classStudentRepository;
            _classDisciplineRepository = classDisciplineRepository;
            _postRepository = postRepository;
            _postAttachmentRepository = postAttachmentRepository;
            _postTagRepository = postTagRepository;
            _classCertificateRepository = classCertificateRepository;
            _classTagRepository = classTagRepository;
            _userManager = userManager;
            _blobService = blobService;
            _userService = userService;
            _classLikeRepository = classLikeRepository;
            _classViewsRepository = classViewsRepository;
            _schoolRepository = schoolRepository;
            _classCourseFilterRepository = classCourseFilterRepository;
            _userClassCourseFilterRepository = userClassCourseFilterRepository;
            _userSharedPostRepository = userSharedPostRepository;
            _savedPostRepository = savedPostRepository;
            _config = config;
            _classCourseTransactionRepository = classCourseTransactionRepository;

            _classCourseRatingRepository = classCourseRatingRepository;
        }
        public async Task<ClassViewModel> SaveNewClass(ClassViewModel classViewModel, string createdById)
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

            classViewModel.ClassTags = JsonConvert.DeserializeObject<string[]>(classViewModel.ClassTags.First());

            if (classViewModel.Thumbnail != null)
            {
                classViewModel.ThumbnailUrl = await _blobService.UploadFileAsync(classViewModel.Thumbnail, containerName, false);
                int index = classViewModel.Thumbnail.ContentType.IndexOf('/');
                if (index > 0)
                {
                    if (classViewModel.Thumbnail.ContentType.Substring(0, index) == "video")
                    {
                        classViewModel.ThumbnailType = (int)FileTypeEnum.Video;
                    }
                    else
                    {
                        classViewModel.ThumbnailType = (int)FileTypeEnum.Image;
                    }
                }
            }

            if (classViewModel.AvatarImage != null)
            {
                classViewModel.Avatar = await _blobService.UploadFileAsync(classViewModel.AvatarImage, containerName, false);
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
                Currency = classViewModel.Currency,
                AccessibilityId = classViewModel.AccessibilityId,
                ClassUrl = classViewModel.ClassUrl,
                ThumbnailUrl = classViewModel.ThumbnailUrl,
                ThumbnailType = classViewModel.ThumbnailType,
                CreatedById = createdById,
                CreatedOn = DateTime.UtcNow,
                IsCommentsDisabled = false,
                Avatar = classViewModel.Avatar
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

            if (classViewModel.ClassTags != null)
            {
                await SaveClassTags(classViewModel.ClassTags, classViewModel.ClassId);
            }

            var school = await _schoolRepository.GetAll().Where(x => x.SchoolId == classViewModel.SchoolId).FirstOrDefaultAsync();
            try
            {
                var schoolResult = _mapper.Map<SchoolViewModel>(school);
                classViewModel.School = schoolResult;
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return classViewModel;

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
                var isTeacherExist = await _classTeacherRepository.GetAll().Where(x => x.TeacherId == new Guid(teacherId) && x.ClassId == classId).FirstOrDefaultAsync();

                if (isTeacherExist != null)
                {
                    _classTeacherRepository.Delete(isTeacherExist.Id);
                    _classTeacherRepository.Save();
                }

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

        public async Task<ClassUpdateViewModel> UpdateClass(ClassUpdateViewModel classUpdateViewModel)
        {
            var containerName = "classlogo";
            if (classUpdateViewModel.AvatarImage != null)
            {
                classUpdateViewModel.Avatar = await _blobService.UploadFileAsync(classUpdateViewModel.AvatarImage, containerName, false);
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
            classes.Currency = classUpdateViewModel.Currency;
            classes.Description = classUpdateViewModel.Description; 
            _classRepository.Update(classes);
            _classRepository.Save();

            if (classUpdateViewModel.LanguageIds.Any())
            {
                await UpdateClassLanguages(classUpdateViewModel.LanguageIds, classUpdateViewModel.ClassId);
            }

            var school = await _schoolRepository.GetAll().Where(x => x.SchoolId == classUpdateViewModel.SchoolId).FirstOrDefaultAsync();
            try
            {
                var schoolResult = _mapper.Map<SchoolViewModel>(school);
                classUpdateViewModel.School = schoolResult;
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return classUpdateViewModel;

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

        public async Task<ClassDetailsViewModel> GetClassByName(string className, string loginUserId)
        {
            ClassDetailsViewModel model = new ClassDetailsViewModel();
            if (className != null)
            {
                className = System.Web.HttpUtility.UrlEncode(className, Encoding.GetEncoding("iso-8859-7")).Replace("%3f", "").Replace("+", "").Replace(".","").ToLower();
                var classesList = await _classRepository.GetAll()
                    .Include(x => x.ServiceType)
                    .Include(x => x.School)
                    .ThenInclude(x => x.Country)
                    .Include(x => x.School)
                    .ThenInclude(x => x.Specialization)
                    .Include(x => x.Accessibility)
                    .Include(x => x.CreatedBy).ToListAsync();

                var classes = classesList.Where(x => (System.Web.HttpUtility.UrlEncode(x.ClassName.Replace(" ", "").Replace(".", "").ToLower(), Encoding.GetEncoding("iso-8859-7")) == className) && !x.IsDeleted).FirstOrDefault();

                try
                {
                    model = _mapper.Map<ClassDetailsViewModel>(classes);
                }
                catch (Exception ex)
                {
                    throw ex;
                }

                var isClassRated = _classCourseRatingRepository.GetAll().Where(x => x.ClassId == model.ClassId && x.UserId == loginUserId).FirstOrDefault();
                if (isClassRated == null)
                {
                    model.IsRatedByUser = false;
                }
                else
                {
                    model.IsRatedByUser = true;
                }

                model.Languages = await GetLanguages(classes.ClassId);
                model.Disciplines = await GetDisciplines(classes.ClassId);
                model.Students = await GetStudents(classes.ClassId);
                model.Teachers = await GetTeachers(classes.ClassId);
                model.Posts = await GetPostsByClassId(classes.ClassId, loginUserId);
                model.Reels = await GetReelsByClassId(classes.ClassId, loginUserId);
                model.ClassCertificates = await GetCertificateByClassId(classes.ClassId);



                var isClassAccessible = await _classCourseTransactionRepository.GetAll().Where(x => x.ClassId == model.ClassId && x.UserId == loginUserId && x.PaymentId != null).FirstOrDefaultAsync();

                if (isClassAccessible != null || model.CreatedById == loginUserId)
                {
                    model.IsClassAccessable = true;
                }

                return model;
            }
            return null;
        }

        public async Task<ClassDetailsViewModel> GetClassById(Guid classId, string loginUserId)
        {
            ClassDetailsViewModel model = new ClassDetailsViewModel();
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

            var isClassRated = _classCourseRatingRepository.GetAll().Where(x => x.ClassId == model.ClassId && x.UserId == loginUserId).FirstOrDefault();
            if (isClassRated == null)
            {
                model.IsRatedByUser = false;
            }
            else
            {
                model.IsRatedByUser = true;
            }

            model.Languages = await GetLanguages(classes.ClassId);
            model.Disciplines = await GetDisciplines(classes.ClassId);
            model.Students = await GetStudents(classes.ClassId);
            model.Teachers = await GetTeachers(classes.ClassId);
            model.Posts = await GetPostsByClassId(classes.ClassId, loginUserId);
            model.Reels = await GetReelsByClassId(classes.ClassId, loginUserId);
            model.ClassCertificates = await GetCertificateByClassId(classes.ClassId);

            var isClassAccessible = await _classCourseTransactionRepository.GetAll().Where(x => x.ClassId == model.ClassId && x.UserId == loginUserId).FirstOrDefaultAsync();

            if (isClassAccessible != null || model.CreatedById == loginUserId)
            {
                model.IsClassAccessable = true;
            }

            return model;
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

        public async Task<int> GetStudents(Guid classId)
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
            var classStudents = await _classStudentRepository.GetAll().Where(x => x.ClassId == classId).ToListAsync();
            if (classStudents.Count > 0)
            {
                _classStudentRepository.DeleteAll(classStudents);
                _classStudentRepository.Save();
            }

            var classTeachers = await _classTeacherRepository.GetAll().Where(x => x.ClassId == classId).ToListAsync();
            if (classTeachers.Count > 0)
            {
                _classTeacherRepository.DeleteAll(classTeachers);
                _classTeacherRepository.Save();
            }
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

        public async Task<IEnumerable<PostDetailsViewModel>> GetPostsByClassId(Guid classId, string loginUserId, int pageNumber = 1, int pageSize = 12)
        {
            var courseList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == classId && (x.PostType == (int)PostTypeEnum.Post || (x.PostType == (int)PostTypeEnum.Stream) && x.IsLive == true) && x.PostAuthorType == (int)PostAuthorTypeEnum.Class && x.IsPostSchedule != true).OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.CreatedOn).ToListAsync();

            var sharedPost = await _userSharedPostRepository.GetAll().ToListAsync();
            var savedPost = await _savedPostRepository.GetAll().ToListAsync();
            var result = _mapper.Map<List<PostDetailsViewModel>>(courseList).Skip((pageNumber - 1) * pageSize).Take(pageSize);

            foreach (var post in result)
            {
                post.PostAttachments = await GetAttachmentsByPostId(post.Id);
                post.Likes = await _userService.GetLikesOnPost(post.Id);
                post.Views = await _userService.GetViewsOnPost(post.Id);
                post.CommentsCount = await _userService.GetCommentsCountOnPost(post.Id);
                post.PostSharedCount = sharedPost.Where(x => x.PostId == post.Id).Count();
                post.SavedPostsCount = savedPost.Where(x => x.PostId == post.Id).Count();
                post.IsPostSavedByCurrentUser = savedPost.Any(x => x.PostId == post.Id && x.UserId == loginUserId);
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

            return result;
        }

        public async Task<IEnumerable<PostDetailsViewModel>> GetReelsByClassId(Guid classId, string loginUserId, int pageNumber = 1, int pageSize = 8)
        {
            var courseList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == classId && x.PostType == (int)PostTypeEnum.Reel && x.IsPostSchedule != true).OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.CreatedOn).ToListAsync();
            var result = _mapper.Map<List<PostDetailsViewModel>>(courseList).Skip((pageNumber - 1) * pageSize).Take(pageSize);

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

            return result;
        }

        public async Task<IEnumerable<PostDetailsViewModel>> GetSliderReelsByClassId(Guid classId, string loginUserId, Guid lastPostId, ScrollTypesEnum scrollType)
        {
            var requiredResults = new List<Post>();
            var reelList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == classId && x.PostType == (int)PostTypeEnum.Reel && x.IsPostSchedule != true).OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.CreatedOn).ToListAsync();

            if (scrollType == ScrollTypesEnum.None)
            {

                var attachment = _postAttachmentRepository.GetById(lastPostId);
                int index = reelList.FindIndex(x => x.Id == attachment.PostId);
                int startIndex = Math.Max(0, index - 3);
                int totalItems = 7;
                requiredResults = reelList.GetRange(startIndex, Math.Min(totalItems, reelList.Count - startIndex));


            }
            if (scrollType == ScrollTypesEnum.Down)
            {
                requiredResults = reelList.SkipWhile(x => x.Id != lastPostId).Skip(1).Take(3).ToList();

            }
            if (scrollType == ScrollTypesEnum.Up)
            {
                requiredResults = reelList.TakeWhile(x => x.Id != lastPostId).Reverse().Take(3).Reverse().ToList();

            }
            var result = _mapper.Map<List<PostDetailsViewModel>>(requiredResults);

            foreach (var post in result)
            {

                if (post.PostAuthorType == (int)PostAuthorTypeEnum.Class)
                {
                    var classes = _classRepository.GetById(post.ParentId);
                    post.ParentName = classes.ClassName;
                    post.ParentImageUrl = classes.Avatar;
                }

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

            return result;
        }

        async Task<IEnumerable<CertificateViewModel>> GetCertificateByClassId(Guid classId)
        {
            var classCertificate = _classCertificateRepository.GetAll().Where(x => x.ClassId == classId).ToList();
            var response = _mapper.Map<IEnumerable<CertificateViewModel>>(classCertificate);
            return response;
        }

        public async Task<IEnumerable<PostAttachmentViewModel>> GetAttachmentsByPostId(Guid postId)
        {
            var attacchmentList = await _postAttachmentRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.PostId == postId).ToListAsync();

            var result = _mapper.Map<List<PostAttachmentViewModel>>(attacchmentList);

            foreach (var item in result)
            {
                int lastSlashIndex = item.FileUrl.LastIndexOf('/');
                var fileName = item.FileUrl.Substring(lastSlashIndex + 1);
                if (!string.IsNullOrEmpty(item.CompressedFileUrl))
                {
                    item.FileUrl = item.CompressedFileUrl;
                }
                //item.ByteArray = await _blobService.GetFileContentAsync(this._config.GetValue<string>("Container:PostContainer"), fileName);

                //item.FileThumbnail = $"https://byokulstorage.blob.core.windows.net/userpostscompressed/thumbnails/{item.Id}.png";

            }
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

        public async Task<bool> DeleteClassTeacher(ClassTeacherViewModel model)
        {
            try
            {
                var classTeacher = await _classTeacherRepository.GetAll().Where(x => x.ClassId == model.ClassId && x.TeacherId == model.TeacherId).FirstOrDefaultAsync();

                _classTeacherRepository.Delete(classTeacher.Id);
                var res = await _classTeacherRepository.SaveAsync();
                return (int)res > 0;
            }catch(Exception) { throw new Exception(Constants.ClassOrTeacherIdNotExist); }

        }

        //public async Task SaveClassCertificates(SaveClassCertificateViewModel classCertificates)
        //{
        //    //string containerName = "classcertificates";
        //    string containerName = this._config.GetValue<string>("Container:ClassCourseContainer");

        //    foreach (var certificate in classCertificates.Certificates)
        //    {
        //        string certificateUrl = await _blobService.UploadFileAsync(certificate, containerName, false);

        //        string certificateName = certificate.FileName;

        //        var classCertificate = new ClassCertificate
        //        {
        //            CertificateUrl = certificateUrl,
        //            Name = certificateName,
        //            ClassId = classCertificates.ClassId
        //        };
        //        _classCertificateRepository.Insert(classCertificate);
        //        _classCertificateRepository.Save();
        //    }

        //}
        public async Task SaveClassCertificates(SaveClassCertificateViewModel classCertificates)
        {
            string certificateUrl = "";
            string containerName = this._config.GetValue<string>("Container:ClassCourseContainer");
            //var class = _classRepository.(classCertificates.ClassId);
            if (classCertificates.CertificateUrl == null || (classCertificates.CertificateUrl != null && classCertificates.CertificateImage != null))
            {
                certificateUrl = await _blobService.UploadFileAsync(classCertificates.CertificateImage, containerName, false);

            }
            else
            {
                certificateUrl = classCertificates.CertificateUrl;
            }

            //string certificateName = userCertificates.CertificateImage.FileName;

            if (classCertificates.CertificateId != null)
            {
                var editClassCertificate = _classCertificateRepository.GetById(classCertificates.CertificateId);
                editClassCertificate.Name = classCertificates.CertificateName;
                editClassCertificate.Provider = classCertificates.Provider;
                editClassCertificate.IssuedDate = classCertificates.IssuedDate;
                editClassCertificate.CertificateUrl = certificateUrl;
                editClassCertificate.Name = classCertificates.CertificateName;
                editClassCertificate.ClassId = classCertificates.ClassId;
                editClassCertificate.Description = classCertificates.Description;

                _classCertificateRepository.Update(editClassCertificate);
                _classCertificateRepository.Save();

            }
            else
            {
                var classCertificate = new ClassCertificate
                {
                    CertificateName = classCertificates.CertificateName,
                    Provider = classCertificates.Provider,
                    IssuedDate = classCertificates.IssuedDate,
                    CertificateUrl = certificateUrl,
                    Name = classCertificates.CertificateName,
                    ClassId = classCertificates.ClassId,
                    Description = classCertificates.Description
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

        //public async Task<ClassViewModel> GetClassByName(string className, string schoolName)
        //{
        //    var classes = await _classRepository.GetAll().Include(x => x.School).Where(x => x.ClassName.Replace(" ", "").ToLower() == className.Replace(" ", "").ToLower() && x.School.SchoolName.Replace(" ", "").ToLower() == schoolName.Replace(" ", "").ToLower()).FirstOrDefaultAsync();
        //    if (classes != null)
        //    {
        //        return _mapper.Map<ClassViewModel>(classes);
        //    }
        //    return null;
        //}

        public async Task<bool> IsClassNameExist(string className)
        {
            var result = await _classRepository.GetAll().Where(x => x.ClassName == className).FirstOrDefaultAsync();
            if (result != null)
            {
                return false;
            }
            return true;
        }

        public async Task<ClassViewModel> ConvertToCourse(string className)
        {
            Class classes = await _classRepository.GetAll().Include(x => x.School).Where(x => x.ClassName.Replace(" ", "").ToLower() == className).FirstOrDefaultAsync();
            if (classes != null)
            {
                classes.IsCourse = true;
                _classRepository.Update(classes);
                _classRepository.Save();
                //return true;
            }
            return _mapper.Map<ClassViewModel>(classes);
        }

        async Task SaveClassTags(IEnumerable<string> classTags, Guid classId)
        {
            foreach (var tagValue in classTags)
            {
                var classTag = new ClassTag
                {
                    ClassId = classId,
                    ClassTagValue = tagValue
                };

                _classTagRepository.Insert(classTag);
                _classTagRepository.Save();

            }
        }

        public async Task<List<ClassLikeViewModel>> GetLikesOnClass(Guid classId)
        {
            var likes = await _classLikeRepository.GetAll().Where(x => x.ClassId == classId).ToListAsync();
            return _mapper.Map<List<ClassLikeViewModel>>(likes);
        }
        public async Task<List<ClassViewsViewModel>> GetViewsOnClass(Guid classId)
        {
            var views = await _classViewsRepository.GetAll().Where(x => x.ClassId == classId).ToListAsync();
            return _mapper.Map<List<ClassViewsViewModel>>(views);

        }

        public async Task<List<ClassLikeViewModel>> LikeUnlikeClass(LikeUnlikeClassCourse model)
        {

            var userLike = await _classLikeRepository.GetAll().Where(x => x.UserId == model.UserId && x.ClassId == model.Id).FirstOrDefaultAsync();

            if (userLike != null)
            {
                _classLikeRepository.Delete(userLike.Id);
                _classLikeRepository.Save();
                var totalLikes = await _classLikeRepository.GetAll().Where(x => x.ClassId == model.Id).ToListAsync();
                return _mapper.Map<List<ClassLikeViewModel>>(totalLikes);
            }

            else
            {
                var like = new ClassLike
                {
                    UserId = model.UserId,
                    ClassId = model.Id,
                    DateTime = DateTime.UtcNow
                };

                _classLikeRepository.Insert(like);
                _classLikeRepository.Save();
                var totalLikes = await _classLikeRepository.GetAll().Where(x => x.ClassId == model.Id).ToListAsync();
                return _mapper.Map<List<ClassLikeViewModel>>(totalLikes);
            }
            return null;
        }

        public async Task<int> ClassView(ClassViewsViewModel model)
        {
            var isUserViewExist = await _classViewsRepository.GetAll().Where(x => x.UserId == model.UserId && x.ClassId == model.ClassId).FirstOrDefaultAsync();
            if (isUserViewExist == null)
            {
                var view = new ClassViews
                {
                    UserId = model.UserId,
                    ClassId = model.ClassId,
                };

                _classViewsRepository.Insert(view);
                _classViewsRepository.Save();
                return _classViewsRepository.GetAll().Where(x => x.ClassId == model.ClassId).Count();
            }
            return _classViewsRepository.GetAll().Where(x => x.ClassId == model.ClassId).Count();
        }


        public async Task<List<ClassCourseFilterViewModel>> GetClassFilters(string userId, Guid schoolId)
        {
            var classCourseFilters = await _classCourseFilterRepository.GetAll().OrderBy(x => x.DateTime).ToListAsync();

            var result = _mapper.Map<List<ClassCourseFilterViewModel>>(classCourseFilters);

            var userClassCourseFilters = await _userClassCourseFilterRepository.GetAll().Where(x => x.UserId == userId && x.SchoolId == schoolId).ToListAsync();


            foreach (var item in result)
            {
                var response = userClassCourseFilters.Where(x => x.ClassCourseFilterId == item.Id && x.UserId == userId && x.ClassCourseFilterType == ClassCourseFilterEnum.Class).FirstOrDefault();

                if (response != null)
                {
                    item.IsFilterActive = response.IsActive;
                }

            }


            result.First().NoOfAppliedFilters = userClassCourseFilters.Where(x => x.ClassCourseFilterType == ClassCourseFilterEnum.Class && x.IsActive).Count();
            return result;

        }

        public async Task SaveClassFilters(List<UserClassCourseFilterViewModel> model, string userId)
        {
            var result = await _userClassCourseFilterRepository.GetAll().ToListAsync();
            foreach (var item in model)
            {
                var isUserClassCourseFilterExist = result.Where(x => x.UserId == userId && x.ClassCourseFilterId == item.Id && x.ClassCourseFilterType == ClassCourseFilterEnum.Class && x.SchoolId == item.SchoolId).FirstOrDefault();

                if (isUserClassCourseFilterExist != null)
                {
                    isUserClassCourseFilterExist.IsActive = item.IsActive;
                    _userClassCourseFilterRepository.Update(isUserClassCourseFilterExist);
                    _userClassCourseFilterRepository.Save();
                }
                else
                {
                    var userClassCourseFilter = new UserClassCourseFilter
                    {
                        UserId = userId,
                        ClassCourseFilterId = item.Id,
                        IsActive = item.IsActive,
                        SchoolId = item.SchoolId,
                        ClassCourseFilterType = ClassCourseFilterEnum.Class
                    };

                    _userClassCourseFilterRepository.Insert(userClassCourseFilter);
                    _userClassCourseFilterRepository.Save();
                }
            }

            //await _schoolService.GetSchoolClassCourse(model.First().SchoolId,userId,1);

        }

        public async Task<ClassInfoForCertificateViewModel> GetClassInfoForCertificate(Guid classId)
        {
            ClassInfoForCertificateViewModel model = new ClassInfoForCertificateViewModel();

            var classes = await _classRepository.GetAll()
                .Include(x => x.School)
                .Include(x => x.CreatedBy)
                .Where(x => x.ClassId == classId).FirstOrDefaultAsync();

            model = _mapper.Map<ClassInfoForCertificateViewModel>(classes);

            model.Students = await GetClassStudents(classes.ClassId);
            return model;

        }

        public async Task<List<StudentViewModel>> GetClassStudents(Guid classId)
        {
            var classStudents = _classStudentRepository.GetAll()
                .Include(x => x.Student)
                .ThenInclude(x => x.CreatedBy)
                .Where(x => x.ClassId == classId).ToList();

            var result = _mapper.Map<List<StudentViewModel>>(classStudents.Select(x => x.Student));
            return result;
        }

        public async Task EnableDisableClass(Guid classId)
        {
            var classes = _classRepository.GetById(classId);
            classes.IsDisableByOwner = !classes.IsDisableByOwner;
            _classRepository.Update(classes);
            _classRepository.Save();

        }

        public async Task<IEnumerable<GlobalSearchViewModel>> ClassAndCoursesGlobalSearch(string searchString, int pageNumber, int pageSize)
        {
            var classes = await _classRepository.GetAll().Include(x => x.School).Where(x => x.ClassName.Contains(searchString)).Select(x => new GlobalSearchViewModel
            {
                Id = x.ClassId,
                Name = x.ClassName,
                SchoolName = x.School.SchoolName,
                Type = (int)PostAuthorTypeEnum.Class,
                Avatar = x.Avatar
            }).ToListAsync();


            var courses = await _courseRepository.GetAll().Where(x => x.CourseName.Contains(searchString)).Select(x => new GlobalSearchViewModel
            {
                Id = x.CourseId,
                Name = x.CourseName,
                SchoolName = x.School.SchoolName,
                Type = (int)PostAuthorTypeEnum.Course,
                Avatar = x.Avatar
            }).ToListAsync();

            var result = classes.Concat(courses).Skip((pageNumber - 1) * pageSize).Take(pageSize).OrderBy(x => x.Type).ToList();
            return result;


        }

        public async Task EnableDisableComments(Guid classId, bool isHideComments)
        {
            var classes = _classRepository.GetById(classId);

            classes.IsCommentsDisabled = isHideComments;
            _classRepository.Update(classes);
            _classRepository.Save();

        }

     
        public async Task<int?> ClassRating(ClassCourseRatingViewModel classRating)
        {
            //var classForRating = _courseRepository.GetById(courseRating.ClassId);
            //var userId = await _userManager.FindByIdAsync(courseRating.UserId);
            var totalLikes = await _classCourseRatingRepository.GetAll().Where(x => x.ClassId == classRating.ClassId && x.UserId == classRating.UserId).FirstOrDefaultAsync();
            if (totalLikes == null)
            {
                ClassCourseRating ratings = new ClassCourseRating();
                ratings.Rating = classRating.Rating;
                ratings.ClassId = classRating.ClassId;
                ratings.UserId = classRating.UserId;
                var classTotalLikes = await _classRepository.GetAll().Where(x => x.ClassId == classRating.ClassId).FirstOrDefaultAsync();
                var forAverageLikes = await _classCourseRatingRepository.GetAll().Where(x => x.ClassId == classRating.ClassId).ToListAsync();
                var totalRatingForClass = 0;
                var averageRatingForClass = 0;
                if (forAverageLikes.Count() != 0)
                {
                    foreach (var rating in forAverageLikes)
                    {
                        var allRating = rating.Rating;
                        totalRatingForClass += (int)allRating;
                    }
                    totalRatingForClass += (int)ratings.Rating;
                    averageRatingForClass = totalRatingForClass / (forAverageLikes.Count() + 1);
                }
                else
                {
                    averageRatingForClass = (int)ratings.Rating;
                }
                classTotalLikes.Rating = averageRatingForClass;
                classTotalLikes.IsRatedByUser = true;
                _classRepository.Update(classTotalLikes);
                _classRepository.Save();
                _classCourseRatingRepository.Insert(ratings);
                _classCourseRatingRepository.Save();
                return averageRatingForClass;
            }
            return null;
        }
    }
}
