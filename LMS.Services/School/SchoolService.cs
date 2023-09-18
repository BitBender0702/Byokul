using AutoMapper;
using iText.Kernel.Geom;
using LMS.Common.Enums;
using LMS.Common.ViewModels;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.Iyizico;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Student;
using LMS.Common.ViewModels.Teacher;
using LMS.Data.Entity;
using LMS.Data.Entity.Common;
using LMS.DataAccess.Repository;
using LMS.Services.Blob;
using LMS.Services.Iyizico;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
//using System.Data.Entity;
using System.Data.SqlTypes;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using Country = LMS.Data.Entity.Country;

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
        private IGenericRepository<CourseTag> _courseTagRepository;
        private IGenericRepository<SchoolDefaultLogo> _schoolDefaultLogoRepository;
        private IGenericRepository<UserClassCourseFilter> _userClassCourseFilterRepository;
        private IGenericRepository<UserSharedPost> _userSharedPostRepository;
        private IGenericRepository<SavedClassCourse> _savedClassCourseRepository;
        private IGenericRepository<SharedClassCourse> _sharedClassCourseRepository;
        private IGenericRepository<SavedPost> _savedPostRepository;
        private IGenericRepository<UserPermission> _userPermissionRepository;
        private readonly UserManager<User> _userManager;
        private IGenericRepository<ClassViews> _ClassViewsRepository;
        private IGenericRepository<CourseViews> _CourseViewsRepository;
        private readonly IBlobService _blobService;
        private readonly IUserService _userService;
        private readonly IClassService _classService;
        private readonly ICourseService _courseService;
        private readonly IIyizicoService _iyizicoService;
        private IConfiguration _config;


        private IGenericRepository<Notification> _notificationRepository;


        public SchoolService(IMapper mapper, IGenericRepository<School> schoolRepository, IGenericRepository<SchoolCertificate> schoolCertificateRepository, IGenericRepository<SchoolTag> schoolTagRepository, IGenericRepository<Country> countryRepository, IGenericRepository<Specialization> specializationRepository, IGenericRepository<Language> languageRepository, IGenericRepository<SchoolUser> schoolUserRepository, IGenericRepository<SchoolFollower> schoolFollowerRepository, IGenericRepository<SchoolLanguage> schoolLanguageRepository, IGenericRepository<User> userRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository, IGenericRepository<SchoolTeacher> schoolTeacherRepository, IGenericRepository<ClassTeacher> classTeacherRepository, IGenericRepository<CourseTeacher> courseTeacherRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<CourseStudent> courseStudentRepository, IGenericRepository<Post> postRepository, IGenericRepository<PostAttachment> postAttachmentRepository, IGenericRepository<PostTag> postTagRepository, IGenericRepository<SchoolDefaultLogo> schoolDefaultLogoRepository, IGenericRepository<UserClassCourseFilter> userClassCourseFilterRepository, IGenericRepository<UserSharedPost> userSharedPostRepository, IGenericRepository<SavedClassCourse> savedClassCourseRepository, IGenericRepository<SavedPost> savedPostRepository, IGenericRepository<SharedClassCourse> sharedClassCourseRepository, IGenericRepository<UserPermission> userPermissionRepository, UserManager<User> userManager, IGenericRepository<ClassViews> ClassViewsRepository, IGenericRepository<CourseViews> CourseViewsRepository, IBlobService blobService, IUserService userService, IGenericRepository<ClassTag> classTagRepository, IGenericRepository<CourseTag> courseTagRepository, IClassService classService, ICourseService courseService, IConfiguration config, IIyizicoService iyizicoService, IGenericRepository<Notification> notificationRepository)
        {
            _mapper = mapper;
            _schoolRepository = schoolRepository;
            _schoolCertificateRepository = schoolCertificateRepository;
            _schoolTagRepository = schoolTagRepository;
            _countryRepository = countryRepository;
            _specializationRepository = specializationRepository;
            _languageRepository = languageRepository;
            _schoolUserRepository = schoolUserRepository;
            _userRepository = userRepository;
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
            _userClassCourseFilterRepository = userClassCourseFilterRepository;
            _savedClassCourseRepository = savedClassCourseRepository;
            _sharedClassCourseRepository = sharedClassCourseRepository;
            _savedPostRepository = savedPostRepository;
            _userManager = userManager;
            _ClassViewsRepository = ClassViewsRepository;
            _CourseViewsRepository = CourseViewsRepository;
            _userPermissionRepository = userPermissionRepository;
            _blobService = blobService;
            _userService = userService;
            _classTagRepository = classTagRepository;
            _courseTagRepository = courseTagRepository;
            _userSharedPostRepository = userSharedPostRepository;
            _classService = classService;
            _courseService = courseService;
            _config = config;
            _iyizicoService = iyizicoService;
            _notificationRepository = notificationRepository;
        }

        public async Task<SchoolViewModel> SaveNewSchool(SchoolViewModel schoolViewModel, string createdById)
        {
            schoolViewModel.SubscriptionDetails = JsonConvert.DeserializeObject<BuySchoolSubscriptionViewModel>(schoolViewModel.SubscriptionDetailsJson);

            if (schoolViewModel.AvatarImage != null)
            {
                schoolViewModel.Avatar = await _blobService.UploadFileAsync(schoolViewModel.AvatarImage, containerName, false);
                schoolViewModel.IsDefaultAvatar = false;
            }
            else
            {
                schoolViewModel.IsDefaultAvatar = true;
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
                CountryName = schoolViewModel.CountryName,
                SchoolUrl = schoolViewModel.SchoolUrl,
                PhoneNumber = schoolViewModel.PhoneNumber,
                SchoolSlogan = schoolViewModel.SchoolSlogan,
                Founded = schoolViewModel.Founded,
                AccessibilityId = schoolViewModel.AccessibilityId,
                SchoolEmail = schoolViewModel.SchoolEmail,
                AvailableStorageSpace = 100,
                IsDefaultAvatar = schoolViewModel.IsDefaultAvatar

            };

            _schoolRepository.Insert(school);
            _schoolRepository.Save();
            schoolViewModel.SchoolId = school.SchoolId;
            if (schoolViewModel.LanguageIds != null)
            {
                await SaveSchoolLanguages(schoolViewModel.LanguageIds, school.SchoolId);
            }

            await AddRoleForUser(createdById, "School Owner");

            //var user = _userRepository.GetById(createdById);
            //if (user.CountryName == Constants.Turkey)
            //{
            //    var subscriptionResponse = await _iyizicoService.BuySchoolSubscription(schoolViewModel.SubscriptionDetails, createdById, school.SchoolId);


            //    if (subscriptionResponse.SubscriptionMessage != Constants.Success)
            //    {
            //        schoolViewModel.SubscriptionDetails.SubscriptionMessage = subscriptionResponse.SubscriptionMessage;
            //        return schoolViewModel;
            //    }

            //    schoolViewModel.SubscriptionDetails.SubscriptionMessage = Constants.Success;
            //}

            //else
            //{
            var subscriptionResponse = await _iyizicoService.BuySchoolSubscription(schoolViewModel.SubscriptionDetails, createdById, school.SchoolId);
            schoolViewModel.SubscriptionDetails.IsInternationalUser = true;
            schoolViewModel.SubscriptionDetails.SubscriptionMessage = subscriptionResponse;
            //}
            return schoolViewModel;
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

        //public async Task SaveSchoolCertificates(SaveSchoolCertificateViewModel schoolCertificates)
        //{
        //    //string containerName = "schoolcertificates";
        //    string containerName = this._config.GetValue<string>("Container:SchoolContainer");

        //    foreach (var certificate in schoolCertificates.Certificates)
        //    {
        //        string certificateUrl = await _blobService.UploadFileAsync(certificate, containerName, false);

        //        string certificateName = certificate.FileName;

        //        var schoolCertificate = new SchoolCertificate
        //        {
        //            CertificateUrl = certificateUrl,
        //            Name = certificateName,
        //            SchoolId = schoolCertificates.SchoolId
        //        };
        //        _schoolCertificateRepository.Insert(schoolCertificate);
        //        _schoolCertificateRepository.Save();
        //    }

        //}

        public async Task SaveSchoolCertificates(SaveSchoolCertificateViewModel schoolCertificates)
        {
            string certificateUrl = "";
            string containerName = this._config.GetValue<string>("Container:SchoolContainer");
            var school = _schoolRepository.GetById(schoolCertificates.SchoolId);
            if (schoolCertificates.CertificateUrl == null || (schoolCertificates.CertificateUrl != null && schoolCertificates.CertificateImage != null))
            {
                certificateUrl = await _blobService.UploadFileAsync(schoolCertificates.CertificateImage, containerName, false);

            }
            else
            {
                certificateUrl = schoolCertificates.CertificateUrl;
            }

            //string certificateName = userCertificates.CertificateImage.FileName;

            if (schoolCertificates.CertificateId != null)
            {
                var editSchoolCertificate = _schoolCertificateRepository.GetById(schoolCertificates.CertificateId);
                editSchoolCertificate.CertificateName = schoolCertificates.CertificateName;
                editSchoolCertificate.Provider = schoolCertificates.Provider;
                editSchoolCertificate.IssuedDate = schoolCertificates.IssuedDate;
                editSchoolCertificate.CertificateUrl = certificateUrl;
                editSchoolCertificate.Name = schoolCertificates.CertificateName;
                editSchoolCertificate.SchoolId = schoolCertificates.SchoolId;
                editSchoolCertificate.Description = schoolCertificates.Description;

                _schoolCertificateRepository.Update(editSchoolCertificate);
                _schoolCertificateRepository.Save();

            }
            else
            {
                var schoolCertificate = new SchoolCertificate
                {
                    CertificateName = schoolCertificates.CertificateName,
                    Provider = schoolCertificates.Provider,
                    IssuedDate = schoolCertificates.IssuedDate,
                    CertificateUrl = certificateUrl,
                    Name = schoolCertificates.CertificateName,
                    SchoolId = schoolCertificates.SchoolId,
                    Description = schoolCertificates.Description
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

        public async Task<SchoolUpdateViewModel> UpdateSchool(SchoolUpdateViewModel schoolUpdateViewModel)
        {
            if (schoolUpdateViewModel.AvatarImage != null)
            {
                schoolUpdateViewModel.Avatar = await _blobService.UploadFileAsync(schoolUpdateViewModel.AvatarImage, containerName, false);
            }

            School school = _schoolRepository.GetById(schoolUpdateViewModel.SchoolId);
            school.SchoolName = schoolUpdateViewModel.SchoolName;
            school.Avatar = schoolUpdateViewModel.Avatar;
            school.SchoolSlogan = schoolUpdateViewModel.SchoolSlogan;
            school.Founded = schoolUpdateViewModel.Founded;
            school.SchoolEmail = schoolUpdateViewModel.SchoolEmail;
            school.AccessibilityId = schoolUpdateViewModel.AccessibilityId;
            school.Description = schoolUpdateViewModel.Description;
            school.CountryName = schoolUpdateViewModel.CountryName;
            school.PhoneNumber = schoolUpdateViewModel.PhoneNumber;

            _schoolRepository.Update(school);
            _schoolRepository.Save();

            schoolUpdateViewModel.SchoolId = school.SchoolId;
            //await AddRoleForUser(schoolUpdateViewModel.OwnerId, "School Owner");
            return schoolUpdateViewModel;
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




        public async Task<SchoolDetailsViewModel> GetSchoolByName(string schoolName, string loginUserId)
        {
            SchoolDetailsViewModel model = new SchoolDetailsViewModel();

            if (schoolName != null)
            {
                var data = Encoding.UTF8.GetBytes(schoolName);
                //schoolName = System.Web.HttpUtility.UrlEncode(schoolName, Encoding.GetEncoding("iso-8859-1")).Replace("%3f", "").Replace("+", "").Replace(".", "").ToLower();
                var schoolLanguages = await _schoolLanguageRepository.GetAll()
                .Include(x => x.Language)
                .Include(x => x.School)
                .ThenInclude(x => x.Country)
                .Include(x => x.School)
                .ThenInclude(x => x.Specialization)
                .Include(x => x.School)
                .ThenInclude(x => x.CreatedBy).ToListAsync();

                var singleLanguage = schoolLanguages.Where(x => Encoding.UTF8.GetBytes(x.School.SchoolName.Replace(" ", "").Replace("+", "").Replace(".", "").ToLower()).SequenceEqual(data)).ToList();
                //schoolLanguages = schoolLanguages.Where(x => ((x.School.SchoolName.Replace(" ", "").Replace("+", "").Replace(".", "").ToLower()) == schoolName) && !x.School.IsDeleted).ToList();
                if (!singleLanguage.Any())
                {
                    var newSchoolName = System.Web.HttpUtility.UrlEncode(schoolName, Encoding.GetEncoding("iso-8859-1")).Replace("%3f", "").Replace("+", "").Replace(".", "").ToLower();
                    singleLanguage = schoolLanguages.Where(x => (System.Web.HttpUtility.UrlEncode(x.School.SchoolName.Replace(" ", "").Replace("+", "").Replace(".", "").ToLower(), Encoding.GetEncoding("iso-8859-7")) == newSchoolName)).ToList();
                }


                var response = _mapper.Map<SchoolDetailsViewModel>(singleLanguage.First().School);

                var languageViewModel = new List<LanguageViewModel>();

                foreach (var res in singleLanguage)
                {
                    languageViewModel.Add(_mapper.Map<LanguageViewModel>(res.Language));
                }

                response.Languages = languageViewModel;
                response.SchoolCertificates = await GetCertificateBySchoolId(response.SchoolId);
                response.SchoolFollowers = await FollowerList(response.SchoolId);
                //response.Classes = await GetClassesBySchoolId(response.SchoolId,loginUserId);
                //response.Courses = await GetCoursesBySchoolId(response.SchoolId,loginUserId);
                response.Posts = await GetPostsBySchool(response.SchoolId, loginUserId);
                response.Reels = await GetReelsBySchool(response.SchoolId, loginUserId);

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

                response.NoOfAppliedClassFilters = await _userClassCourseFilterRepository.GetAll().Where(x => x.UserId == loginUserId && x.ClassCourseFilterType == ClassCourseFilterEnum.Class && x.SchoolId == response.SchoolId && x.IsActive).CountAsync();

                response.NoOfAppliedCourseFilters = await _userClassCourseFilterRepository.GetAll().Where(x => x.UserId == loginUserId && x.ClassCourseFilterType == ClassCourseFilterEnum.Course && x.SchoolId == response.SchoolId && x.IsActive).CountAsync();

                return response;
            }
            return null;
        }

        public async Task<SchoolDetailsViewModel> GetSchoolById(Guid schoolId, string loginUserId)
        {
            SchoolDetailsViewModel model = new SchoolDetailsViewModel();

            //if (schoolName != null)
            //{
            //    schoolName = System.Web.HttpUtility.UrlEncode(schoolName, Encoding.GetEncoding("iso-8859-7")).Replace("%3f", "").ToLower();

            var schoolLanguages = await _schoolLanguageRepository.GetAll()
            .Include(x => x.Language)
            .Include(x => x.School)
            .ThenInclude(x => x.Country)
            .Include(x => x.School)
            .ThenInclude(x => x.Specialization)
            .Include(x => x.School)
            .ThenInclude(x => x.CreatedBy)
            .Where(x => x.School.SchoolId == schoolId).ToListAsync();


            var response = _mapper.Map<SchoolDetailsViewModel>(schoolLanguages.First().School);

            var languageViewModel = new List<LanguageViewModel>();

            foreach (var res in schoolLanguages)
            {
                languageViewModel.Add(_mapper.Map<LanguageViewModel>(res.Language));
            }

            response.Languages = languageViewModel;
            response.SchoolCertificates = await GetCertificateBySchoolId(response.SchoolId);
            response.SchoolFollowers = await FollowerList(response.SchoolId);
            //response.Classes = await GetClassesBySchoolId(response.SchoolId,loginUserId);
            //response.Courses = await GetCoursesBySchoolId(response.SchoolId,loginUserId);
            response.Posts = await GetPostsBySchool(response.SchoolId, loginUserId);
            response.Reels = await GetReelsBySchool(response.SchoolId, loginUserId);

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

            response.NoOfAppliedClassFilters = await _userClassCourseFilterRepository.GetAll().Where(x => x.UserId == loginUserId && x.ClassCourseFilterType == ClassCourseFilterEnum.Class && x.SchoolId == response.SchoolId && x.IsActive).CountAsync();

            response.NoOfAppliedCourseFilters = await _userClassCourseFilterRepository.GetAll().Where(x => x.UserId == loginUserId && x.ClassCourseFilterType == ClassCourseFilterEnum.Course && x.SchoolId == response.SchoolId && x.IsActive).CountAsync();

            return response;
            //}
            //return null;
        }


        async Task<IEnumerable<CertificateViewModel>> GetCertificateBySchoolId(Guid schoolId)
        {
            var schoolCertificate = _schoolCertificateRepository.GetAll().Where(x => x.SchoolId == schoolId).ToList();
            var response = _mapper.Map<IEnumerable<CertificateViewModel>>(schoolCertificate);
            return response;
        }

        async Task<IEnumerable<SchoolTagViewModel>> GetTagsBySchoolId(Guid schoolId)
        {
            var schoolTags = _schoolTagRepository.GetAll().Where(x => x.SchoolId == schoolId).ToList();
            var response = _mapper.Map<IEnumerable<SchoolTagViewModel>>(schoolTags);
            return response;
        }

        public async Task<IEnumerable<SchoolViewModel>> GetAllSchools(string userId)
        {
            IEnumerable<SchoolViewModel> model = _schoolRepository.GetAll().Where(x => !x.IsDeleted && x.CreatedById == userId).Select(x => new SchoolViewModel
            {
                SchoolId = x.SchoolId,
                SchoolName = x.SchoolName,
            });

            return model;
        }

        //public async Task<IEnumerable<SchoolViewModel>> GetAllCertificates(IEnumerable<SchoolViewModel> model)
        //{
        //    foreach (var item in model)
        //    {
        //        var schoolCertificate = await GetCertificateBySchoolId(item.SchoolId);
        //        item.SchoolCertificates = schoolCertificate;
        //    }
        //    return model;
        //}

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
            var followerList = await _schoolFollowerRepository.GetAll().Where(x => x.SchoolId == schoolId && !x.IsBan).ToListAsync();
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

        public async Task<IEnumerable<ClassViewModel>> GetClassesBySchoolId(Guid? schoolId, string loginUserId, int pageNumber, int pageSize, List<UserClassCourseFilter> filters)
        {
            var classes = new List<Class>();
            var classList = await _classRepository.GetAll().Include(x => x.School).Include(x => x.Accessibility).Include(x => x.ServiceType)
                .Where(x => x.SchoolId == schoolId && !x.IsEnable && !x.IsDeleted).ToListAsync();

            var classIds = classList.Select(x => x.ClassId).ToList();

            if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.Name))
            {
                var classFilterByName = _classRepository.GetAll().Where(x => classIds.Contains((Guid)x.ClassId)).OrderBy(x => x.ClassName).ToList();
                classes.AddRange(classFilterByName);
            }

            else
            {

                if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.TopRated))
                {
                    var topRatedClasses = _classRepository.GetAll().Where(x => classIds.Contains((Guid)x.ClassId)).OrderByDescending(x => x.Rating).ToList();
                    classes.AddRange(topRatedClasses);
                }

                else
                {
                    if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostViewed))
                    {

                        var query = _ClassViewsRepository.GetAll().Where(x => classIds.Contains((Guid)x.ClassId)).GroupBy(x => x.ClassId)
                            .Select(g => new
                            {
                                ClassId = g.Key,
                                ViewCount = g.Count()
                            })
                            .OrderByDescending(x => x.ViewCount).Select(x => x.ClassId).ToList();

                        var mostViewedClasses = _classRepository.GetAll().Where(c => query.Contains(c.ClassId)).ToList();
                        classes.AddRange(mostViewedClasses);

                    }

                    if (!filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostViewed))
                    {
                        if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostStudents))
                        {

                            var query = _classStudentRepository.GetAll().Where(x => classIds.Contains((Guid)x.ClassId)).GroupBy(x => x.ClassId)
                                .Select(g => new
                                {
                                    ClassId = g.Key,
                                    StudentCount = g.Count()
                                })
                                .OrderByDescending(x => x.StudentCount).Select(x => x.ClassId).ToList();

                            var mostStudentsClasses = _classRepository.GetAll().Where(c => query.Contains(c.ClassId)).ToList();
                            mostStudentsClasses.AddRange(classList);
                            mostStudentsClasses = mostStudentsClasses.DistinctBy(x => x.ClassId).ToList();
                            classes.AddRange(mostStudentsClasses);

                        }

                    }

                }


            }

            if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.Free) && filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.Paid))
            {

            }
            else
            {
                if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.Free))
                {
                    var freeClasses = classList.Where(x => x.ServiceType.Type == "Free").OrderByDescending(x => x.CreatedOn).ToList();
                    if (classes.Count() != 0)
                    {
                        classes = classes.Intersect(freeClasses).ToList();
                    }
                    classes.AddRange(freeClasses);
                }

                if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.Paid))
                {
                    var paidClasses = classList.Where(x => x.ServiceType.Type == "Paid").OrderByDescending(x => x.CreatedOn).ToList();
                    if (classes.Count() != 0)
                    {
                        classes = classes.Intersect(paidClasses).ToList();
                    }
                    classes.AddRange(paidClasses);
                }

            }


            if (classes.Count() != 0)
            {
                classList = classes;

            }
            classList = classList.DistinctBy(x => x.ClassId).OrderByDescending(x => x.IsPinned).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
            try
            {
                var result = _mapper.Map<List<ClassViewModel>>(classList);
                var tagList = await _classTagRepository.GetAll().ToListAsync();
                foreach (var item in result)
                {
                    item.ClassTags = tagList.Where(x => x.ClassId == item.ClassId).Select(x => x.ClassTagValue).ToList();

                    item.ClassLike = await _classService.GetLikesOnClass(item.ClassId);
                    item.ClassViews = await _classService.GetViewsOnClass(item.ClassId);
                    item.CommentsCount = await _userService.GetCommentsCountOnPost(item.ClassId);

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
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public async Task<IEnumerable<CourseViewModel>> GetCoursesBySchoolId(Guid? schoolId, string loginUserId, int pageNumber, int pageSize, List<UserClassCourseFilter> filters)
        {
            var courseList = await _courseRepository.GetAll().Include(x => x.School).Include(x => x.Accessibility).Include(x => x.ServiceType).Where(x => x.SchoolId == schoolId && !x.IsEnable && !x.IsDeleted).ToListAsync();

            var courses = new List<Course>();

            var courseIds = courseList.Select(x => x.CourseId).ToList();

            if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.Name))
            {
                var classFilterByName = _courseRepository.GetAll().Where(x => courseIds.Contains((Guid)x.CourseId)).OrderBy(x => x.CourseName).ToList();
                courses.AddRange(classFilterByName);
            }

            else
            {

                if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.TopRated))
                {
                    var topRatedCourses = _courseRepository.GetAll().Where(x => courseIds.Contains((Guid)x.CourseId)).OrderByDescending(x => x.Rating).ToList();
                    courses.AddRange(topRatedCourses);
                }

                else
                {
                    if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostViewed))
                    {

                        var query = _CourseViewsRepository.GetAll().Where(x => courseIds.Contains((Guid)x.CourseId)).GroupBy(x => x.CourseId)
                            .Select(g => new
                            {
                                CourseId = g.Key,
                                ViewCount = g.Count()
                            })
                            .OrderByDescending(x => x.ViewCount).Select(x => x.CourseId).ToList();

                        var mostViewedCourses = _courseRepository.GetAll().Where(c => query.Contains(c.CourseId)).ToList();
                        courses.AddRange(mostViewedCourses);

                    }

                    if (!filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostViewed))
                    {
                        if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostStudents))
                        {

                            var query = _courseStudentRepository.GetAll().Where(x => courseIds.Contains((Guid)x.CourseId)).GroupBy(x => x.CourseId)
                                .Select(g => new
                                {
                                    CourseId = g.Key,
                                    StudentCount = g.Count()
                                })
                                .OrderByDescending(x => x.StudentCount).Select(x => x.CourseId).ToList();

                            var mostStudentsCourses = _courseRepository.GetAll().Where(c => query.Contains(c.CourseId)).ToList();
                            mostStudentsCourses.AddRange(courseList);
                            mostStudentsCourses = mostStudentsCourses.DistinctBy(x => x.CourseId).ToList();
                            courses.AddRange(mostStudentsCourses);

                        }

                    }

                }


            }

            if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.Free) && filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.Paid))
            {

            }
            else
            {
                if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.Free))
                {
                    var freeCourses = courseList.Where(x => x.ServiceType.Type == "Free").OrderByDescending(x => x.CreatedOn).ToList();
                    if (courses.Count() != 0)
                    {
                        courses = courses.Intersect(freeCourses).ToList();
                    }
                    courses.AddRange(freeCourses);
                }

                if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.Paid))
                {
                    var paidCourses = courseList.Where(x => x.ServiceType.Type == "Paid").OrderByDescending(x => x.CreatedOn).ToList();
                    if (courses.Count() != 0)
                    {
                        courses = courses.Intersect(paidCourses).ToList();
                    }
                    courses.AddRange(paidCourses);
                }

            }


            if (courses.Count() != 0)
            {
                courseList = courses;

            }
            //if(pageSize > courseList.Count())
            //{
            //    pageNumber = 1;
            //}
            courseList = courseList.DistinctBy(x => x.CourseId).OrderByDescending(x => x.IsPinned).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

            var result = _mapper.Map<List<CourseViewModel>>(courseList);
            var tagList = await _courseTagRepository.GetAll().ToListAsync();
            foreach (var item in result)
            {
                item.CourseTags = tagList.Where(x => x.CourseId == item.CourseId).Select(x => x.CourseTagValue).ToList();

                item.CourseLike = await _courseService.GetLikesOnCourse(item.CourseId);
                item.CourseViews = await _courseService.GetViewsOnCourse(item.CourseId);
                item.CommentsCount = await _userService.GetCommentsCountOnPost(item.CourseId);

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

            var classStudentsList = await _classStudentRepository.GetAll().Include(x => x.Student).ThenInclude(y => y.User).Distinct().ToListAsync();

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

            var courseStudentsList = await _courseStudentRepository.GetAll().Include(x => x.Student).ThenInclude(y => y.User).Distinct().ToListAsync();

            var requiredCourseList = courseStudentsList.Where(x => courseList.Any(y => y.CourseId == x.CourseId)).DistinctBy(x => x.StudentId);

            var courseStudents = new List<Student>();
            foreach (var courseStudent in requiredCourseList)
            {
                courseStudents.Add(courseStudent.Student);
            }

            var result = _mapper.Map<List<StudentViewModel>>(courseStudents);
            return result;

        }

        public async Task<IEnumerable<PostDetailsViewModel>> GetPostsBySchool(Guid schoolId, string loginUserId, int pageNumber = 1, int pageSize = 12)
        {
            var courseList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == schoolId && (x.PostType == (int)PostTypeEnum.Post || (x.PostType == (int)PostTypeEnum.Stream) && x.IsLive == true) && x.PostAuthorType == (int)PostAuthorTypeEnum.School && x.IsPostSchedule != true).OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.CreatedOn).ToListAsync();

            var sharedPost = await _userSharedPostRepository.GetAll().ToListAsync();
            var savedPost = await _savedPostRepository.GetAll().ToListAsync();

            var result = _mapper.Map<List<PostDetailsViewModel>>(courseList).Skip((pageNumber - 1) * pageSize).Take(pageSize);

            foreach (var post in result)
            {
                post.PostAttachments = await GetAttachmentsByPostId(post.Id, loginUserId);
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

        public async Task<IEnumerable<PostDetailsViewModel>> GetReelsBySchool(Guid schoolId, string loginUserId, int pageNumber = 1, int pageSize = 8)
        {
            var courseList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == schoolId && x.PostType == (int)PostTypeEnum.Reel && x.IsPostSchedule != true).OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.CreatedOn).ToListAsync();

            var result = _mapper.Map<List<PostDetailsViewModel>>(courseList).Skip((pageNumber - 1) * pageSize).Take(pageSize);
            var savedPost = await _savedPostRepository.GetAll().ToListAsync();
            var sharedPost = await _userSharedPostRepository.GetAll().ToListAsync();
            foreach (var post in result)
            {
                post.PostAttachments = await GetAttachmentsByPostId(post.Id, loginUserId);
                post.Likes = await _userService.GetLikesOnPost(post.Id);
                post.PostSharedCount = sharedPost.Where(x => x.PostId == post.Id).Count();
                post.SavedPostsCount = savedPost.Where(x => x.PostId == post.Id).Count();
                post.IsPostSavedByCurrentUser = savedPost.Any(x => x.PostId == post.Id && x.UserId == loginUserId);
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

        public async Task<IEnumerable<PostDetailsViewModel>> GetSliderReelsBySchoolId(Guid schoolId, string loginUserId, Guid lastPostId, ScrollTypesEnum scrollType)
        {
            var requiredResults = new List<Post>();
            var schoolList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == schoolId && x.PostType == (int)PostTypeEnum.Reel && x.IsPostSchedule != true).OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.CreatedOn).ToListAsync();

            if (scrollType == ScrollTypesEnum.None)
            {

                var attachment = _postAttachmentRepository.GetById(lastPostId);
                int index = schoolList.FindIndex(x => x.Id == attachment.PostId);
                int startIndex = Math.Max(0, index - 3);
                int totalItems = 7;
                requiredResults = schoolList.GetRange(startIndex, Math.Min(totalItems, schoolList.Count - startIndex));


            }
            if (scrollType == ScrollTypesEnum.Down)
            {
                requiredResults = schoolList.SkipWhile(x => x.Id != lastPostId).Skip(1).Take(3).ToList();

            }
            if (scrollType == ScrollTypesEnum.Up)
            {
                requiredResults = schoolList.TakeWhile(x => x.Id != lastPostId).Reverse().Take(3).Reverse().ToList();

            }
            var result = _mapper.Map<List<PostDetailsViewModel>>(requiredResults);

            foreach (var post in result)
            {

                if (post.PostAuthorType == (int)PostAuthorTypeEnum.School)
                {
                    var school = _schoolRepository.GetById(post.ParentId);
                    post.ParentName = school.SchoolName;
                    post.ParentImageUrl = school.Avatar;
                }

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

            return result;
        }

        public async Task<IEnumerable<PostAttachmentViewModel>> GetAttachmentsByPostId(Guid postId, string loginUserId)
        {
            var attachmentList = await _postAttachmentRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.PostId == postId).OrderByDescending(x => x.IsPinned).ToListAsync();
            foreach (var isCompressed in attachmentList)
            {
                if (!string.IsNullOrEmpty(isCompressed.CompressedFileUrl))
                {
                    isCompressed.FileUrl = isCompressed.CompressedFileUrl;
                }
                //isCompressed.FileThumbnail = $"https://byokulstorage.blob.core.windows.net/userpostscompressed/thumbnails/{isCompressed.Id}.png";
            }
            var result = _mapper.Map<List<PostAttachmentViewModel>>(attachmentList);
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
                var isTeacherExist = await _schoolTeacherRepository.GetAll().Where(x => x.TeacherId == new Guid(teacherId) && x.SchoolId == new Guid(model.SchoolId)).FirstOrDefaultAsync();

                if (isTeacherExist != null)
                {
                    _schoolTeacherRepository.Delete(isTeacherExist.Id);
                    _schoolTeacherRepository.Save();
                }

                var schoolTeacher = new SchoolTeacher
                {
                    SchoolId = new Guid(model.SchoolId),
                    TeacherId = new Guid(teacherId)
                };

                _schoolTeacherRepository.Insert(schoolTeacher);
                _schoolTeacherRepository.Save();
            }
        }

        public async Task<bool> DeleteSchoolTeacher(SchoolTeacherViewModel model)
        {
            try
            {


                var classTeachers = new List<ClassTeacher>();
                var schoolTeacher = await _schoolTeacherRepository.GetAll().Where(x => x.SchoolId == model.SchoolId && x.TeacherId == model.TeacherId).FirstOrDefaultAsync();
                bool isDelete = false;

                if (schoolTeacher != null)
                {
                    _schoolTeacherRepository.Delete(schoolTeacher.Id);
                    var res4 = (int)await _schoolTeacherRepository.SaveAsync();
                    if (res4 > 0)
                        isDelete = true;
                }

                var classes = await _classRepository.GetAll().Where(x => x.SchoolId == model.SchoolId).ToListAsync();

                classTeachers = await _classTeacherRepository.GetAll().Include(x => x.Teacher).Where(x => x.TeacherId == model.TeacherId).ToListAsync();


                var requiredClassTeacher = classTeachers.Where(x => classes.Any(y => y.ClassId == x.ClassId && x.TeacherId == model.TeacherId)).ToList();

                //var requiredTeacher = classTeachers.Where(x => x.TeacherId == model.TeacherId).FirstOrDefault();
                if (requiredClassTeacher.Count() != 0)
                {
                    _classTeacherRepository.DeleteAll(requiredClassTeacher);
                    var res2 = (int)await _classTeacherRepository.SaveAsync();
                    if (res2 > 0)
                        isDelete = true;
                }




                var courses = await _courseRepository.GetAll().Where(x => x.SchoolId == model.SchoolId).ToListAsync();

                var courseTeachers = await _courseTeacherRepository.GetAll().Where(x => x.TeacherId == model.TeacherId).ToListAsync();

                var requiredCourseTeacher = courseTeachers.Where(x => courses.Any(y => y.CourseId == x.CourseId && x.TeacherId == model.TeacherId)).ToList();

                if (requiredCourseTeacher.Count() != 0)
                {
                    _courseTeacherRepository.DeleteAll(requiredCourseTeacher);
                    var res1 = (int)await _courseTeacherRepository.SaveAsync();
                    if (res1 > 0)
                        isDelete = true;
                }


                //remove userpermissions

                var userPermissions = await _userPermissionRepository.GetAll().Where(x => x.TypeId == model.SchoolId || x.SchoolId == model.SchoolId).ToListAsync();

                _userPermissionRepository.DeleteAll(userPermissions);
                await _userPermissionRepository.SaveAsync();

                return isDelete;
            }
            catch (Exception)
            {
                throw;
            }



        }

        public async Task<SchoolViewModel> GetBasicSchoolInfo(Guid schoolId)
        {
            var school = await _schoolRepository.GetAll().Where(x => x.SchoolId == schoolId).FirstOrDefaultAsync();

            var response = _mapper.Map<SchoolViewModel>(school);
            return response;

        }

        public async Task<List<SchoolFollowerViewModel>> GetSchoolFollowers(Guid schoolId, int pageNumber, string? searchString)
        {
            int pageSize = 13;
            var followerList = await _schoolFollowerRepository.GetAll().Include(x => x.User).Include(x => x.School)
             .Where(x => x.SchoolId == schoolId && !x.IsBan && ((string.IsNullOrEmpty(searchString)) || (x.User.FirstName.Contains(searchString) || x.User.LastName.Contains(searchString)))).Skip((pageNumber - 1) * pageSize)
             .Take(pageSize).ToListAsync();

            var response = _mapper.Map<List<SchoolFollowerViewModel>>(followerList);
            return response;

        }

        public async Task<string> IsSchoolNameExist(string schoolName)
        {
            var result = await _schoolRepository.GetAll().Where(x => x.SchoolName == schoolName && !x.IsDeleted).FirstOrDefaultAsync();
            if (result != null)
            {
                return Constants.SchoolNameExist;
            }
            return Constants.SchoolNameDoesNotExist;
        }

        //public async Task<SchoolViewModel> GetSchoolByName(string schoolName)
        //{
        //    var school = await _schoolRepository.GetAll().Where(x => x.SchoolName.Replace(" ", "").ToLower() == schoolName.Replace(" ", "").ToLower()).FirstOrDefaultAsync();
        //    if (school != null)
        //    {
        //        return _mapper.Map<SchoolViewModel>(school);
        //    }
        //    return null;
        //}

        //public async Task<IEnumerable<CombineClassCourseViewModel>> GetSchoolClassCourse(Guid? schoolId, string userId, int pageNumber)
        //{
        //    var filters = await _userClassCourseFilterRepository.GetAll().Include(x => x.ClassCourseFilter).Where(x => x.SchoolId == schoolId && x.IsActive).ToListAsync();

        //    int pageSize = 4;
        //    var classes = await GetClassesBySchoolId(schoolId, userId,pageNumber,pageSize);
        //    var courses = await GetCoursesBySchoolId(schoolId, userId);
        //    var savedClassCourse = await _savedClassCourseRepository.GetAll().ToListAsync();


        //    var model = new List<CombineClassCourseViewModel>();

        //    foreach (var classDetails in classes)
        //    {
        //        var item = new CombineClassCourseViewModel();
        //        item.Id = classDetails.ClassId;
        //        item.Avatar = classDetails.Avatar;
        //        item.Accessibility = classDetails.Accessibility;
        //        item.ServiceType = classDetails.ServiceType;
        //        item.Description = classDetails.Description;
        //        item.Name = classDetails.ClassName;
        //        item.SchoolName = classDetails.School.SchoolName;
        //        item.Price = classDetails.Price;
        //        item.Rating = classDetails.Rating;
        //        item.CreatedOn = classDetails.CreatedOn;
        //        item.CreatedById = classDetails.CreatedById;
        //        item.Type = ClassCourseEnum.Class;
        //        item.IsPinned = classDetails.IsPinned;
        //        item.StartDate = classDetails.StartDate;
        //        item.EndDate = classDetails.EndDate;
        //        item.ThumbnailUrl = classDetails.ThumbnailUrl;
        //        item.Tags = classDetails.ClassTags;
        //        item.IsLikedByCurrentUser = classDetails.IsClassLikedByCurrentUser;
        //        item.ClassLikes = classDetails.ClassLike;
        //        item.ClassViews = classDetails.ClassViews;
        //        item.CommentsCount = classDetails.CommentsCount;
        //        item.ThumbnailType = classDetails.ThumbnailType;
        //        item.NoOfStudents = await _classService.GetStudents(classDetails.ClassId);
        //        item.Rating = classDetails.Rating;
        //        item.IsCommentsDisabled = classDetails.IsCommentsDisabled;
        //        item.IsClassCourseSavedByCurrentUser = savedClassCourse.Any(x => x.ClassId == classDetails.ClassId && x.UserId == userId);
        //        item.SavedClassCourseCount = savedClassCourse.Where(x => x.ClassId == classDetails.ClassId && x.UserId == userId).Count();

        //        model.Add(item);
        //    }

        //    foreach (var courseDetails in courses)
        //    {
        //        var item = new CombineClassCourseViewModel();
        //        item.Id = courseDetails.CourseId;
        //        item.Avatar = courseDetails.Avatar;
        //        item.Accessibility = courseDetails.Accessibility;
        //        item.ServiceType = courseDetails.ServiceType;
        //        item.Description = courseDetails.Description;
        //        item.Name = courseDetails.CourseName;
        //        item.SchoolName = courseDetails.School.SchoolName;
        //        item.Price = courseDetails.Price;
        //        item.Rating = courseDetails.Rating;
        //        item.CreatedOn = courseDetails.CreatedOn;
        //        item.CreatedById = courseDetails.CreatedById;
        //        item.Type = ClassCourseEnum.Course;
        //        item.IsPinned = courseDetails.IsPinned;
        //        item.ThumbnailUrl = courseDetails.ThumbnailUrl;
        //        item.Tags = courseDetails.CourseTags;
        //        item.IsLikedByCurrentUser = courseDetails.IsCourseLikedByCurrentUser;
        //        item.CourseLikes = courseDetails.CourseLike;
        //        item.CourseViews = courseDetails.CourseViews;
        //        item.CommentsCount = courseDetails.CommentsCount;
        //        item.ThumbnailType = courseDetails.ThumbnailType;
        //        item.NoOfStudents = await _courseService.GetStudents(courseDetails.CourseId);
        //        item.Rating = courseDetails.Rating;
        //        item.IsCommentsDisabled = courseDetails.IsCommentsDisabled;
        //        item.IsClassCourseSavedByCurrentUser = savedClassCourse.Any(x => x.ClassId == courseDetails.CourseId && x.UserId == userId);
        //        item.SavedClassCourseCount = savedClassCourse.Where(x => x.ClassId == courseDetails.CourseId && x.UserId == userId).Count();

        //        model.Add(item);
        //    }


        //    if (filters.Count() != 0)
        //    {
        //        var appliedFilterResult = new List<CombineClassCourseViewModel>();
        //        foreach (var filter in filters)
        //        {
        //            if (filter.ClassCourseFilterType == ClassCourseFilterEnum.Class)
        //            {
        //                //if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Live)
        //                //{
        //                //    var liveClassResult = model.Where(x => x.IsLive == "Free" && x.Type == ClassCourseEnum.Class).ToList();
        //                //    appliedFilterResult.AddRange(freeClassResult);
        //                //}

        //                if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Free)
        //                {
        //                    var freeClassResult = model.Where(x => x.ServiceType.Type == "Free" && x.Type == ClassCourseEnum.Class).ToList();
        //                    appliedFilterResult.AddRange(freeClassResult);
        //                }

        //                if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Paid)
        //                {
        //                    var paidClassResult = model.Where(x => x.ServiceType.Type == "Paid" && x.Type == ClassCourseEnum.Class).ToList();
        //                    appliedFilterResult.AddRange(paidClassResult);
        //                }

        //                if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.MostStudents)
        //                {
        //                    if (appliedFilterResult.Count() != 0)
        //                    {
        //                        if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostStudents && x.ClassCourseFilterType == ClassCourseFilterEnum.Course))
        //                        {
        //                            var appliedMostStudentsOnClass = model.Where(x => x.Type == ClassCourseEnum.Class).ToList();
        //                            appliedFilterResult.AddRange(appliedMostStudentsOnClass);
        //                            appliedFilterResult = appliedFilterResult.OrderByDescending(x => x.NoOfStudents).ToList();

        //                        }
        //                        else
        //                        {
        //                            appliedFilterResult = appliedFilterResult.Where(x => x.Type == ClassCourseEnum.Class).OrderByDescending(x => x.NoOfStudents).ToList();
        //                        }
        //                    }
        //                    else
        //                    {
        //                        appliedFilterResult = model.Where(x => x.Type == ClassCourseEnum.Class).OrderByDescending(x => x.NoOfStudents).ToList();
        //                    }
        //                }


        //                if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.MostViewed)
        //                {
        //                    if (appliedFilterResult.Count() != 0)
        //                    {
        //                        if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostViewed && x.ClassCourseFilterType == ClassCourseFilterEnum.Course))
        //                        {
        //                            var appliedMostViewedOnClass = model.Where(x => x.Type == ClassCourseEnum.Class).ToList();
        //                            appliedFilterResult.AddRange(appliedMostViewedOnClass);
        //                            appliedFilterResult = appliedFilterResult.OrderByDescending(x => (x.ClassViews.Count() + x.CourseLikes.Count())).ToList();
        //                        }
        //                        else
        //                        {
        //                            appliedFilterResult = appliedFilterResult.Where(x => x.Type == ClassCourseEnum.Class).OrderByDescending(x => x.ClassViews.Count()).ToList();
        //                        }
        //                    }
        //                    else
        //                    {
        //                        appliedFilterResult = model.Where(x => x.Type == ClassCourseEnum.Class).OrderByDescending(x => x.ClassViews.Count()).ToList();
        //                    }
        //                }

        //                if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.TopRated)
        //                {
        //                    if (appliedFilterResult.Count() != 0)
        //                    {
        //                        if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.TopRated && x.ClassCourseFilterType == ClassCourseFilterEnum.Course))
        //                        {
        //                            var appliedTopRatedOnClass = model.Where(x => x.Type == ClassCourseEnum.Class).ToList();
        //                            appliedFilterResult.AddRange(appliedTopRatedOnClass);
        //                            appliedFilterResult = appliedFilterResult.OrderByDescending(x => x.Rating).ToList();
        //                        }
        //                    }
        //                    else
        //                    {
        //                        appliedFilterResult = model.Where(x => x.Type == ClassCourseEnum.Class).OrderByDescending(x => x.Rating).ToList();
        //                    }
        //                }

        //                if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Name)
        //                {
        //                    if (appliedFilterResult.Count() != 0 && model.Any(x => x.Type == ClassCourseEnum.Course))
        //                    {
        //                        appliedFilterResult = appliedFilterResult.OrderBy(x => x.Name).ToList();
        //                    }

        //                    else
        //                    {
        //                        if (appliedFilterResult.Count() != 0 && !model.Any(x => x.Type == ClassCourseEnum.Course))
        //                        {
        //                            appliedFilterResult = appliedFilterResult.Where(x => x.Type == ClassCourseEnum.Class).OrderBy(x => x.Name).ToList();
        //                        }
        //                        else
        //                        {
        //                            appliedFilterResult = model.OrderBy(x => x.Name).ToList();
        //                        }
        //                    }
        //                }
        //            }

        //            if (filter.ClassCourseFilterType == ClassCourseFilterEnum.Course)
        //            {
        //                if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Free)
        //                {
        //                    var freeCourseResult = model.Where(x => x.ServiceType.Type == "Free" && x.Type == ClassCourseEnum.Course).ToList();
        //                    appliedFilterResult.AddRange(freeCourseResult);
        //                }

        //                if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Paid)
        //                {
        //                    var paidCourseResult = model.Where(x => x.ServiceType.Type == "Paid" && x.Type == ClassCourseEnum.Course).ToList();
        //                    appliedFilterResult.AddRange(paidCourseResult);
        //                }

        //                if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.MostStudents)
        //                {
        //                    if (appliedFilterResult.Count() != 0)
        //                    {
        //                        if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostStudents && x.ClassCourseFilterType == ClassCourseFilterEnum.Class))
        //                        {
        //                            var appliedMostStudentsOnCourse = model.Where(x => x.Type == ClassCourseEnum.Course).ToList();
        //                            appliedFilterResult.AddRange(appliedMostStudentsOnCourse);
        //                            appliedFilterResult = appliedFilterResult.OrderByDescending(x => x.NoOfStudents).ToList();
        //                        }
        //                        else
        //                        {
        //                            appliedFilterResult = appliedFilterResult.Where(x => x.Type == ClassCourseEnum.Course).OrderByDescending(x => x.NoOfStudents).ToList();
        //                        }
        //                    }
        //                    else
        //                    {
        //                        appliedFilterResult = model.Where(x => x.Type == ClassCourseEnum.Course).OrderByDescending(x => x.NoOfStudents).ToList();
        //                    }
        //                }

        //                if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.MostViewed)
        //                {
        //                    if (appliedFilterResult.Count() != 0)
        //                    {
        //                        if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostViewed && x.ClassCourseFilterType == ClassCourseFilterEnum.Class))
        //                        {
        //                            var appliedMostViewedOnCourse = model.Where(x => x.Type == ClassCourseEnum.Course).ToList();
        //                            appliedFilterResult.AddRange(appliedMostViewedOnCourse);
        //                            appliedFilterResult = appliedFilterResult.OrderByDescending(x => (x.CourseViews.Count() + x.ClassViews.Count())).ToList();
        //                        }
        //                        else
        //                        {
        //                            appliedFilterResult = appliedFilterResult.Where(x => x.Type == ClassCourseEnum.Course).OrderByDescending(x => x.CourseViews.Count()).ToList();
        //                        }
        //                    }
        //                    else
        //                    {
        //                        appliedFilterResult = model.Where(x => x.Type == ClassCourseEnum.Course).OrderByDescending(x => x.CourseViews.Count()).ToList();
        //                    }
        //                }

        //                if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.TopRated)
        //                {
        //                    if (appliedFilterResult.Count() != 0)
        //                    {
        //                        if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.TopRated && x.ClassCourseFilterType == ClassCourseFilterEnum.Class))
        //                        {
        //                            var appliedTopRatedOnCourse = model.Where(x => x.Type == ClassCourseEnum.Course).ToList();
        //                            appliedFilterResult.AddRange(appliedTopRatedOnCourse);
        //                            appliedFilterResult = appliedFilterResult.OrderByDescending(x => x.Rating).ToList();
        //                        }
        //                    }
        //                    else
        //                    {
        //                        appliedFilterResult = model.Where(x => x.Type == ClassCourseEnum.Course).OrderByDescending(x => x.Rating).ToList();
        //                    }
        //                }

        //                if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Name)
        //                {
        //                    if (appliedFilterResult.Count() != 0)
        //                    {
        //                        appliedFilterResult = appliedFilterResult.OrderBy(x => x.Name).ToList();
        //                    }
        //                    else
        //                    {
        //                        appliedFilterResult = model.OrderBy(x => x.Name).ToList();
        //                    }

        //                }
        //            }
        //        }
        //        return appliedFilterResult.Skip((pageNumber - 1) * pageSize).Take(pageSize);
        //    }
        //    //var response = model.OrderByDescending(x => x.IsPinned);
        //    var response = model.Skip((pageNumber - 1) * pageSize).Take(pageSize).OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.CreatedOn);
        //    return response;

        //}

        public async Task<IEnumerable<CombineClassCourseViewModel>> GetSchoolClasses(Guid? schoolId, string userId, int pageNumber)
        {
            var filters = await _userClassCourseFilterRepository.GetAll().Include(x => x.ClassCourseFilter).Where(x => x.SchoolId == schoolId && x.IsActive && x.ClassCourseFilterType == ClassCourseFilterEnum.Class).ToListAsync();

            int pageSize = 4;
            var classes = await GetClassesBySchoolId(schoolId, userId, pageNumber, pageSize, filters);
            //var courses = await GetCoursesBySchoolId(schoolId, userId);
            var savedClassCourse = await _savedClassCourseRepository.GetAll().ToListAsync();
            var sharedClassCourse = await _sharedClassCourseRepository.GetAll().ToListAsync();


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
                item.SchoolName = classDetails.School.SchoolName;
                item.Price = classDetails.Price;
                item.Rating = classDetails.Rating;
                item.CreatedOn = classDetails.CreatedOn;
                item.CreatedById = classDetails.CreatedById;
                item.Type = ClassCourseEnum.Class;
                item.IsPinned = classDetails.IsPinned;
                item.StartDate = classDetails.StartDate;
                item.EndDate = classDetails.EndDate;
                item.ThumbnailUrl = classDetails.ThumbnailUrl;
                item.Tags = classDetails.ClassTags;
                item.IsLikedByCurrentUser = classDetails.IsClassLikedByCurrentUser;
                item.ClassLikes = classDetails.ClassLike;
                item.ClassViews = classDetails.ClassViews;
                item.CommentsCount = classDetails.CommentsCount;
                item.ThumbnailType = classDetails.ThumbnailType;
                item.NoOfStudents = await _classService.GetStudents(classDetails.ClassId);
                item.Rating = classDetails.Rating;
                item.IsCommentsDisabled = classDetails.IsCommentsDisabled;
                item.IsClassCourseSavedByCurrentUser = savedClassCourse.Any(x => x.ClassId == classDetails.ClassId && x.UserId == userId);
                item.SavedClassCourseCount = savedClassCourse.Where(x => x.ClassId == classDetails.ClassId && x.UserId == userId).Count();
                item.SharedClassCourseCount = sharedClassCourse.Where(x => x.ClassId == classDetails.ClassId).Count();
                model.Add(item);
            }

            //if (filters.Count() != 0)
            //{
            //    var appliedFilterResult = new List<CombineClassCourseViewModel>();
            //    foreach (var filter in filters)
            //    {
            //        if (filter.ClassCourseFilterType == ClassCourseFilterEnum.Class)
            //        {
            //            //if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Live)
            //            //{
            //            //    var liveClassResult = model.Where(x => x.IsLive == "Free" && x.Type == ClassCourseEnum.Class).ToList();
            //            //    appliedFilterResult.AddRange(freeClassResult);
            //            //}

            //            if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Free)
            //            {
            //                var freeClassResult = model.Where(x => x.ServiceType.Type == "Free" && x.Type == ClassCourseEnum.Class).ToList();
            //                appliedFilterResult.AddRange(freeClassResult);
            //            }

            //            if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Paid)
            //            {
            //                var paidClassResult = model.Where(x => x.ServiceType.Type == "Paid" && x.Type == ClassCourseEnum.Class).ToList();
            //                appliedFilterResult.AddRange(paidClassResult);
            //            }

            //            if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.MostStudents)
            //            {
            //                if (appliedFilterResult.Count() != 0)
            //                {
            //                    if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostStudents && x.ClassCourseFilterType == ClassCourseFilterEnum.Course))
            //                    {
            //                        var appliedMostStudentsOnClass = model.Where(x => x.Type == ClassCourseEnum.Class).ToList();
            //                        appliedFilterResult.AddRange(appliedMostStudentsOnClass);
            //                        appliedFilterResult = appliedFilterResult.OrderByDescending(x => x.).ToList();

            //                    }
            //                    else
            //                    {
            //                        appliedFilterResult = appliedFilterResult.Where(x => x.Type == ClassCourseEnum.Class).OrderByDescending(x => x.NoOfStudents).ToList();
            //                    }
            //                }
            //                else
            //                {
            //                    appliedFilterResult = model.Where(x => x.Type == ClassCourseEnum.Class).OrderByDescending(x => x.NoOfStudents).ToList();
            //                }
            //            }


            //            if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.MostViewed)
            //            {
            //                if (appliedFilterResult.Count() != 0)
            //                {
            //                    if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostViewed && x.ClassCourseFilterType == ClassCourseFilterEnum.Course))
            //                    {
            //                        var appliedMostViewedOnClass = model.Where(x => x.Type == ClassCourseEnum.Class).ToList();
            //                        appliedFilterResult.AddRange(appliedMostViewedOnClass);
            //                        appliedFilterResult = appliedFilterResult.OrderByDescending(x => (x.ClassViews.Count() + x.CourseLikes.Count())).ToList();
            //                    }
            //                    else
            //                    {
            //                        appliedFilterResult = appliedFilterResult.Where(x => x.Type == ClassCourseEnum.Class).OrderByDescending(x => x.ClassViews.Count()).ToList();
            //                    }
            //                }
            //                else
            //                {
            //                    appliedFilterResult = model.Where(x => x.Type == ClassCourseEnum.Class).OrderByDescending(x => x.ClassViews.Count()).ToList();
            //                }
            //            }

            //            if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.TopRated)
            //            {
            //                if (appliedFilterResult.Count() != 0)
            //                {
            //                    if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.TopRated && x.ClassCourseFilterType == ClassCourseFilterEnum.Course))
            //                    {
            //                        var appliedTopRatedOnClass = model.Where(x => x.Type == ClassCourseEnum.Class).ToList();
            //                        appliedFilterResult.AddRange(appliedTopRatedOnClass);
            //                        appliedFilterResult = appliedFilterResult.OrderByDescending(x => x.Rating).ToList();
            //                    }
            //                }
            //                else
            //                {
            //                    appliedFilterResult = model.Where(x => x.Type == ClassCourseEnum.Class).OrderByDescending(x => x.Rating).ToList();
            //                }
            //            }

            //            if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Name)
            //            {
            //                if (appliedFilterResult.Count() != 0 && model.Any(x => x.Type == ClassCourseEnum.Course))
            //                {
            //                    appliedFilterResult = appliedFilterResult.OrderBy(x => x.Name).ToList();
            //                }

            //                else
            //                {
            //                    if (appliedFilterResult.Count() != 0 && !model.Any(x => x.Type == ClassCourseEnum.Course))
            //                    {
            //                        appliedFilterResult = appliedFilterResult.Where(x => x.Type == ClassCourseEnum.Class).OrderBy(x => x.Name).ToList();
            //                    }
            //                    else
            //                    {
            //                        appliedFilterResult = model.OrderBy(x => x.Name).ToList();
            //                    }
            //                }
            //            }

            //            if ()
            //            {

            //                model.
            //            }


            //        }
            //    }
            //    //return appliedFilterResult.Skip((pageNumber - 1) * pageSize).Take(pageSize);
            //    return appliedFilterResult;
            //}
            ////var response = model.OrderByDescending(x => x.IsPinned);
            ////var response = model.Skip((pageNumber - 1) * pageSize).Take(pageSize).OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.CreatedOn);
            return model;

        }

        public async Task<IEnumerable<CombineClassCourseViewModel>> GetSchoolCourses(Guid? schoolId, string userId, int pageNumber)
        {
            var filters = await _userClassCourseFilterRepository.GetAll().Include(x => x.ClassCourseFilter).Where(x => x.SchoolId == schoolId && x.IsActive && x.ClassCourseFilterType == ClassCourseFilterEnum.Course).ToListAsync();

            int pageSize = 4;
            var courses = await GetCoursesBySchoolId(schoolId, userId, pageNumber, pageSize, filters);
            var savedClassCourse = await _savedClassCourseRepository.GetAll().ToListAsync();
            var sharedClassCourse = await _sharedClassCourseRepository.GetAll().ToListAsync();


            var model = new List<CombineClassCourseViewModel>();

            foreach (var courseDetails in courses)
            {
                var item = new CombineClassCourseViewModel();
                item.Id = courseDetails.CourseId;
                item.Avatar = courseDetails.Avatar;
                item.Accessibility = courseDetails.Accessibility;
                item.ServiceType = courseDetails.ServiceType;
                item.Description = courseDetails.Description;
                item.Name = courseDetails.CourseName;
                item.SchoolName = courseDetails.School.SchoolName;
                item.Price = courseDetails.Price;
                item.Rating = courseDetails.Rating;
                item.CreatedOn = courseDetails.CreatedOn;
                item.CreatedById = courseDetails.CreatedById;
                item.Type = ClassCourseEnum.Course;
                item.IsPinned = courseDetails.IsPinned;
                item.ThumbnailUrl = courseDetails.ThumbnailUrl;
                item.Tags = courseDetails.CourseTags;
                item.IsLikedByCurrentUser = courseDetails.IsCourseLikedByCurrentUser;
                item.CourseLikes = courseDetails.CourseLike;
                item.CourseViews = courseDetails.CourseViews;
                item.CommentsCount = courseDetails.CommentsCount;
                item.ThumbnailType = courseDetails.ThumbnailType;
                item.NoOfStudents = await _courseService.GetStudents(courseDetails.CourseId);
                item.Rating = courseDetails.Rating;
                item.IsCommentsDisabled = courseDetails.IsCommentsDisabled;
                item.IsClassCourseSavedByCurrentUser = savedClassCourse.Any(x => x.CourseId == courseDetails.CourseId && x.UserId == userId);
                item.SavedClassCourseCount = savedClassCourse.Where(x => x.CourseId == courseDetails.CourseId && x.UserId == userId).Count();
                item.SharedClassCourseCount = sharedClassCourse.Where(x => x.CourseId == courseDetails.CourseId).Count();
                model.Add(item);
            }


            //if (filters.Count() != 0)
            //{
            //    var appliedFilterResult = new List<CombineClassCourseViewModel>();
            //    foreach (var filter in filters)
            //    {
            //        if (filter.ClassCourseFilterType == ClassCourseFilterEnum.Course)
            //        {
            //            if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Free)
            //            {
            //                var freeCourseResult = model.Where(x => x.ServiceType.Type == "Free" && x.Type == ClassCourseEnum.Course).ToList();
            //                appliedFilterResult.AddRange(freeCourseResult);
            //            }

            //            if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Paid)
            //            {
            //                var paidCourseResult = model.Where(x => x.ServiceType.Type == "Paid" && x.Type == ClassCourseEnum.Course).ToList();
            //                appliedFilterResult.AddRange(paidCourseResult);
            //            }

            //            if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.MostStudents)
            //            {
            //                if (appliedFilterResult.Count() != 0)
            //                {
            //                    if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostStudents && x.ClassCourseFilterType == ClassCourseFilterEnum.Class))
            //                    {
            //                        var appliedMostStudentsOnCourse = model.Where(x => x.Type == ClassCourseEnum.Course).ToList();
            //                        appliedFilterResult.AddRange(appliedMostStudentsOnCourse);
            //                        appliedFilterResult = appliedFilterResult.OrderByDescending(x => x.NoOfStudents).ToList();
            //                    }
            //                    else
            //                    {
            //                        appliedFilterResult = appliedFilterResult.Where(x => x.Type == ClassCourseEnum.Course).OrderByDescending(x => x.NoOfStudents).ToList();
            //                    }
            //                }
            //                else
            //                {
            //                    appliedFilterResult = model.Where(x => x.Type == ClassCourseEnum.Course).OrderByDescending(x => x.NoOfStudents).ToList();
            //                }
            //            }

            //            if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.MostViewed)
            //            {
            //                if (appliedFilterResult.Count() != 0)
            //                {
            //                    if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.MostViewed && x.ClassCourseFilterType == ClassCourseFilterEnum.Class))
            //                    {
            //                        var appliedMostViewedOnCourse = model.Where(x => x.Type == ClassCourseEnum.Course).ToList();
            //                        appliedFilterResult.AddRange(appliedMostViewedOnCourse);
            //                        appliedFilterResult = appliedFilterResult.OrderByDescending(x => (x.CourseViews.Count() + x.ClassViews.Count())).ToList();
            //                    }
            //                    else
            //                    {
            //                        appliedFilterResult = appliedFilterResult.Where(x => x.Type == ClassCourseEnum.Course).OrderByDescending(x => x.CourseViews.Count()).ToList();
            //                    }
            //                }
            //                else
            //                {
            //                    appliedFilterResult = model.Where(x => x.Type == ClassCourseEnum.Course).OrderByDescending(x => x.CourseViews.Count()).ToList();
            //                }
            //            }

            //            if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.TopRated)
            //            {
            //                if (appliedFilterResult.Count() != 0)
            //                {
            //                    if (filters.Any(x => x.ClassCourseFilter.FilterType == FilterTypeEnum.TopRated && x.ClassCourseFilterType == ClassCourseFilterEnum.Class))
            //                    {
            //                        var appliedTopRatedOnCourse = model.Where(x => x.Type == ClassCourseEnum.Course).ToList();
            //                        appliedFilterResult.AddRange(appliedTopRatedOnCourse);
            //                        appliedFilterResult = appliedFilterResult.OrderByDescending(x => x.Rating).ToList();
            //                    }
            //                }
            //                else
            //                {
            //                    appliedFilterResult = model.Where(x => x.Type == ClassCourseEnum.Course).OrderByDescending(x => x.Rating).ToList();
            //                }
            //            }

            //            if (filter.ClassCourseFilter.FilterType == FilterTypeEnum.Name)
            //            {
            //                if (appliedFilterResult.Count() != 0)
            //                {
            //                    appliedFilterResult = appliedFilterResult.OrderBy(x => x.Name).ToList();
            //                }
            //                else
            //                {
            //                    appliedFilterResult = model.OrderBy(x => x.Name).ToList();
            //                }

            //            }
            //        }
            //    }
            //    //return appliedFilterResult.Skip((pageNumber - 1) * pageSize).Take(pageSize);
            //    return appliedFilterResult;
            //}
            ////var response = model.OrderByDescending(x => x.IsPinned);
            ////var response = model.Skip((pageNumber - 1) * pageSize).Take(pageSize).OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.CreatedOn);
            return model;

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
        public async Task<List<SchoolViewModel>> GetUserAllSchools(string userId)
        {
            var schools = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId).Select(x => new SchoolViewModel { SchoolId = x.SchoolId, SchoolName = x.SchoolName, Avatar = x.Avatar }).ToListAsync();
            return schools;

        }


        public async Task<SchoolsClassCourseViewModel> GetSchoolsClassCourse(IEnumerable<string> schoolIds)
        {
            var model = new SchoolsClassCourseViewModel();
            var classes = await _classRepository.GetAll().ToListAsync();
            var courses = await _courseRepository.GetAll().ToListAsync();


            foreach (var schoolId in schoolIds)
            {
                var requiredClasses = classes.Where(x => x.SchoolId == new Guid(schoolId)).Select(x => new ClassViewModel
                {
                    ClassId = x.ClassId,
                    ClassName = x.ClassName,
                    SchoolId = x.SchoolId,
                    CreatedById = x.CreatedById
                }).ToList();

                model.Classes.AddRange(requiredClasses);

                var requiredCourses = courses.Where(x => x.SchoolId == new Guid(schoolId)).Select(x => new CourseViewModel
                {
                    CourseId = x.CourseId,
                    CourseName = x.CourseName,
                    SchoolId = x.SchoolId,
                    CreatedById = x.CreatedById
                }).ToList();

                model.Courses.AddRange(requiredCourses);

            }
            return model;
        }

        public async Task<bool> SaveClassCourse(string userId, Guid id, ClassCourseEnum type)
        {

            var isSavedClassCourseExist = await _savedClassCourseRepository.GetAll().Where(x => x.UserId == userId && (x.ClassId == id || x.CourseId == id)).FirstOrDefaultAsync();

            if (isSavedClassCourseExist != null)
            {
                _savedClassCourseRepository.Delete(isSavedClassCourseExist.Id);
                _savedClassCourseRepository.Save();
                return false;
            }

            else
            {
                if (type == ClassCourseEnum.Class)
                {
                    var savedClassCourse = new SavedClassCourse
                    {
                        UserId = userId,
                        ClassId = id,
                        CreatedOn = DateTime.UtcNow
                    };
                    _savedClassCourseRepository.Insert(savedClassCourse);
                    _savedClassCourseRepository.Save();
                }
                else
                {
                    var savedClassCourse = new SavedClassCourse
                    {
                        UserId = userId,
                        CourseId = id,
                        CreatedOn = DateTime.UtcNow
                    };
                    _savedClassCourseRepository.Insert(savedClassCourse);
                    _savedClassCourseRepository.Save();
                }

                return true;

            }
        }

        public async Task<IEnumerable<CombineClassCourseViewModel>> GetSavedClassCourse(string userId, int pageNumber)
        {
            int pageSize = 9;
            var classList = await _savedClassCourseRepository.GetAll()
                .Include(x => x.Class).ThenInclude(x => x.Accessibility)
                .Include(x => x.Class).ThenInclude(x => x.ServiceType)
                .Include(x => x.Class).ThenInclude(x => x.School)
                .Where(x => x.UserId == userId && x.ClassId != null).Select(x => x.Class).ToListAsync();

            var classViewModelList = _mapper.Map<List<ClassViewModel>>(classList);
            var model = new List<CombineClassCourseViewModel>();

            var savedClassCourse = await _savedClassCourseRepository.GetAll().Include(x => x.Course).ToListAsync();
            var classTagList = await _classTagRepository.GetAll().ToListAsync();
            var courseTagList = await _courseTagRepository.GetAll().ToListAsync();

            foreach (var classDetails in classViewModelList)
            {
                var item = new CombineClassCourseViewModel();
                item.Id = classDetails.ClassId;
                item.Avatar = classDetails.Avatar;
                item.Accessibility = classDetails.Accessibility;
                item.ServiceType = classDetails.ServiceType;
                item.Description = classDetails.Description;
                item.Name = classDetails.ClassName;
                item.SchoolName = classDetails.School.SchoolName;
                item.Price = classDetails.Price;
                item.Rating = classDetails.Rating;
                item.CreatedOn = classDetails.CreatedOn;
                item.Type = ClassCourseEnum.Class;
                item.IsPinned = classDetails.IsPinned;
                item.StartDate = classDetails.StartDate;
                item.EndDate = classDetails.EndDate;
                item.ThumbnailUrl = classDetails.ThumbnailUrl;
                item.Tags = classTagList.Where(x => x.ClassId == classDetails.ClassId).Select(x => x.ClassTagValue).ToList();
                item.IsSavedClassCoursePinned = savedClassCourse.Any(x => x.UserId == userId && x.ClassId == classDetails.ClassId && x.IsPinned);
                item.ClassLikes = await _classService.GetLikesOnClass(classDetails.ClassId);
                if (item.ClassLikes.Any(x => x.UserId == userId && x.ClassId == classDetails.ClassId))
                {
                    item.IsLikedByCurrentUser = true;
                }
                else
                {
                    item.IsLikedByCurrentUser = false;
                }
                item.ClassViews = await _classService.GetViewsOnClass(classDetails.ClassId);
                item.CommentsCount = await _userService.GetCommentsCountOnPost(classDetails.ClassId);
                item.ThumbnailType = classDetails.ThumbnailType;
                item.NoOfStudents = await _classService.GetStudents(classDetails.ClassId);
                item.Rating = classDetails.Rating;
                item.IsClassCourseSavedByCurrentUser = savedClassCourse.Any(x => x.ClassId == classDetails.ClassId && x.UserId == userId);
                item.SavedClassCourseCount = savedClassCourse.Where(x => x.ClassId == classDetails.ClassId).Count();

                model.Add(item);
            }

            var courseList = await _savedClassCourseRepository.GetAll()
                 .Include(x => x.Course).ThenInclude(x => x.Accessibility)
                 .Include(x => x.Course).ThenInclude(x => x.ServiceType)
                 .Include(x => x.Course).ThenInclude(x => x.School)
                 .Where(x => x.UserId == userId && x.CourseId != null).Select(x => x.Course).ToListAsync();
            var courseViewModelList = _mapper.Map<List<CourseViewModel>>(courseList);

            foreach (var courseDetails in courseViewModelList)
            {
                var item = new CombineClassCourseViewModel();
                item.Id = courseDetails.CourseId;
                item.Avatar = courseDetails.Avatar;
                item.Accessibility = courseDetails.Accessibility;
                item.ServiceType = courseDetails.ServiceType;
                item.Description = courseDetails.Description;
                item.Name = courseDetails.CourseName;
                item.SchoolName = courseDetails.School.SchoolName;
                item.Price = courseDetails.Price;
                item.Rating = courseDetails.Rating;
                item.CreatedOn = courseDetails.CreatedOn;
                item.Type = ClassCourseEnum.Course;
                item.IsPinned = courseDetails.IsPinned;
                item.ThumbnailUrl = courseDetails.ThumbnailUrl;
                item.Tags = courseTagList.Where(x => x.CourseId == courseDetails.CourseId).Select(x => x.CourseTagValue).ToList();
                item.IsSavedClassCoursePinned = savedClassCourse.Any(x => x.UserId == userId && x.CourseId == courseDetails.CourseId && x.IsPinned);
                item.CourseLikes = await _courseService.GetLikesOnCourse(courseDetails.CourseId);

                if (item.CourseLikes.Any(x => x.UserId == userId && x.CourseId == courseDetails.CourseId))
                {
                    item.IsLikedByCurrentUser = true;
                }
                else
                {
                    item.IsLikedByCurrentUser = false;
                }

                //item.IsLikedByCurrentUser = courseDetails.IsCourseLikedByCurrentUser;
                item.CourseLikes = await _courseService.GetLikesOnCourse(courseDetails.CourseId);
                item.CourseViews = await _courseService.GetViewsOnCourse(courseDetails.CourseId);
                item.CommentsCount = await _userService.GetCommentsCountOnPost(courseDetails.CourseId);
                item.ThumbnailType = courseDetails.ThumbnailType;
                item.NoOfStudents = await _courseService.GetStudents(courseDetails.CourseId);
                item.Rating = courseDetails.Rating;
                item.IsClassCourseSavedByCurrentUser = savedClassCourse.Any(x => x.CourseId == courseDetails.CourseId && x.UserId == userId);
                item.SavedClassCourseCount = savedClassCourse.Where(x => x.CourseId == courseDetails.CourseId).Count();

                model.Add(item);
            }

            var response = model.Skip((pageNumber - 1) * pageSize).Take(pageSize).OrderByDescending(x => x.IsSavedClassCoursePinned).ThenByDescending(x => x.CreatedOn);
            return response;
        }


        public async Task<bool> PinUnpinSavedClassCourse(Guid id, bool isPinned, ClassCourseEnum type, string userId)
        {
            var savedClassCourse = new SavedClassCourse();
            if (type == ClassCourseEnum.Class)
            {
                savedClassCourse = await _savedClassCourseRepository.GetAll().Where(x => x.UserId == userId && x.ClassId == id).FirstOrDefaultAsync();
            }
            if (type == ClassCourseEnum.Course)
            {
                savedClassCourse = await _savedClassCourseRepository.GetAll().Where(x => x.UserId == userId && x.CourseId == id).FirstOrDefaultAsync();
            }

            if (savedClassCourse != null)
            {
                savedClassCourse.IsPinned = isPinned;
                _savedClassCourseRepository.Update(savedClassCourse);
                _savedClassCourseRepository.Save();
                return true;
            }

            return false;


        }

        public async Task EnableDisableSchool(Guid schoolId)
        {
            var school = _schoolRepository.GetById(schoolId);
            school.IsDisableByOwner = !school.IsDisableByOwner;
            _schoolRepository.Update(school);
            _schoolRepository.Save();

        }

        public async Task<bool> BanFollower(string followerId, Guid schoolId)
        {
            var follower = await _schoolFollowerRepository.GetAll().Where(x => x.UserId == followerId && x.SchoolId == schoolId).FirstOrDefaultAsync();

            if (follower != null)
            {
                follower.IsBan = true;
                _schoolFollowerRepository.Update(follower);
                _schoolFollowerRepository.Save();
                return true;
            }

            return false;



        }

        public async Task<bool> UnBanFollower(string followerId, string schoolId)
        {
            var follower = await _schoolFollowerRepository.GetAll().Where(x => x.UserId == followerId && x.SchoolId == Guid.Parse(schoolId)).FirstOrDefaultAsync();

            if (follower != null)
            {
                follower.IsBan = false;
                _schoolFollowerRepository.Update(follower);
                _schoolFollowerRepository.Save();

                var unfollow = new FollowUnFollowViewModel
                {
                    Id = schoolId
                };
                await FollowUnFollowSchool(unfollow, followerId);

                return true;
            }

            return false;



        }

        public async Task<IEnumerable<GlobalSearchViewModel>> SchoolsGlobalSearch(string searchString, int pageNumber, int pageSize)
        {
            var schools = await _schoolRepository.GetAll().Where(x => x.SchoolName.Contains(searchString)).Select(x => new GlobalSearchViewModel
            {
                Id = x.SchoolId,
                Name = x.SchoolName,
                Type = (int)PostAuthorTypeEnum.School,
                Avatar = x.Avatar
            }).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            return schools;

        }

        public async Task<List<AllSchoolFollowersViewModel>> GetAllSchoolFollowers(Guid schoolId)
        {
            //var followerList = await _schoolFollowerRepository.GetAll().Include(x => x.User)
            // .Where(x => x.SchoolId == schoolId && !x.IsBan).ToListAsync();


            var schoolTeacherUserids = await _schoolTeacherRepository.GetAll().Include(x => x.Teacher).Where(x => x.SchoolId == schoolId).Select(x => x.Teacher.UserId).ToListAsync();

            var followerList = await _schoolFollowerRepository.GetAll().Include(x => x.User)
 .Where(x => (!schoolTeacherUserids.Contains(x.UserId)) && x.SchoolId == schoolId && !x.IsBan).ToListAsync();

            var response = _mapper.Map<List<AllSchoolFollowersViewModel>>(followerList);
            return response;

        }

        public async Task<SchoolsClassCourseViewModel> GetSchoolClassCourseList(Guid schoolId)
        {
            var model = new SchoolsClassCourseViewModel();
            var classes = await _classRepository.GetAll().ToListAsync();
            var courses = await _courseRepository.GetAll().ToListAsync();


            var requiredClasses = classes.Where(x => x.SchoolId == schoolId).Select(x => new ClassViewModel
            {
                ClassId = x.ClassId,
                ClassName = x.ClassName,
                SchoolId = x.SchoolId,
                CreatedById = x.CreatedById
            }).ToList();

            model.Classes.AddRange(requiredClasses);

            var requiredCourses = courses.Where(x => x.SchoolId == schoolId).Select(x => new CourseViewModel
            {
                CourseId = x.CourseId,
                CourseName = x.CourseName,
                SchoolId = x.SchoolId,
                CreatedById = x.CreatedById
            }).ToList();

            model.Courses.AddRange(requiredCourses);
            return model;
        }

        public async Task<List<ClassesBySchoolViewModel>> GetClassListBySchoolId(Guid schoolId)
        {
            var classList = await _classRepository.GetAll().Where(x => x.SchoolId == schoolId && !x.IsCourse).Select(x => new ClassesBySchoolViewModel
            {
                ClassId = x.ClassId,
                ClassName = x.ClassName
            }).ToListAsync();

            return classList;
        }

        public async Task<StorageSpace> IsAvailableStorageSpace(Guid schoolId, double filesSizeInGigabyte, string userId)
        {
            var school = _schoolRepository.GetById(schoolId);
            var availableSpace = school.AvailableStorageSpace - filesSizeInGigabyte;

            //var userId = await getuserby

            var isNotificationSent = await _notificationRepository.GetAll().Where(x => x.NotificationType == NotificationTypeEnum.NotifyStorageExceed && x.UserId == userId).FirstOrDefaultAsync();

            if (availableSpace < 0)
            {
                var storageSpace = new StorageSpace();
                storageSpace.AvailableSpace = (double)availableSpace;
                if (isNotificationSent != null)
                {
                    storageSpace.IsStorageFullNotification = true;
                }
                else
                {
                    storageSpace.IsStorageFullNotification = false;
                }
                return storageSpace;
                //return (double)availableSpace;
            }
            else
            {
                var space = (double)availableSpace;
                string availableSpaceString = space.ToString("F2");
                double requiredAvailableSpace = Double.Parse(availableSpaceString);
                school.AvailableStorageSpace = requiredAvailableSpace;
                _schoolRepository.Update(school);
                _schoolRepository.Save();
                // return (double)availableSpace;
                var storageSpace = new StorageSpace();
                storageSpace.AvailableSpace = (double)availableSpace;
                if (isNotificationSent != null)
                {
                    storageSpace.IsStorageFullNotification = true;
                }
                else
                {
                    storageSpace.IsStorageFullNotification = false;
                }
                return storageSpace;
            }
        }

        //public async Task<List<SchoolFollower>> GetBannedUser(Guid schoolId, string userId)
        //{
        //    var isAllowed = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId && x.SchoolId == schoolId).FirstOrDefaultAsync();
        //    if (isAllowed == null)
        //    {
        //        return null;
        //    }
        //    var allUsers = await _schoolFollowerRepository.GetAll().Where(x => x.SchoolId == schoolId && x.IsBan).ToListAsync();
        //    return allUsers;
        //}


        public async Task<List<SchoolFollowerViewModel>> GetBannedUser(Guid schoolId, int pageNumber, string? searchString)
        {
            int pageSize = 13;
            var followerList = await _schoolFollowerRepository.GetAll().Include(x => x.User).Include(x => x.School)
             .Where(x => x.SchoolId == schoolId && x.IsBan && ((string.IsNullOrEmpty(searchString)) || (x.User.FirstName.Contains(searchString) || x.User.LastName.Contains(searchString)))).Skip((pageNumber - 1) * pageSize)
             .Take(pageSize).ToListAsync();

            var response = _mapper.Map<List<SchoolFollowerViewModel>>(followerList);
            return response;

        }

        public async Task<bool> SaveSharedClassCourse(string userId, Guid id, ClassCourseEnum type)
        {
            if (type == ClassCourseEnum.Class)
            {
                var sharedClassCourse = new SharedClassCourse
                {
                    UserId = userId,
                    ClassId = id,
                    CreatedOn = DateTime.UtcNow
                };

                _sharedClassCourseRepository.Insert(sharedClassCourse);
                _sharedClassCourseRepository.Save();
                return true;
            }

            if (type == ClassCourseEnum.Course)
            {
                var sharedClassCourse = new SharedClassCourse
                {
                    UserId = userId,
                    CourseId = id,
                    CreatedOn = DateTime.UtcNow
                };

                _sharedClassCourseRepository.Insert(sharedClassCourse);
                _sharedClassCourseRepository.Save();
                return true;
            }

            return false;

        }





    }
}
