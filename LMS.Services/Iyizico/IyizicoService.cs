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
using System.Reflection.Metadata;
using Hangfire;
using LMS.Data.Entity.Iyizico;
using Org.BouncyCastle.Crypto.Macs;
using Class = LMS.Data.Entity.Class;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using LMS.Services.Common;

namespace LMS.Services.FileStorage
{
    public class IyizicoService : IIyizicoService
    {
        private readonly IMapper _mapper;
        private IConfiguration _config;
        private readonly IGenericRepository<SchoolSubscriptionPlan> _schoolSubscriptionPlanRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<SchoolTransaction> _schoolTransactionRepository;
        private readonly IGenericRepository<SchoolClassCourseTransaction> _schoolClassCourseTransactionRepository;
        private readonly IGenericRepository<School> _schoolRepository;
        private readonly IGenericRepository<Class> _classRepository;
        private readonly IGenericRepository<Course> _courseRepository;
        private readonly IGenericRepository<Student> _studentRepository;
        private readonly IGenericRepository<ClassStudent> _classStudentRepository;
        private readonly IGenericRepository<CourseStudent> _courseStudentRepository;
        private readonly IGenericRepository<CardUserKey> _cardUserKeyRepository;
        private readonly IGenericRepository<CardRenewal> _cardRenewalRepository;
        private readonly IGenericRepository<SchoolSubscription> _schoolSubscriptionRepository;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<ChatHubs> _hubContext;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly UserManager<User> _userManager;
        private readonly ICommonService _commonService;


        public IyizicoService(IMapper mapper, IConfiguration config, IGenericRepository<SchoolSubscriptionPlan> schoolSubscriptionPlanRepository, IGenericRepository<User> userRepository, IGenericRepository<SchoolTransaction> schoolTransactionRepository, IGenericRepository<SchoolClassCourseTransaction> schoolClassCourseTransactionRepository, IGenericRepository<School> schoolRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository, IGenericRepository<Student> studentRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<CourseStudent> courseStudentRepository, IGenericRepository<CardUserKey> cardUserKeyRepository, IGenericRepository<CardRenewal> cardRenewalRepository, IGenericRepository<SchoolSubscription> schoolSubscriptionRepository, INotificationService notificationService, IHubContext<ChatHubs> hubContext, IWebHostEnvironment webHostEnvironment, UserManager<User> userManager, ICommonService commonService)
        {
            _mapper = mapper;
            _config = config;
            _schoolSubscriptionPlanRepository = schoolSubscriptionPlanRepository;
            _userRepository = userRepository;
            _schoolTransactionRepository = schoolTransactionRepository;
            _schoolClassCourseTransactionRepository = schoolClassCourseTransactionRepository;
            _schoolRepository = schoolRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _studentRepository = studentRepository;
            _classStudentRepository = classStudentRepository;
            _courseStudentRepository = courseStudentRepository;
            _cardUserKeyRepository = cardUserKeyRepository;
            _cardRenewalRepository = cardRenewalRepository;
            _schoolSubscriptionRepository = schoolSubscriptionRepository;
            _notificationService = notificationService;
            _hubContext = hubContext;
            _webHostEnvironment = webHostEnvironment;
            _userManager = userManager;
            _commonService = commonService;
        }

        //public async Task<BuySchoolSubscriptionViewModel> BuySchoolSubscription(BuySchoolSubscriptionViewModel model, string userId, Guid schoolId)
        //{
        //    string responseMessage = "";
        //    model.ConversationId = Guid.NewGuid().ToString();
        //    var schoolSubscriptionModel = new BuySchoolSubscriptionViewModel();
        //    var planName = Guid.NewGuid().ToString();
        //    Options options = new Options
        //    {
        //        ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
        //        SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
        //        BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
        //    };


        //    try
        //    {
        //        var userSchoolsCount = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId && !x.IsSchoolSubscribed).CountAsync();
        //        if (userSchoolsCount == 1 && model.SubscriptionReferenceId == IzicoSubscriptions.Monthly.ToLower())
        //        {
        //            model.SubscriptionReferenceId = IzicoSubscriptions.MonthlyWithFreeTrial;
        //            model.SubscriptionStartDate = DateTime.UtcNow.AddDays(30);
        //            model.SubscriptionEndDate = DateTime.UtcNow.AddDays(60);
        //        }

        //        if (userSchoolsCount == 1 && model.SubscriptionReferenceId == IzicoSubscriptions.Yearly)
        //        {
        //            model.SubscriptionReferenceId = IzicoSubscriptions.YearlyWithFreeTrial;
        //            model.SubscriptionStartDate = DateTime.UtcNow.AddDays(30);
        //            model.SubscriptionEndDate = DateTime.UtcNow.AddDays(395);
        //        }

        //        if (model.SubscriptionReferenceId == IzicoSubscriptions.Monthly)
        //        {
        //            model.SubscriptionStartDate = DateTime.UtcNow;
        //            model.SubscriptionEndDate = DateTime.UtcNow.AddDays(30);
        //        }

        //        if (model.SubscriptionReferenceId == IzicoSubscriptions.Yearly)
        //        {
        //            model.SubscriptionStartDate = DateTime.UtcNow;
        //            model.SubscriptionEndDate = DateTime.UtcNow.AddDays(365);
        //        }


        //        model.SubscriptionStartDate = DateTime.UtcNow;
        //        model.SubscriptionEndDate = DateTime.UtcNow.AddDays(365);


        //        var user = _userRepository.GetById(userId);
        //        var country = user.CountryName;

        //        var response = InitializeSubscription(model, userId, model.SubscriptionReferenceId, options);


        //        //if (response.Status == "failure")
        //        //{
        //        //    return response.ErrorMessage;
        //        //}

        //        //return Constants.Success;

        //        if (response.Status == "failure")
        //        {
        //            responseMessage = response.ErrorMessage;
        //        }
        //        else
        //        {
        //            responseMessage = Constants.Success;
        //        }
        //        //var responseMessage = InitializeSubscription(model, userId, model.SubscriptionReferenceId, options);
        //        schoolSubscriptionModel.SubscriptionMessage = responseMessage;
        //        schoolSubscriptionModel.ConversationId = model.ConversationId;

        //        if (response.Status == "success")
        //        {
        //            await SaveSchoolTransaction(userId, schoolId, model.ConversationId, response.Data.ReferenceCode, null, null, false, 0);


        //        }
        //        return schoolSubscriptionModel;

        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }

        //}

        public async Task<string> BuySchoolSubscription(BuySchoolSubscriptionViewModel model, string userId, Guid schoolId)
        {
            Data.Entity.Plan plan;
            string amount = "";
            var user = _userRepository.GetById(userId);
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            var userSchoolsCount = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId && !x.IsSchoolSubscribed).CountAsync();


