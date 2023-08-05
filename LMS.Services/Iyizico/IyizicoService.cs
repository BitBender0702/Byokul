using AutoMapper;
using Iyzipay;
using Iyzipay.Model.V2.Subscription;
using Iyzipay.Model;
using Iyzipay.Request.V2.Subscription;
using LMS.Common.ViewModels.Stripe;
using LMS.Services.Iyizico;
using Microsoft.Extensions.Configuration;
using LMS.Common.ViewModels.Iyizico;
using Org.BouncyCastle.Asn1.Ocsp;
using Iyzipay.Model.V2;
using MimeKit.Encodings;
using LMS.Common.ViewModels.Common;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using Iyzipay.Request;
using Org.BouncyCastle.Asn1.X509;
using LMS.Common.ViewModels.Post;
using Azure.Core;
using LMS.Data.Entity.Common;
using LMS.Common.Enums;
using LMS.Data.Migrations;
using LMS.Common.ViewModels.Chat;
using LMS.Common.ViewModels.Notification;
using static iText.StyledXmlParser.Jsoup.Select.Evaluator;
using Microsoft.AspNetCore.SignalR;

namespace LMS.Services.FileStorage
{
    public class IyizicoService : IIyizicoService
    {
        private readonly IMapper _mapper;
        private IConfiguration _config;
        private readonly IGenericRepository<SchoolSubscriptionPlan> _schoolSubscriptionPlanRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<SchoolTransaction> _schoolTransactionRepository;
        private readonly IGenericRepository<ClassCourseTransaction> _classCourseTransactionRepository;
        private readonly IGenericRepository<School> _schoolRepository;
        private readonly IGenericRepository<Student> _studentRepository;
        private readonly IGenericRepository<ClassStudent> _classStudentRepository;
        private readonly IGenericRepository<CourseStudent> _courseStudentRepository;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<ChatHubs> _hubContext;


        public IyizicoService(IMapper mapper, IConfiguration config, IGenericRepository<SchoolSubscriptionPlan> schoolSubscriptionPlanRepository, IGenericRepository<User> userRepository, IGenericRepository<SchoolTransaction> schoolTransactionRepository, IGenericRepository<ClassCourseTransaction> classCourseTransactionRepository, IGenericRepository<School> schoolRepository, IGenericRepository<Student> studentRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<CourseStudent> courseStudentRepository, INotificationService notificationService, IHubContext<ChatHubs> hubContext)
        {
            _mapper = mapper;
            _config = config;
            _schoolSubscriptionPlanRepository = schoolSubscriptionPlanRepository;
            _userRepository = userRepository;
            _schoolTransactionRepository = schoolTransactionRepository;
            _classCourseTransactionRepository = classCourseTransactionRepository;
            _schoolRepository = schoolRepository;
            _studentRepository = studentRepository;
            _classStudentRepository = classStudentRepository;
            _courseStudentRepository = courseStudentRepository;
            _notificationService = notificationService;
            _hubContext = hubContext;
        }

        public async Task<BuySchoolSubscriptionViewModel> BuySchoolSubscription(BuySchoolSubscriptionViewModel model, string userId, Guid schoolId)
        {
            model.ConversationId = Guid.NewGuid().ToString();
            var schoolSubscriptionModel = new BuySchoolSubscriptionViewModel();
            var planName = Guid.NewGuid().ToString();
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };


            try
            {
                var userSchoolsCount = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId && !x.IsSchoolSubscribed).CountAsync();
                if (userSchoolsCount == 1 && model.SubscriptionReferenceId == IzicoSubscriptions.Monthly.ToLower())
                {
                    model.SubscriptionReferenceId = IzicoSubscriptions.MonthlyWithFreeTrial;
                    model.SubscriptionStartDate = DateTime.UtcNow.AddDays(30);
                    model.SubscriptionEndDate   = DateTime.UtcNow.AddDays(60);
                }

                if (userSchoolsCount == 1 && model.SubscriptionReferenceId == IzicoSubscriptions.Yearly)
                {
                    model.SubscriptionReferenceId = IzicoSubscriptions.YearlyWithFreeTrial;
                    model.SubscriptionStartDate = DateTime.UtcNow.AddDays(30);
                    model.SubscriptionEndDate = DateTime.UtcNow.AddDays(365);
                }

