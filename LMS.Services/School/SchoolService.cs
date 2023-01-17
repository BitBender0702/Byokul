using AutoMapper;
using LMS.Common.Enums;
using LMS.Common.ViewModels;
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
using Newtonsoft.Json;

namespace LMS.Services
{
    public class SchoolService : ISchoolService
    {
        public string containerName = "schoollogo";
        private readonly IMapper _mapper;
        private IGenericRepository<School> _schoolRepository;
        private IGenericRepository<SchoolCertificate> _schoolCertificateRepository;
        private IGenericRepository<SchoolTag> _schoolTagRepository;
        private IGenericRepository<Country> _countryRepository;
        private IGenericRepository<Specialization> _specializationRepository;
        private IGenericRepository<Language> _languageRepository;
        private IGenericRepository<SchoolUser> _schoolUserRepository;
        private IGenericRepository<SchoolFollower> _schoolFollowerRepository;
        private IGenericRepository<SchoolLanguage> _schoolLanguageRepository;
        private IGenericRepository<User> _userRepository;
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<Course> _courseRepository;
        private IGenericRepository<SchoolTeacher> _schoolTeacherRepository;
        private IGenericRepository<ClassTeacher> _classTeacherRepository;
        private IGenericRepository<CourseTeacher> _courseTeacherRepository;
        private IGenericRepository<ClassStudent> _classStudentRepository;
        private IGenericRepository<CourseStudent> _courseStudentRepository;
        private IGenericRepository<Post> _postRepository;
        private IGenericRepository<PostAttachment> _postAttachmentRepository;
        private IGenericRepository<PostTag> _postTagRepository;
        private IGenericRepository<ClassTag> _classTagRepository;
        private IGenericRepository<SchoolDefaultLogo> _schoolDefaultLogoRepository;
        private readonly UserManager<User> _userManager;
        private readonly IBlobService _blobService;
        private readonly IUserService _userService;
        private readonly IClassService _classService;
        private readonly ICourseService _courseService;
        public SchoolService(IMapper mapper, IGenericRepository<School> schoolRepository, IGenericRepository<SchoolCertificate> schoolCertificateRepository, IGenericRepository<SchoolTag> schoolTagRepository, IGenericRepository<Country> countryRepository, IGenericRepository<Specialization> specializationRepository, IGenericRepository<Language> languageRepository, IGenericRepository<SchoolUser> schoolUserRepository, IGenericRepository<SchoolFollower> schoolFollowerRepository, IGenericRepository<SchoolLanguage> schoolLanguageRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository, IGenericRepository<SchoolTeacher> schoolTeacherRepository, IGenericRepository<ClassTeacher> classTeacherRepository, IGenericRepository<CourseTeacher> courseTeacherRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<CourseStudent> courseStudentRepository, IGenericRepository<Post> postRepository, IGenericRepository<PostAttachment> postAttachmentRepository, IGenericRepository<PostTag> postTagRepository, IGenericRepository<SchoolDefaultLogo> schoolDefaultLogoRepository, UserManager<User> userManager, IBlobService blobService, IUserService userService, IGenericRepository<ClassTag> classTagRepository, IClassService classService, ICourseService courseService)
        {
            _mapper = mapper;
            _schoolRepository = schoolRepository;
            _schoolCertificateRepository = schoolCertificateRepository;
            _schoolTagRepository = schoolTagRepository;
            _countryRepository = countryRepository;
            _specializationRepository = specializationRepository;
            _languageRepository = languageRepository;
            _schoolUserRepository = schoolUserRepository;
            _schoolFollowerRepository = schoolFollowerRepository;
            _schoolLanguageRepository = schoolLanguageRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _schoolTeacherRepository = schoolTeacherRepository;
            _classTeacherRepository = classTeacherRepository;
            _courseTeacherRepository = courseTeacherRepository;
            _classStudentRepository = classStudentRepository;
            _courseStudentRepository = courseStudentRepository;
            _postRepository = postRepository;
            _postAttachmentRepository = postAttachmentRepository;
            _postTagRepository = postTagRepository;
            _schoolDefaultLogoRepository = schoolDefaultLogoRepository;
            _userManager = userManager;
            _blobService = blobService;
            _userService = userService;
            _classTagRepository = classTagRepository;
            _classService = classService;
            _courseService = courseService;
        }