            amount = "20";
            CreatePaymentRequest request = new CreatePaymentRequest();
            request.Locale = Locale.TR.ToString();
            request.ConversationId = Guid.NewGuid().ToString();
            request.Price = amount;
            request.PaidPrice = amount;
            request.Currency = Currency.TRY.ToString();
            request.Installment = 1;
            request.BasketId = Guid.NewGuid().ToString();
            request.PaymentChannel = PaymentChannel.WEB.ToString();
            request.PaymentGroup = PaymentGroup.PRODUCT.ToString();
            request.CallbackUrl = "https://bb1a-122-176-18-127.ngrok-free.app/iyizico/callback";

            //request.CallbackUrl = "https://byokul.com/iyizico/callback";

            var expMonth = model.ExpiresOn.Substring(0, Math.Min(2, model.ExpiresOn.Length));
            int lastTwoStartIndex = Math.Max(0, model.ExpiresOn.Length - 2);
            var expYear = model.ExpiresOn.Substring(lastTwoStartIndex);
            var cardNumber = model.CardNumber.Replace("-", "");

            PaymentCard paymentCard = new PaymentCard();
            //paymentCard.CardHolderName = model.AccountHolderName;
            //paymentCard.CardNumber = cardNumber;
            //paymentCard.ExpireMonth = expMonth;
            //paymentCard.ExpireYear = expYear;
            //paymentCard.Cvc = model.SecurityCode;
            //paymentCard.RegisterCard = 0;
            //request.PaymentCard = paymentCard;
            var buyer = await GetBuyer(user);
            request.Buyer = buyer;

            var shippingAddress = GetShiipingAddress(user);
            request.ShippingAddress = shippingAddress;
            request.BillingAddress = shippingAddress;

            List<BasketItem> basketItems = new List<BasketItem>();
            BasketItem firstBasketItem = new BasketItem();
            firstBasketItem.Id = "BI101";
            firstBasketItem.Name = "Binocular";
            firstBasketItem.Category1 = "Collectibles";
            firstBasketItem.Category2 = "Accessories";
            firstBasketItem.ItemType = BasketItemType.PHYSICAL.ToString();
            firstBasketItem.Price = amount;
            basketItems.Add(firstBasketItem);
            request.BasketItems = basketItems;




            // Saving card fot the first time

            if (string.IsNullOrEmpty(model.CardUserKey))
            {
                CreateCardRequest cardRequest = new CreateCardRequest();
                cardRequest.Locale = Locale.TR.ToString();
                cardRequest.ConversationId = Guid.NewGuid().ToString();
                cardRequest.Email = user.Email;
                cardRequest.ExternalId = "";

                CardInformation cardInformation = new CardInformation();
                cardInformation.CardAlias = "card alias";
                cardInformation.CardHolderName = model.AccountHolderName;
                cardInformation.CardNumber = model.CardNumber;
                cardInformation.ExpireMonth = expMonth;
                cardInformation.ExpireYear = expYear;
                cardRequest.Card = cardInformation;
                Iyzipay.Model.Card card = Card.Create(cardRequest, options);


                if (card.Status == Status.SUCCESS.ToString())
                {
                    var cardUserKey = new CardUserKey
                    {
                        Id = Guid.NewGuid(),
                        Email = user.Email,
                        CardKey = card.CardUserKey
                    };

                    _cardUserKeyRepository.Insert(cardUserKey);
                    _cardUserKeyRepository.Save();
                }

                paymentCard.CardToken = card.CardToken;
                paymentCard.CardUserKey = card.CardUserKey;
            }


            // if user select from dropdown
            else if (!string.IsNullOrEmpty(model.CardToken))
            {
                paymentCard.CardUserKey = model.CardUserKey;
                paymentCard.CardToken = model.CardToken;
            }

            else
            {
                CreateCardRequest cardRequest = new CreateCardRequest();
                cardRequest.Locale = Locale.TR.ToString();
                cardRequest.ConversationId = Guid.NewGuid().ToString();
                cardRequest.CardUserKey = model.CardUserKey;

                CardInformation cardInformation = new CardInformation();
                cardInformation.CardAlias = "card alias";
                cardInformation.CardHolderName = model.AccountHolderName;
                cardInformation.CardNumber = model.CardNumber;
                cardInformation.ExpireMonth = expMonth;
                cardInformation.ExpireYear = expYear;
                cardRequest.Card = cardInformation;

                Iyzipay.Model.Card card = Iyzipay.Model.Card.Create(cardRequest, options);

                paymentCard.CardToken = card.CardToken;
                paymentCard.CardUserKey = card.CardUserKey;
            }

            request.PaymentCard = paymentCard;

            if (model.IsCardSaved)
            {
                SaveCardRenewal(schoolId, paymentCard.CardToken, paymentCard.CardUserKey);
            }

            if (userSchoolsCount == 1 && model.SubscriptionReferenceId == IzicoSubscriptions.Monthly.ToLower())
            {
                //model.SubscriptionReferenceId = IzicoSubscriptions.MonthlyWithFreeTrial;
                //model.SubscriptionStartDate = DateTime.UtcNow.AddDays(30);
                //model.SubscriptionEndDate = DateTime.UtcNow.AddDays(60);

                await HandleSchoolSubscription(userId, schoolId);
                return Constants.Success;
            }

            if (userSchoolsCount == 1 && model.SubscriptionReferenceId == IzicoSubscriptions.Yearly.ToLower())
            {
                //model.SubscriptionReferenceId = IzicoSubscriptions.YearlyWithFreeTrial;
                //model.SubscriptionStartDate = DateTime.UtcNow.AddDays(30);
                //model.SubscriptionEndDate = DateTime.UtcNow.AddDays(395);

                await HandleSchoolSubscription(userId, schoolId);
                return Constants.Success;
            }