                var responseMessage = InitializeSubscription(model, userId, model.SubscriptionReferenceId, options);
                schoolSubscriptionModel.SubscriptionMessage = responseMessage;
                schoolSubscriptionModel.ConversationId = model.ConversationId;

                if (responseMessage == Constants.Success)
                {
                    await SaveSchoolTransaction(userId, schoolId, model.ConversationId, model.SubscriptionReferenceId, null, null, false);
                }
                return schoolSubscriptionModel;

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public async Task<ResponseData<ProductResource>> CreateProduct(BuySchoolSubscriptionViewModel model, Options oprtions)
        {
            var planName = Guid.NewGuid().ToString();
            CreateProductRequest productRequest = new CreateProductRequest
            {
                Description = "product-description",
                Locale = Locale.TR.ToString(),
                Name = planName,
            };

            var response = Product.Create(productRequest, oprtions);
            return response;
        }

        public string InitializeSubscription(BuySchoolSubscriptionViewModel model, string userId, string pricingPlanReferenceCode, Options options)
        {

            var user = _userRepository.GetById(userId);
            var expMonth = model.ExpiresOn.Substring(0, Math.Min(2, model.ExpiresOn.Length));

            int lastTwoStartIndex = Math.Max(0, model.ExpiresOn.Length - 2);
            var expYear = model.ExpiresOn.Substring(lastTwoStartIndex);

            int index = model.ExpiresOn.IndexOf('-');
            var cardNumber = model.CardNumber.Replace("-", "");
            // get user data from db
            string randomString = DateTime.Now.ToString("yyyyMMddHHmmssfff");
            SubscriptionInitializeRequest request = new SubscriptionInitializeRequest
            {
                Locale = Locale.TR.ToString(),
                Customer = new CheckoutFormCustomer
                {
                    Email = user.Email,
                    Name = user.FirstName,
                    Surname = user.LastName,
                    BillingAddress = new Address
                    {
                        City = user.StateName,
                        Country = user.CountryName,
                        Description = "billing-address-description",
                        ContactName = user.FirstName + " " + user.LastName,
                        //ZipCode = "010101"
                    },
                    ShippingAddress = new Address
                    {
                        City = user.StateName,
                        Country = user.CountryName,
                        Description = "shipping-address-description",
                        ContactName = "shipping-contact-name",
                        //ZipCode = "010102"
                    },

                    //GsmNumber = user.PhoneNumber,
                    GsmNumber = "+905350000000",
                    IdentityNumber = Guid.NewGuid().ToString()
                },
                PaymentCard = new CardInfo
                {
                    CardNumber = cardNumber,
                    CardHolderName = model.AccountHolderName,
                    ExpireMonth = expMonth,
                    ExpireYear = expYear,
                    Cvc = model.SecurityCode,
                    RegisterConsumerCard = true
                },

                ConversationId = model.ConversationId,
                PricingPlanReferenceCode = model.SubscriptionReferenceId.ToLower(),

            };



            ResponseData<SubscriptionCreatedResource> response = Subscription.Initialize(request, options);

            if (response.Status == "failure")
            {
                return response.ErrorMessage;
            }

            return Constants.Success;
        }

        public async Task SaveSchoolTransaction(string userId, Guid schoolId, string ConversationId, string subscriptionReferenceId, string paymentId, string message, bool isActive)
        {
            var schoolTransaction = new SchoolTransaction
            {
                UserId = userId,
                SchoolId = schoolId,
                ConversationId = ConversationId,
                CreatedOn = DateTime.Now,
                Status = 1,
                IsActive = paymentId != null ? true : false,
                PaymentId = paymentId != null ? paymentId : null,
                SubscriptionReferenceCode = subscriptionReferenceId,
                Message = message != null ? message : null
            };

            _schoolTransactionRepository.Insert(schoolTransaction);
            _schoolTransactionRepository.Save();
        }