        public async Task<Guid> SaveNewSchool(SchoolViewModel schoolViewModel, string createdById)
        {
            if (schoolViewModel.AvatarImage != null)
            {
                schoolViewModel.Avatar = await _blobService.UploadFileAsync(schoolViewModel.AvatarImage, containerName);
            }

            schoolViewModel.SchoolUrl = JsonConvert.DeserializeObject<string>(schoolViewModel.SchoolUrl);

            var school = new School
            {
                SchoolName = schoolViewModel.SchoolName,
                Avatar = schoolViewModel.Avatar,
                CoveredPhoto = schoolViewModel.CoveredPhoto,
                Description = schoolViewModel.Description,
                CreatedById = createdById,
                CreatedOn = DateTime.UtcNow,
                SpecializationId = schoolViewModel.SpecializationId,
                CountryId = schoolViewModel.CountryId,
                SchoolUrl = schoolViewModel.SchoolUrl,

            };

            _schoolRepository.Insert(school);
            _schoolRepository.Save();
            schoolViewModel.SchoolId = school.SchoolId;

            if (schoolViewModel.LanguageIds != null)
            {
                await SaveSchoolLanguages(schoolViewModel.LanguageIds, school.SchoolId);
            }

            await AddRoleForUser(createdById, "School Owner");

            return schoolViewModel.SchoolId;
        }