            else
            {
                //var retrievePlanRequest = new RetrievePlanRequest()
                //{
                //    PricingPlanReferenceCode = model.SubscriptionReferenceId
                //};
                //var plan = Plan.Retrieve(retrievePlanRequest, options);

                //////To Do: here we will doing conversion
                //amount = plan.Data.Price;
                //amount = "20";
                //CreatePaymentRequest request = new CreatePaymentRequest();
                //request.Locale = Locale.TR.ToString();
                //request.ConversationId = Guid.NewGuid().ToString();
                //request.Price = amount;
                //request.PaidPrice = amount;
                //request.Currency = Currency.TRY.ToString();
                //request.Installment = 1;
                //request.BasketId = Guid.NewGuid().ToString();
                //request.PaymentChannel = PaymentChannel.WEB.ToString();
                //request.PaymentGroup = PaymentGroup.PRODUCT.ToString();
                //request.CallbackUrl = "https://byokul.com/iyizico/callback";

                //var expMonth = model.ExpiresOn.Substring(0, Math.Min(2, model.ExpiresOn.Length));
                //int lastTwoStartIndex = Math.Max(0, model.ExpiresOn.Length - 2);
                //var expYear = model.ExpiresOn.Substring(lastTwoStartIndex);
                //var cardNumber = model.CardNumber.Replace("-", "");

                //PaymentCard paymentCard = new PaymentCard();
                ////paymentCard.CardHolderName = model.AccountHolderName;
                ////paymentCard.CardNumber = cardNumber;
                ////paymentCard.ExpireMonth = expMonth;
                ////paymentCard.ExpireYear = expYear;
                ////paymentCard.Cvc = model.SecurityCode;
                ////paymentCard.RegisterCard = 0;
                ////request.PaymentCard = paymentCard;
                //var buyer = await GetBuyer(user);
                //request.Buyer = buyer;

                //var shippingAddress = GetShiipingAddress(user);
                //request.ShippingAddress = shippingAddress;
                //request.BillingAddress = shippingAddress;

                //List<BasketItem> basketItems = new List<BasketItem>();
                //BasketItem firstBasketItem = new BasketItem();
                //firstBasketItem.Id = "BI101";
                //firstBasketItem.Name = "Binocular";
                //firstBasketItem.Category1 = "Collectibles";
                //firstBasketItem.Category2 = "Accessories";
                //firstBasketItem.ItemType = BasketItemType.PHYSICAL.ToString();
                //firstBasketItem.Price = amount;
                //basketItems.Add(firstBasketItem);
                //request.BasketItems = basketItems;




                //// Saving card fot the first time

                //if (string.IsNullOrEmpty(model.CardUserKey))
                //{
                //    CreateCardRequest cardRequest = new CreateCardRequest();
                //    cardRequest.Locale = Locale.TR.ToString();
                //    cardRequest.ConversationId = Guid.NewGuid().ToString();
                //    cardRequest.Email = user.Email;
                //    cardRequest.ExternalId = "";

                //    CardInformation cardInformation = new CardInformation();
                //    cardInformation.CardAlias = "card alias";
                //    cardInformation.CardHolderName = model.AccountHolderName;
                //    cardInformation.CardNumber = model.CardNumber;
                //    cardInformation.ExpireMonth = expMonth;
                //    cardInformation.ExpireYear = expYear;
                //    cardRequest.Card = cardInformation;
                //    Iyzipay.Model.Card card = Card.Create(cardRequest, options);


                //    if (card.Status == Status.SUCCESS.ToString())
                //    {
                //        var cardUserKey = new CardUserKey
                //        {
                //            Id = Guid.NewGuid(),
                //            Email = user.Email,
                //            CardKey = card.CardUserKey
                //        };

                //        _cardUserKeyRepository.Insert(cardUserKey);
                //        _cardUserKeyRepository.Save();
                //    }

                //    paymentCard.CardToken = card.CardToken;
                //    paymentCard.CardUserKey = card.CardUserKey;
                //}


                //// if user select from dropdown
                //else if (!string.IsNullOrEmpty(model.CardToken))
                //{
                //    paymentCard.CardUserKey = model.CardUserKey;
                //    paymentCard.CardToken = model.CardToken;
                //}

                //else
                //{
                //    CreateCardRequest cardRequest = new CreateCardRequest();
                //    cardRequest.Locale = Locale.TR.ToString();
                //    cardRequest.ConversationId = Guid.NewGuid().ToString();
                //    cardRequest.CardUserKey = model.CardUserKey;

                //    CardInformation cardInformation = new CardInformation();
                //    cardInformation.CardAlias = "card alias";
                //    cardInformation.CardHolderName = model.AccountHolderName;
                //    cardInformation.CardNumber = model.CardNumber;
                //    cardInformation.ExpireMonth = expMonth;
                //    cardInformation.ExpireYear = expYear;
                //    cardRequest.Card = cardInformation;

                //    Iyzipay.Model.Card card = Iyzipay.Model.Card.Create(cardRequest, options);

                //    paymentCard.CardToken = card.CardToken;
                //    paymentCard.CardUserKey = card.CardUserKey;
                //}

                //request.PaymentCard = paymentCard;

                ThreedsInitialize threedsInitialize = ThreedsInitialize.Create(request, options);

                if (threedsInitialize.Status == "success")
                {
                    model.ConversationId = threedsInitialize.ConversationId;

                    if (model.SubscriptionReferenceId == IzicoSubscriptions.Monthly.ToLower())
                    {
                        plan = Data.Entity.Plan.Monthly;
                    }
                    else
                    {
                        plan = Data.Entity.Plan.Yearly;
                    }


                    await SaveSchoolTransaction(userId, schoolId, model.ConversationId, null, null, null, false, 0, plan);
                    return threedsInitialize.HtmlContent;
                }

                return "ErrorMessage" + threedsInitialize.ErrorMessage + "Status" + threedsInitialize.Status + "ErrorCode" + threedsInitialize.ErrorCode;

            }

        }

        public void SaveCardRenewal(Guid schoolId, string cardToken, string cardUserKey)
        {
            var cardRenewal = new CardRenewal
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                CardToken = cardToken,
                CardUserKey = cardUserKey
            };

            _cardRenewalRepository.Insert(cardRenewal);
            _cardRenewalRepository.Save();
        }


        public async Task HandleSchoolSubscription(string userId, Guid schoolId)
        {
            //await SaveSchoolTransaction(userId, schoolId, string.Empty, null, null, null, false, 0);
            var school = _schoolRepository.GetById(schoolId);
            school.IsSchoolSubscribed = true;
            _schoolRepository.Update(school);
            _schoolRepository.Save();
            //var scheduleJobId = BackgroundJob.Schedule(() => BuyInternationalSchoolSubscription(model, userId, schoolId), new DateTimeOffset(postViewModel.DateTime.Value));
            var scheduleJobId = BackgroundJob.Schedule(() => CancelSubscribedSchoolStatus(schoolId, Data.Entity.Plan.Monthly), new DateTimeOffset(DateTime.UtcNow.AddMinutes(4)));
        }
        public async Task CancelSubscribedSchoolStatus(Guid schoolId, Data.Entity.Plan plan)
        {
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            var isCardRenewalExist = _cardRenewalRepository.GetAll().Where(x => x.SchoolId == schoolId).FirstOrDefault();
            if (isCardRenewalExist != null)
            {
                //

                RetrieveCardListRequest request = new RetrieveCardListRequest();
                request.Locale = Locale.TR.ToString();
                request.CardUserKey = isCardRenewalExist.CardUserKey;

                CardList cardList = CardList.Retrieve(request, options);

                var requiredCard = cardList.CardDetails.Where(x => x.CardToken == isCardRenewalExist.CardToken).FirstOrDefault();



            }


            var school = _schoolRepository.GetById(schoolId);
            school.IsSchoolSubscribed = false;
            _schoolRepository.Update(school);
            _schoolRepository.Save();
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

        public ResponseData<SubscriptionCreatedResource> InitializeSubscription(BuySchoolSubscriptionViewModel model, string userId, string pricingPlanReferenceCode, Options options)
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
                    BillingAddress = new Iyzipay.Model.Address
                    {
                        City = user.StateName,
                        Country = user.CountryName,
                        Description = "billing-address-description",
                        ContactName = user.FirstName + " " + user.LastName,
                        //ZipCode = "010101"
                    },
                    ShippingAddress = new Iyzipay.Model.Address
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

            return response;
            //if (response.Status == "failure")
            //{
            //    return response.ErrorMessage;
            //}

            //return Constants.Success;
        }

        public async Task SaveSchoolTransaction(string userId, Guid schoolId, string ConversationId, string subscriptionReferenceId, string paymentId, string message, bool isActive, int amount, Data.Entity.Plan plan)
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
                Message = message != null ? message : null,
                Amount = amount,
                Plan = plan
            };

            _schoolTransactionRepository.Insert(schoolTransaction);
            _schoolTransactionRepository.Save();
        }

        public async Task UpdateSchoolTransaction(string conversationId, string paymentId, bool isInternationalUser)
        {
            bool isActive = false;
            string message = "";
            int scheduleDays = 0;
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
                        int amount = 0;
                        var payment = new RetrievePaymentRequest
                        {
                            PaymentId = paymentId,
                            PaymentConversationId = conversationId
                        };
                        var paymentDetails = Payment.Retrieve(payment, options);

                        if (paymentDetails.Status == "success")
                        {
                            int dotIndex = paymentDetails.PaidPrice.IndexOf('.');

                            string paidPrice = paymentDetails.PaidPrice.Substring(0, dotIndex);

                            amount = int.Parse(paidPrice);

                            if (paymentDetails.PaidPrice == "1.00000000")
                            {
                                message = $"Your 30 days free trial start for School {transaction.School.SchoolName}";
                            }
                            else
                            {
                                message = $"Your transaction of {amount} is successful for School {transaction.School.SchoolName}";
                            }
                            isActive = true;
                            await SendSchoolNotification(transaction, message);
                        }

                        await SaveSchoolTransaction(transaction.UserId, transaction.SchoolId.Value, transaction.ConversationId, transaction.SubscriptionReferenceCode, paymentId, message, isActive, amount, transaction.Plan.Value);

                        var school = _schoolRepository.GetById(transaction.SchoolId);
                        school.IsSchoolSubscribed = true;
                        _schoolRepository.Update(school);
                        _schoolRepository.Save();

                        //if (isInternationalUser)
                        //{

                        // here we need to schedule with month or year
                        if (transaction.Plan == Data.Entity.Plan.Monthly)
                        {
                            scheduleDays = 30;
                        }

                        if (transaction.Plan == Data.Entity.Plan.Yearly)
                        {
                            scheduleDays = 365;
                        }


                        var scheduleJobId = BackgroundJob.Schedule(() => CancelSubscribedSchoolStatus(school.SchoolId, transaction.Plan.Value), new DateTimeOffset(DateTime.UtcNow.AddMinutes(4)));
                        //}
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

        public async Task UpdateSchoolClassCourseTransaction(string conversationId, string paymentId)
        {
            string message = "";
            string paymentMessage = "";
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };


            CreateApprovalRequest request = new CreateApprovalRequest();
            request.Locale = Locale.TR.ToString();
            request.ConversationId = "64048bd1-d0d8-490c-9d16-9f9dde3be476";
            request.PaymentTransactionId = "23231805";

            Approval approval = Approval.Create(request, options);

            var payment = new RetrievePaymentRequest
            {
                PaymentId = paymentId,
                PaymentConversationId = conversationId
            };
            var paymentDetails = Payment.Retrieve(payment, options);

            int dotIndex = paymentDetails.PaidPrice.IndexOf('.');
            string paidPrice = paymentDetails.PaidPrice.Substring(0, dotIndex);
            int amount = int.Parse(paidPrice);

            if (paymentDetails.Status == "success")
            {
                var transaction = _schoolClassCourseTransactionRepository.GetAll().Where(x => x.ConversationId == conversationId && x.PaymentId == null).Include(x => x.User).Include(x => x.School).Include(x => x.Class).Include(x => x.Course).FirstOrDefault();

                // here we check if school payment then we add a job after 30 days
                if (transaction.SchoolId != null)
                {
                    await UpdateSchoolSubscription((Guid)transaction.SchoolId, transaction.ActionDoneBy,true);
                    //await ScheduleSchoolPayment(transaction);
                    var scheduleJobId = BackgroundJob.Schedule(() => UpdateSchoolSubscription((Guid)transaction.SchoolId, transaction.ActionDoneBy,false), TimeSpan.FromMinutes(3));

                }
                if (transaction != null)
                {
                    var user = transaction.User;

                    if (transaction.SchoolId != null)
                    {
                        message = $"Your transaction of {amount} is successful for School {transaction.School.SchoolName}";
                        paymentMessage = user.FirstName + " " + user.LastName + "paid" + amount + "₺ for class" + transaction.School.SchoolName;
                        await SendSchoolClassCourseNotification(transaction, message, transaction.School.Avatar);
                    }

                    if (transaction.ClassId != null)
                    {
                        message = $"Your transaction of {amount} is successful for Class {transaction.Class.ClassName}";
                        paymentMessage = user.FirstName + " " + user.LastName + " " + "paid" + " " + amount + "₺ for class" + " " + transaction.Class.ClassName;
                        await AddClassStudent(transaction.ActionDoneBy, transaction.ClassId.Value);
                        await SendSchoolClassCourseNotification(transaction, message, transaction.Class.Avatar);
                    }
                    if (transaction.CourseId != null)
                    {
                        message = $"Your transaction of {amount} is successful for Course {transaction.Course.CourseName}";
                        paymentMessage = user.FirstName + " " + user.LastName + " " + "paid" + " " + amount + "₺ for course" + " " + transaction.Course.CourseName;
                        await AddCourseStudent(transaction.ActionDoneBy, transaction.CourseId.Value);
                        await SendSchoolClassCourseNotification(transaction, message, transaction.Course.Avatar);

                    }

                    transaction.IsActive = true;
                    transaction.Message = paymentMessage;
                    transaction.PaymentId = paymentId;
                    transaction.Amount = amount;
                    _schoolClassCourseTransactionRepository.Update(transaction);
                    _schoolClassCourseTransactionRepository.Save();

                }
                //else
                //{
                //    var schoolTransaction = _schoolTransactionRepository.GetAll().Where(x => x.ConversationId == conversationId && x.PaymentId == null).Include(x => x.School).FirstOrDefault();
                //    if (schoolTransaction != null)
                //    {
                //        await UpdateSchoolTransaction(conversationId, paymentId, true);
                //    }

                //}
            }
            if (paymentDetails.Status == "NOT_SUFFICIENT_FUNDS")
            {
                var classCourseTransaction = _schoolClassCourseTransactionRepository.GetAll().Where(x => x.ConversationId == conversationId && x.PaymentId == null).Include(x => x.Class).Include(x => x.Course).FirstOrDefault();
                if (classCourseTransaction.ClassId != null)
                {
                    message = $"Your transaction of {paymentDetails.PaidPrice} is failed for Class {classCourseTransaction.Class.ClassName}";
                    await SendSchoolClassCourseNotification(classCourseTransaction, message, classCourseTransaction.Class.Avatar);
                }
                else
                {
                    message = $"Your transaction of {paymentDetails.PaidPrice} is failed for Course {classCourseTransaction.Course.CourseName}";
                    await SendSchoolClassCourseNotification(classCourseTransaction, message, classCourseTransaction.Course.Avatar);
                }

            }
        }


        public async Task UpdateSchoolSubscription(Guid schoolId, string userId, bool isActive)
        {
            var schoolSubscription = await _schoolSubscriptionRepository.GetAll().Where(x => x.SchoolId == schoolId && x.CreatedById == userId).FirstOrDefaultAsync();
            if (schoolSubscription != null)
            {
                schoolSubscription.IsActive = isActive;
                _schoolSubscriptionRepository.Update(schoolSubscription);
                _schoolSubscriptionRepository.Save();
            }

            if (!isActive)
            {
                await SendRenewSubscriptionEmailToUser(userId, schoolId);
            }
        }

        public async Task SendRenewSubscriptionEmailToUser(string userId, string schoolId)
        {
            var user = _userRepository.GetById(userId);
            var school = _
            var path = _webHostEnvironment.ContentRootPath;
            var filePath = Path.Combine(path, "Email/renew-schoolSubscription.html");
            var text = System.IO.File.ReadAllText(filePath);
            text = text.Replace("[Recipient]", user.FirstName + " " + user.LastName);
            //text = text.Replace("[OwnerName]", OwnerName);

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            await _commonService.SendEmail(new List<string> { user.Email }, null, null, "Assigned Permissions", body: text, null, null);
        }

        public async Task SendSchoolClassCourseNotification(SchoolClassCourseTransaction model, string message, string avatar)
        {
            var notificationViewModel = new NotificationViewModel();
            notificationViewModel.UserId = model.ActionDoneBy;
            notificationViewModel.ActionDoneBy = model.ActionDoneBy;
            notificationViewModel.Avatar = avatar;
            notificationViewModel.NotificationContent = message;
            notificationViewModel.ChatTypeId = model.ClassId != null ? model.ClassId : model.CourseId != null ? model.CourseId : model.SchoolId != null ? model.SchoolId : null;
            //notificationViewModel.ChatTypeId = model.ClassId == null ? model.CourseId : model.ClassId;
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

        public async Task<string> BuySchoolClassCourse(BuySchoolClassCourseViewModel model, string userId)
        {



            var SSCOwner = new User();
            if (model.ParentType == SchoolClassCourseEnum.School)
            {
                SSCOwner = await _schoolRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.SchoolId == model.ParentId).Select(x => x.CreatedBy).FirstAsync();
            }
            if (model.ParentType == SchoolClassCourseEnum.Class)
            {
                SSCOwner = await _classRepository.GetAll().Include(x => x.School).ThenInclude(x => x.CreatedBy).Where(x => x.ClassId == model.ParentId).Select(x => x.School.CreatedBy).FirstAsync();
            }
            if (model.ParentType == SchoolClassCourseEnum.Course)
            {
                SSCOwner = await _courseRepository.GetAll().Include(x => x.School).ThenInclude(x => x.CreatedBy).Where(x => x.CourseId == model.ParentId).Select(x => x.School.CreatedBy).FirstAsync();
            }

            if (model.SchoolSubscriptionPlanId != null)
            {
                await SaveSchoolSubscription(model, userId);
            }

            string subMerchantKey = "";
            var user = _userRepository.GetById(userId);
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            CreateApprovalRequest request1 = new CreateApprovalRequest();
            request1.Locale = Locale.TR.ToString();
            request1.ConversationId = "b2cd204e-bc6a-4427-bd38-14d9a56d3bdf";
            request1.PaymentTransactionId = "23239117";

            Approval approval = Approval.Create(request1, options);

            CreatePaymentRequest request = new CreatePaymentRequest();
            request.Locale = Locale.TR.ToString();
            request.ConversationId = Guid.NewGuid().ToString();
            request.Price = model.Amount.ToString();
            request.PaidPrice = model.Amount.ToString();
            request.Currency = Currency.TRY.ToString();
            request.Installment = 1;
            request.BasketId = Guid.NewGuid().ToString();
            request.PaymentChannel = PaymentChannel.WEB.ToString();
            request.PaymentGroup = PaymentGroup.PRODUCT.ToString();
            //request.CallbackUrl = "https://byokul.com/iyizico/callback";
            request.CallbackUrl = "https://bb1a-122-176-18-127.ngrok-free.app/iyizico/callback";


            var paymentCard = await GetPaymentCard(model, user.Email);
            request.PaymentCard = paymentCard;
            var buyer = await GetBuyer(user);
            request.Buyer = buyer;

            var shippingAddress = GetShiipingAddress(user);
            request.ShippingAddress = shippingAddress;
            request.BillingAddress = shippingAddress;

            List<BasketItem> basketItems = new List<BasketItem>();
            BasketItem firstBasketItem = new BasketItem();
            firstBasketItem.Id = "BI101";
            firstBasketItem.Name = "Binocular";
            firstBasketItem.Category1 = "Collectibles";
            firstBasketItem.Category2 = "Accessories";
            firstBasketItem.ItemType = BasketItemType.PHYSICAL.ToString();
            firstBasketItem.Price = model.Amount.ToString();

            //create submerchant
            //if (model.SchoolSubscriptionPlanId == null)
            //{
            if (SSCOwner.IyzicoSubMerchantKey == null)
            {
                subMerchantKey = await CreateSubMerchent(SSCOwner);
                SSCOwner.IyzicoSubMerchantKey = subMerchantKey;
                _userRepository.Update(SSCOwner);
                _userRepository.Save();
            }
            else
            {
                subMerchantKey = SSCOwner.IyzicoSubMerchantKey;
            }

            var subMerchantPrice = (model.Amount * 80) / 100;
            firstBasketItem.SubMerchantKey = subMerchantKey;
            firstBasketItem.SubMerchantPrice = subMerchantPrice.ToString();
            //}


            basketItems.Add(firstBasketItem);
            request.BasketItems = basketItems;

            ThreedsInitialize threedsInitialize = ThreedsInitialize.Create(request, options);

            if (threedsInitialize.Status == "success")
            {
                model.ConversationId = threedsInitialize.ConversationId;
                await saveSchoolClassCourseTransaction(model, userId);
                return threedsInitialize.HtmlContent;
            }

            return "ErrorMessage" + threedsInitialize.ErrorMessage + "Status" + threedsInitialize.Status + "ErrorCode" + threedsInitialize.ErrorCode;
        }



        public async Task SaveSchoolSubscription(BuySchoolClassCourseViewModel model, string userId)
        {
            var isSchoolSubscriptionExist = await _schoolSubscriptionRepository.GetAll().Where(x => x.SchoolId == model.ParentId && x.SchoolSubscriptionPlanId == model.SchoolSubscriptionPlanId).FirstOrDefaultAsync();
            //if (isSchoolSubscriptionExist != null)
            //{
            //    isSchoolSubscriptionExist.IsActive = true;
            //    _schoolSubscriptionRepository.Update(isSchoolSubscriptionExist);
            //    _schoolSubscriptionRepository.Save();
            //}
            //else
            //{

            if (isSchoolSubscriptionExist == null)
            {
                var schoolSubscription = new SchoolSubscription
                {
                    SchoolId = model.ParentId,
                    SchoolSubscriptionPlanId = model.SchoolSubscriptionPlanId,
                    IsActive = false,
                    CreatedById = userId,
                    CreatedOn = DateTime.UtcNow
                };

                _schoolSubscriptionRepository.Insert(schoolSubscription);
                _schoolSubscriptionRepository.Save();
                //}
            }
        }
        public async Task<string> CreateSubMerchent(User user)
        {
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            CreateSubMerchantRequest request = new CreateSubMerchantRequest();
            request.Locale = Locale.TR.ToString();
            request.ConversationId = Guid.NewGuid().ToString();
            request.SubMerchantExternalId = Guid.NewGuid().ToString();
            request.SubMerchantType = SubMerchantType.PERSONAL.ToString();
            request.Address = "test class";
            request.ContactName = user.FirstName;
            request.ContactSurname = user.LastName;
            request.Email = user.Email;
            request.GsmNumber = "+909129202000";
            request.Name = user.FirstName + " " + user.LastName;
            request.LegalCompanyTitle = user.FirstName + "company";
            request.Iban = "TR180006200119000006672315";
            request.IdentityNumber = "31300864726";
            request.Currency = Currency.TRY.ToString();

            SubMerchant subMerchant = SubMerchant.Create(request, options);





            return subMerchant.SubMerchantKey;
        }

        public async Task saveSchoolClassCourseTransaction(BuySchoolClassCourseViewModel model, string userId)
        {
            string SSCOwnerId = "";
            if (model.ParentType == SchoolClassCourseEnum.School)
            {
                var school = _schoolRepository.GetById(model.ParentId);
                SSCOwnerId = school.CreatedById;
            }
            if (model.ParentType == SchoolClassCourseEnum.Class)
            {
                var classes = _classRepository.GetById(model.ParentId);
                SSCOwnerId = classes.CreatedById;
            }
            if (model.ParentType == SchoolClassCourseEnum.Course)
            {
                var course = _courseRepository.GetById(model.ParentId);
                SSCOwnerId = course.CreatedById;
            }
            var classCourseTransaction = new SchoolClassCourseTransaction
            {
                ActionDoneBy = userId,
                SSCOwnerId = SSCOwnerId,
                SchoolId = model.ParentType == SchoolClassCourseEnum.School ? model.ParentId : null,
                ClassId = model.ParentType == SchoolClassCourseEnum.Class ? model.ParentId : null,
                CourseId = model.ParentType == SchoolClassCourseEnum.Course ? model.ParentId : null,
                ConversationId = model.ConversationId,
                CreatedOn = DateTime.UtcNow,
                IsActive = false,
                Status = 1
            };

            _schoolClassCourseTransactionRepository.Insert(classCourseTransaction);
            _schoolClassCourseTransactionRepository.Save();
        }


        public async Task<PaymentCard> GetPaymentCard(BuySchoolClassCourseViewModel model, string email)
        {
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            PaymentCard paymentCard = new PaymentCard();
            //paymentCard.CardUserKey = "Tw1LwrcYkZrPgF/g4yolJjcnlus=";
            //paymentCard.CardToken = "v7dXoSwJvYYc68nCkytSF1tmxCs=";


            if (!String.IsNullOrEmpty(model.CardUserKey) && !String.IsNullOrEmpty(model.CardToken))
            {
                paymentCard.CardUserKey = model.CardUserKey;
                paymentCard.CardToken = model.CardToken;
            }
            else
            {
                var expMonth = model.ExpiresOn.Substring(0, Math.Min(2, model.ExpiresOn.Length));
                int lastTwoStartIndex = Math.Max(0, model.ExpiresOn.Length - 2);
                var expYear = model.ExpiresOn.Substring(lastTwoStartIndex);
                var cardNumber = model.CardNumber.Replace("-", "");

                paymentCard.CardHolderName = model.CardHolderName;
                paymentCard.CardNumber = cardNumber;
                paymentCard.ExpireMonth = expMonth;
                paymentCard.ExpireYear = expYear;
                paymentCard.Cvc = model.SecurityCode;

                if (model.IsSaveCardCheckboxSelected)
                {
                    paymentCard.RegisterCard = 1;
                }
                else
                {
                    paymentCard.RegisterCard = 0;
                }

                CreateCardRequest cardRequest = new CreateCardRequest();
                cardRequest.Locale = Locale.TR.ToString();
                cardRequest.ConversationId = Guid.NewGuid().ToString();
                cardRequest.Email = email;
                cardRequest.ExternalId = "";

                CardInformation cardInformation = new CardInformation();
                cardInformation.CardAlias = "card alias";
                cardInformation.CardHolderName = model.CardHolderName;
                cardInformation.CardNumber = model.CardNumber;
                cardInformation.ExpireMonth = expMonth;
                cardInformation.ExpireYear = expYear;
                cardRequest.Card = cardInformation;
                Iyzipay.Model.Card card = Card.Create(cardRequest, options);


                if (card.Status == Status.SUCCESS.ToString())
                {
                    var cardUserKey = new CardUserKey
                    {
                        Id = Guid.NewGuid(),
                        Email = email,
                        CardKey = card.CardUserKey
                    };

                    _cardUserKeyRepository.Insert(cardUserKey);
                    _cardUserKeyRepository.Save();
                }

            }

            return paymentCard;
        }


        public Address GetShiipingAddress(User user)
        {
            Address shippingAddress = new Address();
            shippingAddress.ContactName = user.FirstName + " " + user.LastName;
            shippingAddress.City = user.StateName;
            shippingAddress.Country = user.CountryName;
            shippingAddress.Description = "Description";  // mendatory?
            shippingAddress.ZipCode = "34742"; // mendatory?
            return shippingAddress;
        }

        public async Task<Buyer> GetBuyer(User user)
        {
            Buyer buyer = new Buyer();
            buyer.Id = Guid.NewGuid().ToString();
            buyer.Name = user.FirstName;
            buyer.Surname = user.LastName;
            buyer.GsmNumber = "+905350000000";   // check without +
            buyer.Email = user.Email;
            buyer.IdentityNumber = Guid.NewGuid().ToString();
            buyer.RegistrationDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            buyer.RegistrationAddress = "Description";  // is mendatory?
            buyer.Ip = "85.34.78.112";
            buyer.City = user.StateName;
            buyer.Country = user.CountryName;
            buyer.ZipCode = "34732";   // is mendatory?

            return buyer;
        }

        public async Task<TransactionsDetailsViewModel> GetSchoolTransactionDetails(TransactionParamViewModel model, string userId)
        {
            int pageSize = 10;
            var transactionDetails = new TransactionsDetailsViewModel();
            var transactions = await _schoolClassCourseTransactionRepository.GetAll()
                              .Include(x => x.User)
                              .Include(x => x.School).Where(x => (x.School != null && x.School.CreatedById == userId) && x.IsActive && ((string.IsNullOrEmpty(model.SearchString)) || (x.User.FirstName.Contains(model.SearchString)) || (x.User.LastName.Contains(model.SearchString) || (x.User.FirstName + " " + x.User.LastName).ToLower().Contains(model.SearchString.ToLower())) && ((model.StartDate == null) || (model.EndDate == null) || (x.CreatedOn.Date >= model.StartDate.Value.Date && x.CreatedOn.Date <= model.EndDate.Value.Date)))).OrderByDescending(x => x.CreatedOn).Skip((model.pageNumber - 1) * pageSize)
             .Take(pageSize).ToListAsync();
            transactions = transactions.DistinctBy(x => x.PaymentId).ToList();
            var transactionResponse = _mapper.Map<List<SchoolClassCourseTransactionViewModel>>(transactions);
            if (transactions.Count != 0)
            {
                //transactionDetails.MonthlyIncome = await GetMonthlyIncome(userId);
                transactionDetails.SourceOfIncome = await _schoolClassCourseTransactionRepository.GetAll().Include(x => x.Class).Include(x => x.Course).Where(x => (x.Class != null && x.Class.CreatedById == userId && x.PaymentId != null) || (x.Course != null && x.Course.CreatedById == userId && x.PaymentId != null)).CountAsync();

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
            var test = await _schoolClassCourseTransactionRepository.GetAll().ToListAsync();
            var transactions = await _schoolClassCourseTransactionRepository.GetAll()
                              .Include(x => x.User)
                              .Include(x => x.Class).ThenInclude(x => x.School).Include(x => x.Course).ThenInclude(x => x.School).Where(x => (x.Class != null && x.Class.CreatedById == userId && x.PaymentId != null) || (x.Course != null && x.Course.CreatedById == userId && x.PaymentId != null) && ((string.IsNullOrEmpty(model.SearchString)) || (x.User.FirstName.Contains(model.SearchString)) || (x.User.LastName.Contains(model.SearchString) || (x.User.FirstName + " " + x.User.LastName).ToLower().Contains(model.SearchString.ToLower())) && ((model.StartDate == null) || (model.EndDate == null) || (x.CreatedOn.Date >= model.StartDate.Value.Date && x.CreatedOn.Date <= model.EndDate.Value.Date)))).OrderByDescending(x => x.CreatedOn).Skip((model.pageNumber - 1) * pageSize)
             .Take(pageSize).ToListAsync();

            var transactionResponse = _mapper.Map<List<SchoolClassCourseTransactionViewModel>>(transactions);
            if (transactions.Count != 0)
            {
                //transactionDetails.MonthlyIncome = await GetMonthlyIncome(userId);
                transactionDetails.SourceOfIncome = await _schoolClassCourseTransactionRepository.GetAll().Include(x => x.Class).Include(x => x.Course).Where(x => (x.Class != null && x.Class.CreatedById == userId) || (x.Course != null && x.Course.CreatedById == userId)).CountAsync();

            }

            transactionDetails.ClassCourseTransactions = transactionResponse;
            var userOwnedSchools = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId).ToListAsync();

            if (userOwnedSchools.Count > 0)
            {
                transactionDetails.IsUserHasOwnedSchool = true;
            }

            return transactionDetails;
        }

        public async Task<TransactionsDetailsViewModel> GetAllTransactionDetails(TransactionParamViewModel model, string userId)
        {
            int pageSize = 10;
            var transactionDetails = new TransactionsDetailsViewModel();
            var transactions = await _schoolClassCourseTransactionRepository.GetAll()
                              .Include(x => x.User)
                              .Where(x => x.SSCOwnerId == userId && x.IsActive && ((string.IsNullOrEmpty(model.SearchString)) || (x.User.FirstName.Contains(model.SearchString)) || (x.User.LastName.Contains(model.SearchString) || (x.User.FirstName + " " + x.User.LastName).ToLower().Contains(model.SearchString.ToLower())) && ((model.StartDate == null) || (model.EndDate == null) || (x.CreatedOn.Date >= model.StartDate.Value.Date && x.CreatedOn.Date <= model.EndDate.Value.Date)))).OrderByDescending(x => x.CreatedOn).Skip((model.pageNumber - 1) * pageSize)
             .Take(pageSize).ToListAsync();
            transactions = transactions.DistinctBy(x => x.PaymentId).ToList();
            var transactionResponse = _mapper.Map<List<SchoolClassCourseTransactionViewModel>>(transactions);
            if (transactions.Count != 0)
            {
                //transactionDetails.MonthlyIncome = await GetMonthlyIncome(userId);
                transactionDetails.SourceOfIncome = await _schoolClassCourseTransactionRepository.GetAll().Include(x => x.Class).Include(x => x.Course).Where(x => (x.Class != null && x.Class.CreatedById == userId && x.PaymentId != null) || (x.Course != null && x.Course.CreatedById == userId && x.PaymentId != null)).CountAsync();

            }

            transactionDetails.AllTransactions = transactionResponse;
            var userOwnedSchools = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId).ToListAsync();

            //if (userOwnedSchools.Count > 0)
            //{
            //    transactionDetails.IsUserHasOwnedSchool = true;
            //}

            return transactionDetails;

        }


        public async Task<string> CancelSubscription(Guid schoolId)
        {
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            var schoolSubscription = await _schoolTransactionRepository.GetAll().Include(x => x.School).Where(x => x.SchoolId == schoolId && x.School.IsSchoolSubscribed).FirstOrDefaultAsync();

            if (schoolSubscription != null)
            {
                var subscriptionReferenceCode = schoolSubscription.SubscriptionReferenceCode;

                if (subscriptionReferenceCode != null)
                {

                    var cancelSubscriptionRequest = new CancelSubscriptionRequest
                    {
                        SubscriptionReferenceCode = subscriptionReferenceCode,
                    };
                    var response = Subscription.Cancel(cancelSubscriptionRequest, options);

                    if (response.Status == "success")
                    {
                        var school = _schoolRepository.GetById(schoolId);
                        school.IsSchoolSubscribed = false;
                        _schoolRepository.Update(school);
                        _schoolRepository.Save();
                        return response.Status;
                    }
                    else
                    {
                        return response.ErrorMessage;
                    }
                }

                else
                {
                    var school = _schoolRepository.GetById(schoolId);
                    school.IsSchoolSubscribed = false;
                    _schoolRepository.Update(school);
                    _schoolRepository.Save();
                    return Constants.Success;
                }

            }

            return "";

        }

        public async Task<string> RenewSubscription(Guid schoolId)
        {
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            //var schoolSubscription = await _schoolTransactionRepository.GetAll().Include(x => x.School).Where(x => x.SchoolId == schoolId && !x.School.IsSchoolSubscribed).FirstOrDefaultAsync();

            var schoolSubscription = await _schoolTransactionRepository.GetAll().Include(x => x.School).Where(x => x.SchoolId == schoolId && x.PaymentId != null).FirstOrDefaultAsync();

            if (schoolSubscription != null)
            {
                var subscriptionParams = new RetrieveSubscriptionRequest
                {
                    SubscriptionReferenceCode = schoolSubscription.SubscriptionReferenceCode,
                };

                var details = Subscription.Retrieve(subscriptionParams, options);


                //var payment = new RetrievePaymentRequest
                //{
                //    PaymentId = schoolSubscription.PaymentId,
                //    ConversationId = schoolSubscription.ConversationId
                //};
                //var paymentDetails = Payment.Retrieve(payment, options);
            }

            return "This school already has a subscription";

        }


        public async Task<string> RefundPayment(string paymentId, LMS.Common.Enums.SchoolClassCourseEnum type)
        {
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            var payment = new RetrievePaymentRequest
            {
                PaymentId = paymentId
            };
            var paymentDetails = Payment.Retrieve(payment, options);

            var PaymentTransactionId = paymentDetails.PaymentItems[0].PaymentTransactionId;
            var amount = paymentDetails.PaidPrice;

            CreateRefundRequest refundReq = new CreateRefundRequest
            {
                PaymentTransactionId = PaymentTransactionId,
                Price = amount
            };

            var refund = Refund.Create(refundReq, options);

            if (refund.Status == "success")
            {
                //if (type == LMS.Common.Enums.SchoolClassCourseEnum.School)
                //{
                //    var schoolTransaction = await _schoolTransactionRepository.GetAll().Where(x => x.PaymentId == paymentId).FirstAsync();
                //    schoolTransaction.IsRefund = true;
                //    _schoolTransactionRepository.Update(schoolTransaction);
                //    _schoolTransactionRepository.Save();
                //    return Constants.Success;

                //}
                //else
                //{
                var classCourseTransaction = await _schoolClassCourseTransactionRepository.GetAll().Where(x => x.PaymentId == paymentId).FirstAsync();
                classCourseTransaction.IsRefund = true;
                _schoolClassCourseTransactionRepository.Update(classCourseTransaction);
                _schoolClassCourseTransactionRepository.Save();
                return Constants.Success;
                //}


            }
            else
            {
                return refund.ErrorMessage;
            }

        }

        public void CloseIyizicoThreeDAuthWindow(string userId)
        {
            _hubContext.Clients.All.SendAsync("CloseIyizicoThreeDAuthWindow", true);
        }

        public async Task<List<CardList>> GetUserSavedCards(string email)
        {
            var CardLists = new List<CardList>();
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            //var isCardUserKeyExist = _cardUserKeyRepository.GetAll().Where(x => x.Email == email).FirstOrDefault();
            var isCardUserKeyExist = _cardUserKeyRepository.GetAll().Where(x => x.Email == email).ToList();

            foreach (var item in isCardUserKeyExist)
            {

                RetrieveCardListRequest request = new RetrieveCardListRequest();
                request.Locale = Locale.TR.ToString();
                request.CardUserKey = item.CardKey;


                CardList cardList = CardList.Retrieve(request, options);

                CardLists.Add(cardList);
            }

            return CardLists;

            //if (isCardUserKeyExist != null)
            //{

            //    RetrieveCardListRequest request = new RetrieveCardListRequest();
            //    request.Locale = Locale.TR.ToString();
            //    request.CardUserKey = isCardUserKeyExist.CardKey;


            //    CardList cardList = CardList.Retrieve(request, options);

            //    return cardList;


            //}
        }


        public async Task<bool> CreateCard(CardInformation cardInfo, string email)
        {
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            CreateCardRequest request = new CreateCardRequest();
            request.Locale = Locale.TR.ToString();
            request.ConversationId = Guid.NewGuid().ToString();
            request.Email = email;

            CardInformation cardInformation = new CardInformation();
            cardInformation.CardAlias = cardInfo.CardAlias;
            cardInformation.CardHolderName = cardInfo.CardHolderName;
            cardInformation.CardNumber = cardInfo.CardNumber;
            cardInformation.ExpireMonth = cardInfo.ExpireMonth;
            cardInformation.ExpireYear = cardInfo.ExpireYear;

            request.Card = cardInformation;

            Card card = Card.Create(request, options);
            //var cardUserKey = card.CardUserKey;

            if (card.Status == Status.SUCCESS.ToString())
            {
                var cardUserKey = new CardUserKey
                {
                    Id = Guid.NewGuid(),
                    Email = email,
                    CardKey = card.CardUserKey
                };

                _cardUserKeyRepository.Insert(cardUserKey);
                _cardUserKeyRepository.Save();

                return true;

            }

            return false;



        }

        public async Task<bool> RemoveCard(string cardUserKey, string cardToken)
        {
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            // Create a CardDeleteRequest
            DeleteCardRequest request = new DeleteCardRequest();
            request.Locale = Locale.TR.ToString();
            //request.ConversationId = "123456789";
            request.CardUserKey = cardUserKey;
            request.CardToken = cardToken;

            // Delete the card
            Card card = Card.Delete(request, options);
            if (card.Status == Status.SUCCESS.ToString())
            {
                return true;
            }

            return false;

        }

        //public async Task<CardList> RetrieveCards()
        //{
        //    Options options = new Options
        //    {
        //        ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
        //        SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
        //        BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
        //    };

        //    var isCardUserKeyExist = _cardUserKeyRepository.GetAll().Where(x => x.Email == email).FirstOrDefault();
        //    if (isCardUserKeyExist != null)
        //    {
        //        RetrieveCardListRequest request = new RetrieveCardListRequest();
        //        request.Locale = Locale.TR.ToString();
        //        request.CardUserKey = isCardUserKeyExist.CardKey;

        //        CardList cardList = CardList.Retrieve(request, options);

        //        return cardList;
        //    }


        //}



    }



}