        public async Task UpdateSchoolTransaction(string conversationId, string paymentId)
        {
            bool isActive = false;
            string message = "";
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            try
            {
                var schoolTransaction = _schoolTransactionRepository.GetAll().Where(x => x.ConversationId == conversationId && x.PaymentId == null).Include(x => x.School).FirstOrDefault();

                if (schoolTransaction != null)
                {
                    var transaction = _schoolTransactionRepository.GetAll().Include(x => x.School).Where(x => x.ConversationId == conversationId).FirstOrDefault();
                    if (transaction != null)
                    {

                        var payment = new RetrievePaymentRequest
                        {
                            PaymentId = paymentId,
                            PaymentConversationId = conversationId
                        };
                        var paymentDetails = Payment.Retrieve(payment, options);

                        if (paymentDetails.Status == "success")
                        {
                            if (paymentDetails.PaidPrice == "1.00000000")
                            {
                                message = $"Your 30 days free trial start for School {transaction.School.SchoolName}";
                            }
                            else
                            {
                                message = $"Your transaction of {paymentDetails.PaidPrice} is successful for School {transaction.School.SchoolName}";
                            }
                            isActive = true;
                            await SendSchoolNotification(transaction, message);
                        }

                        await SaveSchoolTransaction(transaction.UserId, transaction.SchoolId.Value, transaction.ConversationId, transaction.SubscriptionReferenceCode, paymentId, message, isActive);

                        var school = _schoolRepository.GetById(transaction.SchoolId);
                        school.IsSchoolSubscribed = true;
                        _schoolRepository.Update(school);
                        _schoolRepository.Save();
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }


        public async Task SendSchoolNotification(SchoolTransaction model, string message)
        {
            var notificationViewModel = new NotificationViewModel();
            notificationViewModel.UserId = model.UserId;
            notificationViewModel.ActionDoneBy = model.UserId;
            notificationViewModel.Avatar = model.School.Avatar;
            notificationViewModel.NotificationContent = message;
            notificationViewModel.ChatTypeId = model.SchoolId;
            await _notificationService.SaveTransactionNotification(notificationViewModel);
        }

        public async Task UpdateClassCourseTransaction(string conversationId, string paymentId)
        {
            string message = "";
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            var payment = new RetrievePaymentRequest
            {
                PaymentId = paymentId,
                PaymentConversationId = conversationId
            };
            var paymentDetails = Payment.Retrieve(payment, options);

            if (paymentDetails.Status == "success")
            {
                var classCourseTransaction = _classCourseTransactionRepository.GetAll().Where(x => x.ConversationId == conversationId && x.PaymentId == null).Include(x => x.Class).Include(x => x.Course).FirstOrDefault();

                if (classCourseTransaction != null)
                {
                    if (classCourseTransaction.ClassId != null)
                    {
                        message = $"Your transaction of {paymentDetails.PaidPrice} is successful for Class {classCourseTransaction.Class.ClassName}";
                        await AddClassStudent(classCourseTransaction.UserId, classCourseTransaction.ClassId.Value);
                        await SendClassCourseNotification(classCourseTransaction, message, classCourseTransaction.Class.Avatar);
                    }
                    else
                    {
                        message = $"Your transaction of {paymentDetails.PaidPrice} is successful for Course {classCourseTransaction.Course.CourseName}";
                        await AddCourseStudent(classCourseTransaction.UserId, classCourseTransaction.CourseId.Value);
                        await SendClassCourseNotification(classCourseTransaction, message, classCourseTransaction.Course.Avatar);

                    }

                    classCourseTransaction.IsActive = true;
                    classCourseTransaction.Message = message;
                    classCourseTransaction.PaymentId = paymentId;
                    classCourseTransaction.Message = message;
                    _classCourseTransactionRepository.Update(classCourseTransaction);
                    _classCourseTransactionRepository.Save();

                }
            }
            if (paymentDetails.Status == "NOT_SUFFICIENT_FUNDS")
            {
                var classCourseTransaction = _classCourseTransactionRepository.GetAll().Where(x => x.ConversationId == conversationId && x.PaymentId == null).Include(x => x.Class).Include(x => x.Course).FirstOrDefault();
                if (classCourseTransaction.ClassId != null)
                {
                    message = $"Your transaction of {paymentDetails.PaidPrice} is failed for Class {classCourseTransaction.Class.ClassName}";
                    await SendClassCourseNotification(classCourseTransaction, message, classCourseTransaction.Class.Avatar);
                }
                else
                {
                    message = $"Your transaction of {paymentDetails.PaidPrice} is failed for Course {classCourseTransaction.Course.CourseName}";
                    await SendClassCourseNotification(classCourseTransaction, message, classCourseTransaction.Course.Avatar);

                }

            }
        }


        public async Task SendClassCourseNotification(ClassCourseTransaction model, string message, string avatar)
        {
            var notificationViewModel = new NotificationViewModel();
            notificationViewModel.UserId = model.UserId;
            notificationViewModel.ActionDoneBy = model.UserId;
            notificationViewModel.Avatar = avatar;
            notificationViewModel.NotificationContent = message;
            notificationViewModel.ChatTypeId = model.ClassId == null ? model.CourseId : model.ClassId;
            await _notificationService.SaveTransactionNotification(notificationViewModel);
        }


        public async Task AddClassStudent(string userId, Guid classId)
        {
            var student = new Student();
            student = await _studentRepository.GetAll().Where(x => x.UserId == userId).FirstOrDefaultAsync();

            if (student == null)
            {
                student = await SaveStudent(userId);
            }

            var isClassStudentExist = await _classStudentRepository.GetAll().Where(x => x.ClassId == classId && x.StudentId == student.StudentId).FirstOrDefaultAsync();

            if (isClassStudentExist == null)
            {

                var classStudent = new ClassStudent
                {
                    ClassId = classId,
                    StudentId = student.StudentId
                };

                try
                {
                    _classStudentRepository.Insert(classStudent);
                    _classStudentRepository.Save();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }

        }

        public async Task AddCourseStudent(string userId, Guid courseId)
        {

            var student = new Student();
            student = await _studentRepository.GetAll().Where(x => x.UserId == userId).FirstOrDefaultAsync();

            if (student == null)
            {
                student = await SaveStudent(userId);
            }


            var isCourseStudentExist = await _courseStudentRepository.GetAll().Where(x => x.CourseId == courseId && x.StudentId == student.StudentId).FirstOrDefaultAsync();

            if (isCourseStudentExist == null)
            {
                var courseStudent = new CourseStudent
                {
                    CourseId = courseId,
                    StudentId = student.StudentId
                };

                _courseStudentRepository.Insert(courseStudent);
                _courseStudentRepository.Save();
            }
        }

        public async Task<Student> SaveStudent(string userId)
        {
            var user = _userRepository.GetById(userId);
            var student = new Student
            {
                StudentName = user.FirstName + " " + user.LastName,
                CreatedById = user.Id,
                CreatedOn = DateTime.UtcNow,
                IsDeleted = false,
                UserId = userId
            };

            _studentRepository.Insert(student);
            _studentRepository.Save();
            return student;
        }

        public bool ActivateSubscription(string subscriptionReferenceCode, Options options)
        {
            ActivateSubscriptionRequest request = new ActivateSubscriptionRequest
            {
                Locale = Locale.TR.ToString(),
                ConversationId = Guid.NewGuid().ToString(),
                SubscriptionReferenceCode = subscriptionReferenceCode
            };

            IyzipayResourceV2 response = Subscription.Activate(request, options);
            if (response.Status == Constants.Success)
            {
                return true;
            }
            return false;

        }

        public async Task<List<SchoolSubscriptionPlansViewModel>> GetSubscriptionPlans()
        {
            var subscriptionPlans = _schoolSubscriptionPlanRepository.GetAll().ToList();
            return _mapper.Map<List<SchoolSubscriptionPlansViewModel>>(subscriptionPlans);
        }

        public async Task<string> BuyClassCourse(BuyClassCourseViewModel model, string userId)
        {
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            CreatePaymentRequest request = new CreatePaymentRequest();
            request.Locale = Locale.TR.ToString();
            request.ConversationId = userId;
            request.Price = model.Amount.ToString();
            request.PaidPrice = model.Amount.ToString();
            request.Currency = Currency.TRY.ToString();
            request.Installment = 1;
            request.BasketId = Guid.NewGuid().ToString();
            request.PaymentChannel = PaymentChannel.WEB.ToString();
            request.PaymentGroup = PaymentGroup.PRODUCT.ToString();
            request.CallbackUrl = "https://byokul.com/iyizico/callback";

            var paymentCard = await GetPaymentCard(model);
            request.PaymentCard = paymentCard;
            var buyer = await GetBuyer(model);
            request.Buyer = buyer;


            Address shippingAddress = new Address();
            shippingAddress.ContactName = "Jane Doe";
            shippingAddress.City = "Istanbul";
            shippingAddress.Country = "Turkey";
            shippingAddress.Description = "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1";
            shippingAddress.ZipCode = "34742";
            request.ShippingAddress = shippingAddress;

            Address billingAddress = new Address();
            billingAddress.ContactName = "Jane Doe";
            billingAddress.City = "Istanbul";
            billingAddress.Country = "Turkey";
            billingAddress.Description = "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1";
            billingAddress.ZipCode = "34742";
            request.BillingAddress = billingAddress;

            List<BasketItem> basketItems = new List<BasketItem>();
            BasketItem firstBasketItem = new BasketItem();
            firstBasketItem.Id = "BI101";
            firstBasketItem.Name = "Binocular";
            firstBasketItem.Category1 = "Collectibles";
            firstBasketItem.Category2 = "Accessories";
            firstBasketItem.ItemType = BasketItemType.PHYSICAL.ToString();
            firstBasketItem.Price = model.Amount.ToString();
            basketItems.Add(firstBasketItem);
            request.BasketItems = basketItems;

            ThreedsInitialize threedsInitialize = ThreedsInitialize.Create(request, options);

            if (threedsInitialize.Status == "success")
            {
                model.ConversationId = threedsInitialize.ConversationId;
                await saveClassCourseTransaction(model, userId);
            }
            return threedsInitialize.HtmlContent;
        }

        public async Task saveClassCourseTransaction(BuyClassCourseViewModel model, string userId)
        {
            var classCourseTransaction = new ClassCourseTransaction
            {
                UserId = userId,
                ClassId = model.ParentType == ClassCourseEnum.Class ? model.ParentId : null,
                CourseId = model.ParentType == ClassCourseEnum.Course ? model.ParentId : null,
                ConversationId = model.ConversationId,
                CreatedOn = DateTime.UtcNow,
                IsActive = false,
                Status = 1
            };

            _classCourseTransactionRepository.Insert(classCourseTransaction);
            _classCourseTransactionRepository.Save();
        }


        public async Task<PaymentCard> GetPaymentCard(BuyClassCourseViewModel model)
        {
            var expMonth = model.ExpiresOn.Substring(0, Math.Min(2, model.ExpiresOn.Length));
            int lastTwoStartIndex = Math.Max(0, model.ExpiresOn.Length - 2);
            var expYear = model.ExpiresOn.Substring(lastTwoStartIndex);
            var cardNumber = model.CardNumber.Replace("-", "");

            PaymentCard paymentCard = new PaymentCard();
            paymentCard.CardHolderName = model.CardHolderName;
            paymentCard.CardNumber = cardNumber;
            paymentCard.ExpireMonth = expMonth;
            paymentCard.ExpireYear = expYear;
            paymentCard.Cvc = model.SecurityCode;
            paymentCard.RegisterCard = 0;
            return paymentCard;
        }

        public async Task<Buyer> GetBuyer(BuyClassCourseViewModel model)
        {
            Buyer buyer = new Buyer();
            buyer.Id = "BY789";
            buyer.Name = "Nikhil";
            buyer.Surname = "Vasdev";
            buyer.GsmNumber = "+905350000000";
            buyer.Email = "sagarnimma7@gmail.com";
            buyer.IdentityNumber = Guid.NewGuid().ToString();
            buyer.RegistrationDate = DateTime.UtcNow.ToString();
            buyer.RegistrationAddress = "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1";
            buyer.Ip = "85.34.78.112";
            buyer.City = "Istanbul";
            buyer.Country = "Turkey";
            buyer.ZipCode = "34732";

            return buyer;
        }

        public async Task<TransactionsDetailsViewModel> GetSchoolTransactionDetails(TransactionParamViewModel model, string userId)
        {
            int pageSize = 10;
            var transactionDetails = new TransactionsDetailsViewModel();
            var transactions = await _schoolTransactionRepository.GetAll()
                              .Include(x => x.User)
                              .Include(x => x.School).Where(x => x.UserId == userId && x.IsActive && ((string.IsNullOrEmpty(model.SearchString)) || (x.User.FirstName.Contains(model.SearchString)) || (x.User.LastName.Contains(model.SearchString) || (x.User.FirstName + " " + x.User.LastName).ToLower().Contains(model.SearchString.ToLower())) && ((model.StartDate == null) || (model.EndDate == null) || (x.CreatedOn.Date >= model.StartDate.Value.Date && x.CreatedOn.Date <= model.EndDate.Value.Date)))).OrderByDescending(x => x.CreatedOn).Skip((model.pageNumber - 1) * pageSize)
             .Take(pageSize).ToListAsync();

            var transactionResponse = _mapper.Map<List<SchoolTransactionViewModel>>(transactions);
            if (transactions.Count != 0)
            {
                //transactionDetails.MonthlyIncome = await GetMonthlyIncome(userId);
                transactionDetails.SourceOfIncome = await _classCourseTransactionRepository.GetAll().Include(x => x.Class).Include(x => x.Course).Where(x=> (x.Class != null && x.Class.CreatedById == userId) || (x.Course != null && x.Course.CreatedById == userId)).CountAsync();

            }

            transactionDetails.OwnedSchoolTransactions = transactionResponse;
            var userOwnedSchools = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId).ToListAsync();

            if (userOwnedSchools.Count > 0)
            {
                transactionDetails.IsUserHasOwnedSchool = true;
            }

            return transactionDetails;
        }

        public async Task<TransactionsDetailsViewModel> GetClassCourseTransactionDetails(TransactionParamViewModel model, string userId)
        {
            int pageSize = 10;
            var transactionDetails = new TransactionsDetailsViewModel();
            var transactions = await _classCourseTransactionRepository.GetAll()
                              .Include(x => x.User)
                              .Include(x => x.Class).ThenInclude(x => x.School).Include(x => x.Course).ThenInclude(x => x.School).Where(x => x.UserId == userId && ((string.IsNullOrEmpty(model.SearchString)) || (x.User.FirstName.Contains(model.SearchString)) || (x.User.LastName.Contains(model.SearchString) || (x.User.FirstName + " " + x.User.LastName).ToLower().Contains(model.SearchString.ToLower())) && ((model.StartDate == null) || (model.EndDate == null) || (x.CreatedOn.Date >= model.StartDate.Value.Date && x.CreatedOn.Date <= model.EndDate.Value.Date)))).OrderByDescending(x => x.CreatedOn).Skip((model.pageNumber - 1) * pageSize)
             .Take(pageSize).ToListAsync();

            var transactionResponse = _mapper.Map<List<ClassCourseTransactionViewModel>>(transactions);
            if (transactions.Count != 0)
            {
                //transactionDetails.MonthlyIncome = await GetMonthlyIncome(userId);
                transactionDetails.SourceOfIncome = await _classCourseTransactionRepository.GetAll().Include(x => x.Class).Include(x => x.Course).Where(x => (x.Class != null && x.Class.CreatedById == userId) || (x.Course != null && x.Course.CreatedById == userId)).CountAsync();

            }

            transactionDetails.ClassCourseTransactions = transactionResponse;
            var userOwnedSchools = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId).ToListAsync();

            if (userOwnedSchools.Count > 0)
            {
                transactionDetails.IsUserHasOwnedSchool = true;
            }

            return transactionDetails;
        }

        public void CloseIyizicoThreeDAuthWindow(string userId) {
            _hubContext.Clients.All.SendAsync("CloseIyizicoThreeDAuthWindow", true);
        }

    }



}