        public async Task SaveSchoolLanguages(IEnumerable<string> languageIds, Guid schoolId)
        {
            foreach (var language in languageIds)
            {
                var schoolLanguage = new SchoolLanguage
                {
                    SchoolId = schoolId,
                    LanguageId = new Guid(language)
                };

                _schoolLanguageRepository.Insert(schoolLanguage);
                try
                {
                    _schoolLanguageRepository.Save();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        async Task SaveSchoolTags(SchoolViewModel schoolViewModel, string createdById)
        {
            foreach (var tag in schoolViewModel.SchoolTags)
            {
                var schoolTag = new SchoolTag
                {
                    SchoolId = schoolViewModel.SchoolId,
                    SchoolTagValue = tag.SchoolTagValue,
                    CreatedById = createdById,
                    CreatedOn = DateTime.UtcNow,
                    IsDeleted = false
                };
                try
                {
                    _schoolTagRepository.Insert(schoolTag);
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                try
                {
                    _schoolTagRepository.Save();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        async Task UpdateSchoolTags(SchoolViewModel schoolViewModel, string createdById)
        {
            var schoolTags = _schoolTagRepository.GetAll().Where(x => x.SchoolId.ToString() == schoolViewModel.SchoolId.ToString()).ToList();
            if (schoolTags.Any())
            {
                _schoolTagRepository.DeleteAll(schoolTags);
            }

            await SaveSchoolTags(schoolViewModel, createdById);
        }

        async Task AddRoleForUser(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            var userroles = await _userManager.GetUsersInRoleAsync(role);
            if (userroles.Any(y => y.Id == user.Id))
            {
                if (userroles.Count != 0)
                {
                    var rsponse = userroles.Single(c => c.Id == userId);
                    if (rsponse == null)
                    {
                        await _userManager.AddToRoleAsync(user, role);
                    }
                }
                else
                {
                    await _userManager.AddToRoleAsync(user, role);
                }
            }
            else
            {
                await _userManager.AddToRoleAsync(user, role);
            }
        }

        public async Task SaveSchoolCertificates(SaveSchoolCertificateViewModel schoolCertificates)
        {
            string containerName = "schoolcertificates";

            foreach (var certificate in schoolCertificates.Certificates)
            {
                string certificateUrl = await _blobService.UploadFileAsync(certificate, containerName);

                string certificateName = certificate.FileName;

                var schoolCertificate = new SchoolCertificate
                {
                    CertificateUrl = certificateUrl,
                    Name = certificateName,
                    SchoolId = schoolCertificates.SchoolId
                };
                _schoolCertificateRepository.Insert(schoolCertificate);
                _schoolCertificateRepository.Save();
            }

        }

        public async Task DeleteSchoolCertificate(SchoolCertificateViewModel model)
        {
            var schoolCertificate = await _schoolCertificateRepository.GetAll().Where(x => x.SchoolId == model.SchoolId && x.CertificateId == model.CertificateId).FirstOrDefaultAsync();

            _schoolCertificateRepository.Delete(schoolCertificate.CertificateId);
            _schoolCertificateRepository.Save();

        }

        public async Task<SchoolUpdateViewModel> GetSchoolEditDetails(Guid schoolId)
        {
            var school = await _schoolRepository.GetAll().Where(x => x.SchoolId == schoolId)
                .Include(x => x.Accessibility)
                .Include(x => x.CreatedBy)
                .FirstOrDefaultAsync();

            var result = _mapper.Map<SchoolUpdateViewModel>(school);
            return result;
        }

        public async Task<Guid> UpdateSchool(SchoolUpdateViewModel schoolUpdateViewModel)
        {
            if (schoolUpdateViewModel.AvatarImage != null)
            {
                schoolUpdateViewModel.Avatar = await _blobService.UploadFileAsync(schoolUpdateViewModel.AvatarImage, containerName);
            }

            School school = _schoolRepository.GetById(schoolUpdateViewModel.SchoolId);
            school.SchoolName = schoolUpdateViewModel.SchoolName;
            school.Avatar = schoolUpdateViewModel.Avatar;
            school.SchoolSlogan = schoolUpdateViewModel.SchoolSlogan;
            school.Founded = schoolUpdateViewModel.Founded;
            school.SchoolEmail = schoolUpdateViewModel.SchoolEmail;
            school.AccessibilityId = schoolUpdateViewModel.AccessibilityId;
            school.Description = schoolUpdateViewModel.Description;

            _schoolRepository.Update(school);
            _schoolRepository.Save();

            //await AddRoleForUser(schoolUpdateViewModel.OwnerId, "School Owner");
            return school.SchoolId;
        }

        async Task UpdateSchoolLanguages(IEnumerable<string> languageIds, Guid schoolId)
        {
            var schoolLanguages = _schoolLanguageRepository.GetAll().Where(x => x.SchoolId == schoolId).ToList();

            if (schoolLanguages.Any())
            {
                _schoolLanguageRepository.DeleteAll(schoolLanguages);
            }
            await SaveSchoolLanguages(languageIds, schoolId);
        }




        public async Task<SchoolDetailsViewModel> GetSchoolById(string schoolName, string loginUserId)
        {
            SchoolDetailsViewModel model = new SchoolDetailsViewModel();

            if (schoolName != null)
            {
                var schoolLanguages = _schoolLanguageRepository.GetAll()
                    .Include(x => x.Language)
                    .Include(x => x.School)
                    .ThenInclude(x => x.Country)
                    .Include(x => x.School)
                    .ThenInclude(x => x.Specialization)
                    .Include(x => x.School)
                    .ThenInclude(x => x.CreatedBy)
                    .Where(x => x.School.SchoolName.Replace(" ", "").ToLower() == schoolName).ToList();

                var response = _mapper.Map<SchoolDetailsViewModel>(schoolLanguages.First().School);

                var languageViewModel = new List<LanguageViewModel>();

                foreach (var res in schoolLanguages)
                {
                    languageViewModel.Add(_mapper.Map<LanguageViewModel>(res.Language));
                }

                response.Languages = languageViewModel;
                response.SchoolCertificates = await GetCertificateBySchoolId(response.SchoolId);
                response.SchoolFollowers = await FollowerList(response.SchoolId);
                response.Classes = await GetClassesBySchoolId(response.SchoolId,loginUserId);
                response.Courses = await GetCoursesBySchoolId(response.SchoolId,loginUserId);
                response.Posts = await GetPostsBySchool(response.SchoolId, loginUserId);

                var classTeachers = await GetClassTeachersBySchoolId(response.SchoolId);
                var courseTeachers = await GetCourseTeachersBySchoolId(response.SchoolId);
                var schoolTeacher = await GetSchoolTeachersBySchoolId(response.SchoolId);

                var classCourseTeachers = classTeachers.Union(courseTeachers).DistinctBy(x => x.TeacherId).ToList();

                var schoolTeachers = classCourseTeachers.Union(schoolTeacher).DistinctBy(x => x.TeacherId).ToList();



                var classStudents = await GetClassStudentsBySchoolId(response.SchoolId);
                var courseStudents = await GetCourseStudentsBySchoolId(response.SchoolId);

                var schoolStudents = classStudents.Union(courseStudents).DistinctBy(x => x.StudentId).ToList();

                response.Teachers = schoolTeachers;
                response.Students = schoolStudents.Count();

                return response;
            }
            return null;
        }

        async Task<IEnumerable<SchoolCertificateViewModel>> GetCertificateBySchoolId(Guid schoolId)
        {
            var schoolCertificate = _schoolCertificateRepository.GetAll().Where(x => x.SchoolId == schoolId).ToList();
            var response = _mapper.Map<IEnumerable<SchoolCertificateViewModel>>(schoolCertificate);
            return response;
        }
        async Task<IEnumerable<SchoolTagViewModel>> GetTagsBySchoolId(Guid schoolId)
        {
            var schoolTags = _schoolTagRepository.GetAll().Where(x => x.SchoolId == schoolId).ToList();
            var response = _mapper.Map<IEnumerable<SchoolTagViewModel>>(schoolTags);
            return response;
        }

        public async Task<IEnumerable<SchoolViewModel>> GetAllSchools()
        {
            IEnumerable<SchoolViewModel> model = _schoolRepository.GetAll().Where(x => !x.IsDeleted).Select(x => new SchoolViewModel
            {
                SchoolId = x.SchoolId,
                SchoolName = x.SchoolName,
            });

            return model;
        }

        public async Task<IEnumerable<SchoolViewModel>> GetAllCertificates(IEnumerable<SchoolViewModel> model)
        {
            foreach (var item in model)
            {
                var schoolCertificate = await GetCertificateBySchoolId(item.SchoolId);
                item.SchoolCertificates = schoolCertificate;
            }
            return model;
        }

        public async Task DeleteSchoolById(Guid schoolId, string deletedByid)
        {
            School school = _schoolRepository.GetById(schoolId);
            school.IsDeleted = true;
            school.DeletedById = deletedByid;
            school.DeletedOn = DateTime.UtcNow;
            _schoolRepository.Update(school);
            _schoolRepository.Save();
        }

        public async Task<IEnumerable<SpecializationViewModel>> SpecializationList()
        {
            var specializationList = _specializationRepository.GetAll();
            var result = _mapper.Map<IEnumerable<SpecializationViewModel>>(specializationList);
            return result;
        }

        public async Task<IEnumerable<LanguageViewModel>> LanguageList()
        {
            var languageList = _languageRepository.GetAll();
            var result = _mapper.Map<IEnumerable<LanguageViewModel>>(languageList);
            return result;
        }

        public async Task<bool> FollowUnFollowSchool(FollowUnFollowViewModel model, string followerId)
        {
            var schoolFollowers = new List<SchoolFollower>();
            schoolFollowers = await _schoolFollowerRepository.GetAll().Where(x => x.SchoolId == new Guid(model.Id) && x.UserId == followerId).ToListAsync();

            if (schoolFollowers.Any(x => x.UserId == followerId && x.SchoolId == new Guid(model.Id)))
            {
                _schoolFollowerRepository.DeleteAll(schoolFollowers);
                _schoolFollowerRepository.Save();
            }
            //if (schoolFollowers.Count() != null)
            //{
            //    _schoolFollowerRepository.Delete(schoolFollowers.First().Id);
            //    _schoolFollowerRepository.Save(); 
            //    return false;
            //}


            else
            {
                var schoolFollower = new SchoolFollower
                {
                    SchoolId = new Guid(model.Id),
                    UserId = followerId,
                    IsBan = false
                };

                _schoolFollowerRepository.Insert(schoolFollower);
                _schoolFollowerRepository.Save();
                return true;
            }
            return false;
        }

        public async Task<IEnumerable<SchoolFollowerViewModel>> FollowerList(Guid schoolId)
        {
            var followerList = await _schoolFollowerRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();
            return _mapper.Map<IEnumerable<SchoolFollowerViewModel>>(followerList);

        }

        public async Task SaveSchoolUser(SchoolUserViewModel schoolUserViewModel)
        {
            var schoolUser = new SchoolUser
            {
                SchoolId = schoolUserViewModel.SchoolId,
                UserId = schoolUserViewModel.UserId,
                AccessLevel = schoolUserViewModel.AccessLevel
            };

            _schoolUserRepository.Insert(schoolUser);
            _schoolUserRepository.Save();

            await AddRoleForUser(schoolUser.UserId, "Teacher");
        }

        public async Task<IEnumerable<ClassViewModel>> GetClassesBySchoolId(Guid schoolId,string loginUserId)
        {
            var classList = await _classRepository.GetAll().Include(x => x.Accessibility).Include(x => x.ServiceType).Where(x => x.SchoolId == schoolId && !x.IsEnable && !x.IsDeleted).ToListAsync();

            var result = _mapper.Map<List<ClassViewModel>>(classList);
            var tagList = await _classTagRepository.GetAll().ToListAsync();
            foreach (var item in result)
            {
                item.ClassTags = tagList.Where(x => x.ClassId == item.ClassId).Select(x => x.ClassTagValue).ToList();

                item.ClassLike = await _classService.GetLikesOnClass(item.ClassId);
                item.ClassViews = await _classService.GetViewsOnClass(item.ClassId);

                if (item.ClassLike.Any(x => x.UserId == loginUserId && x.ClassId == item.ClassId))
                {
                    item.IsClassLikedByCurrentUser = true;
                }
                else
                {
                    item.IsClassLikedByCurrentUser = false;
                }
            }

           
            return result;

        }

        public async Task<IEnumerable<CourseViewModel>> GetCoursesBySchoolId(Guid schoolId,string loginUserId)
        {
            var courseList = await _courseRepository.GetAll().Where(x => x.SchoolId == schoolId && !x.IsEnable && !x.IsDeleted).ToListAsync();

            var result = _mapper.Map<List<CourseViewModel>>(courseList);
            var tagList = await _classTagRepository.GetAll().ToListAsync();
            foreach (var item in result)
            {
                item.CourseTags = tagList.Where(x => x.ClassId == item.CourseId).Select(x => x.ClassTagValue).ToList();

                item.CourseLike = await _courseService.GetLikesOnCourse(item.CourseId);
                item.CourseViews = await _courseService.GetViewsOnCourse(item.CourseId);

                if (item.CourseLike.Any(x => x.UserId == loginUserId && x.CourseId == item.CourseId))
                {
                    item.IsCourseLikedByCurrentUser = true;
                }
                else
                {
                    item.IsCourseLikedByCurrentUser = false;
                }
            }
            return result;

        }
        public async Task<IEnumerable<TeacherViewModel>> GetClassTeachersBySchoolId(Guid schoolId)
        {
            var classList = await _classRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();

            var classTeachersList = await _classTeacherRepository.GetAll().Include(x => x.Teacher).Distinct().ToListAsync();

            var requiredClassList = classTeachersList.Where(x => classList.Any(y => y.ClassId == x.ClassId)).DistinctBy(x => x.TeacherId);

            var classTeachers = new List<Teacher>();
            foreach (var classTeacher in requiredClassList)
            {
                classTeachers.Add(classTeacher.Teacher);
            }

            var result = _mapper.Map<List<TeacherViewModel>>(classTeachers);
            return result;

        }

        public async Task<IEnumerable<TeacherViewModel>> GetCourseTeachersBySchoolId(Guid schoolId)
        {
            var courseList = await _courseRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();

            var courseTeachersList = await _courseTeacherRepository.GetAll().Include(x => x.Teacher).Distinct().ToListAsync();

            var requiredCourseList = courseTeachersList.Where(x => courseList.Any(y => y.CourseId == x.CourseId)).DistinctBy(x => x.TeacherId);

            var courseTeachers = new List<Teacher>();
            foreach (var courseTeacher in requiredCourseList)
            {
                courseTeachers.Add(courseTeacher.Teacher);
            }

            var result = _mapper.Map<List<TeacherViewModel>>(courseTeachers);
            return result;

        }

        public async Task<IEnumerable<TeacherViewModel>> GetSchoolTeachersBySchoolId(Guid schoolId)
        {
            var schoolList = await _schoolRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();

            var schoolTeachersList = await _schoolTeacherRepository.GetAll().Include(x => x.Teacher).Distinct().ToListAsync();

            var requiredSchoolList = schoolTeachersList.Where(x => schoolList.Any(y => y.SchoolId == x.SchoolId)).DistinctBy(x => x.TeacherId);

            var schoolTeachers = new List<Teacher>();
            foreach (var schoolTeacher in requiredSchoolList)
            {
                schoolTeachers.Add(schoolTeacher.Teacher);
            }

            var result = _mapper.Map<List<TeacherViewModel>>(schoolTeachers);
            return result;

        }

        public async Task<IEnumerable<StudentViewModel>> GetClassStudentsBySchoolId(Guid schoolId)
        {
            var classList = await _classRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();

            var classStudentsList = await _classStudentRepository.GetAll().Include(x => x.Student).Distinct().ToListAsync();

            var requiredClassList = classStudentsList.Where(x => classList.Any(y => y.ClassId == x.ClassId)).DistinctBy(x => x.StudentId);

            var classStudents = new List<Student>();
            foreach (var classStudent in requiredClassList)
            {
                classStudents.Add(classStudent.Student);
            }

            var result = _mapper.Map<List<StudentViewModel>>(classStudents);
            return result;

        }

        public async Task<IEnumerable<StudentViewModel>> GetCourseStudentsBySchoolId(Guid schoolId)
        {
            var courseList = await _courseRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();

            var courseStudentsList = await _courseStudentRepository.GetAll().Include(x => x.Student).Distinct().ToListAsync();

            var requiredCourseList = courseStudentsList.Where(x => courseList.Any(y => y.CourseId == x.CourseId)).DistinctBy(x => x.StudentId);

            var courseStudents = new List<Student>();
            foreach (var courseStudent in requiredCourseList)
            {
                courseStudents.Add(courseStudent.Student);
            }

            var result = _mapper.Map<List<StudentViewModel>>(courseStudents);
            return result;

        }

        public async Task<IEnumerable<PostDetailsViewModel>> GetPostsBySchool(Guid schoolId, string loginUserId)
        {
            var courseList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == schoolId).OrderByDescending(x => x.IsPinned).ToListAsync();

            var result = _mapper.Map<List<PostDetailsViewModel>>(courseList);

            foreach (var post in result)
            {
                post.PostAttachments = await GetAttachmentsByPostId(post.Id, loginUserId);
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

            //var user = await _userManager.Users.Where(x => x.Id == loginUserId).FirstOrDefaultAsync();
            //var role = await _userManager.GetRolesAsync(user);

            //if (role.Any(x => x.Contains("School Owner")))
            //{
            //    foreach (var post in result)
            //    {
            //        var postDetail = await _postRepository.GetAll().Where(x => x.CreatedById == post.CreatedBy).FirstOrDefaultAsync();

            //        post.Author = _mapper.Map<AuthorViewModel>(postDetail.CreatedBy);
            //    }
            //}

            //else
            //{
            //    foreach (var post in result)
            //    {
            //        var author = await _schoolRepository.GetAll().Where(x => x.SchoolId == post.AuthorId).FirstOrDefaultAsync();

            //        post.Author = _mapper.Map<AuthorViewModel>(author);
            //    }
            //}

            //foreach (var post in result)
            //{
            //    var owner = await _userManager.Users.Where(x => x.Id == post.CreatedBy).FirstOrDefaultAsync();
            //    post.Owner = _mapper.Map<OwnerViewModel>(owner);
            //}

            return result;
        }

        public async Task<IEnumerable<PostAttachmentViewModel>> GetAttachmentsByPostId(Guid postId,string loginUserId)
        {
            var attacchmentList = await _postAttachmentRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.PostId == postId).OrderByDescending(x => x.IsPinned).ToListAsync();

            var result = _mapper.Map<List<PostAttachmentViewModel>>(attacchmentList);
            return result;
        }


        public async Task<IEnumerable<PostTagViewModel>> GetTagsByPostId(Guid postId)
        {
            var tagList = await _postTagRepository.GetAll().Where(x => x.PostId == postId).ToListAsync();

            var result = _mapper.Map<List<PostTagViewModel>>(tagList);
            return result;
        }

        public async Task SaveSchoolDefaultLogo(string logoUrl)
        {
            var schoolDefaultLogo = new SchoolDefaultLogo
            {
                LogoUrl = logoUrl,
            };

            _schoolDefaultLogoRepository.Insert(schoolDefaultLogo);
            _schoolDefaultLogoRepository.Save();
        }

        public async Task<IEnumerable<SchoolDefaultLogoViewmodel>> GetSchoolDefaultLogos()
        {
            var logoList = _schoolDefaultLogoRepository.GetAll();
            var result = _mapper.Map<IEnumerable<SchoolDefaultLogoViewmodel>>(logoList);
            return result;
        }


        public async Task DeleteSchoolLanguage(SchoolLanguageViewModel model)
        {
            var schoolLanguage = await _schoolLanguageRepository.GetAll().Where(x => x.SchoolId == model.SchoolId && x.LanguageId == model.LanguageId).FirstOrDefaultAsync();

            _schoolLanguageRepository.Delete(schoolLanguage.Id);
            _schoolLanguageRepository.Save();

        }

        public async Task SaveSchoolTeachers(SaveSchoolTeacherViewModel model)
        {
            foreach (var teacherId in model.TeacherIds)
            {
                var schoolTeacher = new SchoolTeacher
                {
                    SchoolId = new Guid(model.SchoolId),
                    TeacherId = new Guid(teacherId)
                };

                _schoolTeacherRepository.Insert(schoolTeacher);
                _schoolTeacherRepository.Save();
            }
        }

        public async Task DeleteSchoolTeacher(SchoolTeacherViewModel model)
        {
            var classTeachers = new List<ClassTeacher>();
            var schoolTeacher = await _schoolTeacherRepository.GetAll().Where(x => x.SchoolId == model.SchoolId && x.TeacherId == model.TeacherId).FirstOrDefaultAsync();

            if (schoolTeacher != null)
            {
                _schoolTeacherRepository.Delete(schoolTeacher.Id);
                _schoolTeacherRepository.Save();
            }

            var classes = await _classRepository.GetAll().Where(x => x.SchoolId == model.SchoolId).ToListAsync();

            classTeachers = await _classTeacherRepository.GetAll().Include(x => x.Teacher).Where(x => x.TeacherId == model.TeacherId).ToListAsync();


            var requiredClassTeacher = classTeachers.Where(x => classes.Any(y => y.ClassId == x.ClassId && x.TeacherId == model.TeacherId)).FirstOrDefault();

            //var requiredTeacher = classTeachers.Where(x => x.TeacherId == model.TeacherId).FirstOrDefault();
            if (requiredClassTeacher != null)
            {
                _classTeacherRepository.Delete(requiredClassTeacher.Id);
                _classTeacherRepository.Save();
            }




            var courses = await _courseRepository.GetAll().Where(x => x.SchoolId == model.SchoolId).ToListAsync();

            var courseTeachers = await _courseTeacherRepository.GetAll().Where(x => x.TeacherId == model.TeacherId).ToListAsync();

            var requiredCourseTeacher = courseTeachers.Where(x => courses.Any(y => y.CourseId == x.CourseId && x.TeacherId == model.TeacherId)).FirstOrDefault();

            if (requiredCourseTeacher != null)
            {
                _courseTeacherRepository.Delete(requiredCourseTeacher.Id);
                _courseTeacherRepository.Save();
            }



        }

        public async Task<SchoolViewModel> GetBasicSchoolInfo(Guid schoolId)
        {
            var school = await _schoolRepository.GetAll().Where(x => x.SchoolId == schoolId).FirstOrDefaultAsync();

            var response = _mapper.Map<SchoolViewModel>(school);
            return response;

        }

        public async Task<List<SchoolFollowerViewModel>> GetSchoolFollowers(Guid schoolId)
        {
            var followerList = await _schoolFollowerRepository.GetAll().Include(x => x.User).Where(x => x.SchoolId == schoolId).ToListAsync();

            var response = _mapper.Map<List<SchoolFollowerViewModel>>(followerList);
            return response;

        }

        public async Task<bool> IsSchoolNameExist(string schoolName)
        {
            var result = await _schoolRepository.GetAll().Where(x => x.SchoolName == schoolName).FirstOrDefaultAsync();
            if (result != null)
            {
                return false;
            }
            return true;
        }

        public async Task<SchoolViewModel> GetSchoolByName(string schoolName)
        {
            var school = await _schoolRepository.GetAll().Where(x => x.SchoolName.Replace(" ", "").ToLower() == schoolName.Replace(" ", "").ToLower()).FirstOrDefaultAsync();
            if (school != null)
            {
                return _mapper.Map<SchoolViewModel>(school);
            }
            return null;
        }

        public async Task<IOrderedEnumerable<CombineClassCourseViewModel>> GetSchoolClassCourse(Guid schoolId,string userId)
        {
            var classes = await GetClassesBySchoolId(schoolId, userId);
            var courses = await GetCoursesBySchoolId(schoolId, userId);

            var model = new List<CombineClassCourseViewModel>();

            foreach (var classDetails in classes)
            {
                var item = new CombineClassCourseViewModel();
                item.Id = classDetails.ClassId;
                item.Avatar = classDetails.Avatar;
                item.Accessibility = classDetails.Accessibility;
                item.ServiceType = classDetails.ServiceType;
                item.Description = classDetails.Description;
                item.Name = classDetails.ClassName;
                item.Price = classDetails.Price;
                item.Rating = classDetails.Rating;
                item.CreatedOn = classDetails.CreatedOn;
                item.Type = ClassCourseEnum.Class;
                item.IsPinned = classDetails.IsPinned;
                item.StartDate = classDetails.StartDate;
                item.EndDate = classDetails.EndDate;
                item.ThumbnailUrl = classDetails.ThumbnailUrl;
                item.Tags = classDetails.ClassTags;
                item.IsLikedByCurrentUser = classDetails.IsClassLikedByCurrentUser;
                item.ClassLikes = classDetails.ClassLike;
                item.ClassViews = classDetails.ClassViews;

                model.Add(item);
            }

            foreach (var courseDetails in courses)
            {
                var item = new CombineClassCourseViewModel();
                item.Id = courseDetails.CourseId;
                item.Avatar = courseDetails.Avatar;
                item.Accessibility = courseDetails.Accessibility;
                item.ServiceType = courseDetails.ServiceType;
                item.Description = courseDetails.Description;
                item.Name = courseDetails.CourseName;
                item.Price = courseDetails.Price;
                item.Rating = courseDetails.Rating;
                item.CreatedOn = courseDetails.CreatedOn;
                item.Type = ClassCourseEnum.Course;
                item.IsPinned = courseDetails.IsPinned;
                item.ThumbnailUrl = courseDetails.ThumbnailUrl;
                item.Tags = courseDetails.CourseTags;
                item.IsLikedByCurrentUser = courseDetails.IsCourseLikedByCurrentUser;
                item.CourseLikes = courseDetails.CourseLike;
                item.CourseViews = courseDetails.CourseViews;

                model.Add(item);
            }

            var response = model.OrderByDescending(x => x.IsPinned);
            return response;

        }

        public async Task<bool> PinUnpinClassCourse(Guid id, ClassCourseEnum type, bool isPinned)
        {
            if (type == ClassCourseEnum.Class)
            {
                var classDetail = await _classRepository.GetAll().Where(x => x.ClassId == id).FirstOrDefaultAsync();

                if (classDetail != null)
                {
                    classDetail.IsPinned = isPinned;
                    _classRepository.Update(classDetail);
                    _classRepository.Save();
                    return true;
                }
            }
            if (type == ClassCourseEnum.Course)
            {
                var courseDetail = await _courseRepository.GetAll().Where(x => x.CourseId == id).FirstOrDefaultAsync();

                if (courseDetail != null)
                {
                    courseDetail.IsPinned = isPinned;
                    _courseRepository.Update(courseDetail);
                    _courseRepository.Save();
                    return true;
                }

            }
            return false;
        }
    }
}
