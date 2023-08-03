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

namespace LMS.Services.FileStorage
{
    public class IyizicoService : IIyizicoService
    {
        private readonly IMapper _mapper;
        private IConfiguration _config;
        private readonly IGenericRepository<SchoolSubscriptionPlan> _schoolSubscriptionPlanRepository;
        private readonly IGenericRepository<User> _userRepository;


        public IyizicoService(IMapper mapper, IConfiguration config, IGenericRepository<SchoolSubscriptionPlan> schoolSubscriptionPlanRepository, IGenericRepository<User> userRepository)
        {
            _mapper = mapper;
            _config = config;
            _schoolSubscriptionPlanRepository = schoolSubscriptionPlanRepository;
            _userRepository = userRepository;
        }

        public async Task BuySchoolSubscription(BuySchoolSubscriptionViewModel model, string userId)
        {
            var planName = Guid.NewGuid().ToString();
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            //var response = CreateProduct(model, options);

            // if first school we give trial period of 30 days other wise not.
            //CreatePlanRequest request = new CreatePlanRequest()
            //{
            //    Locale = Locale.TR.ToString(),
            //    Name = $"plan-name-{planName}",
            //    ConversationId = Guid.NewGuid().ToString(),
            //    TrialPeriodDays = 30,
            //    Price = "20",
            //    CurrencyCode = Currency.TRY.ToString(),
            //    PaymentInterval = PaymentInterval.MONTHLY.ToString(),
            //    PlanPaymentType = PlanPaymentType.RECURRING.ToString(),
            //    ProductReferenceCode = response.Result.Data.ReferenceCode
            //};

            try
            {
                var pricingModel = new RetrievePlanRequest
                {
                    PricingPlanReferenceCode = "4664d40e-3940-47a2-b13b-f81781e98ccd"
                };
                var test = Iyzipay.Model.V2.Subscription.Plan.Retrieve(pricingModel, options);
                // Make the subscription plan request
                //var subscriptionPlanResponse = Plan.Create(request, options);


                // subscription get

                var response = InitializeSubscription(model, userId, model.SubscriptionReferenceId, options);
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

            int index = model.ExpiresOn.IndexOf('-');
            var expMonth = model.ExpiresOn.Substring(0, index);
            var expYear = model.ExpiresOn.Substring(index + 1);
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

                ConversationId = Guid.NewGuid().ToString(),
                PricingPlanReferenceCode = model.SubscriptionReferenceId.ToLower()
            };



            ResponseData<SubscriptionCreatedResource> response = Subscription.Initialize(request, options);

            if (response.Status == "failure")
            {
                return response.ErrorMessage;
            }
            return "Success";
            var subs = new RetrieveSubscriptionRequest
            {
                SubscriptionReferenceCode = "4ab49c76-4f5f-4df5-83af-509d57ee091d"
            };
            var test = Subscription.Retrieve(subs, options);
            // store subscription id in db with school

            //ActivateSubscription(response.Data.ReferenceCode,options);
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
            if (response.Status == "Success")
            {
                return true;
            }
            return false;

        }

        public async Task<List<SchoolSubscriptionPlansViewModel>> GetSubscriptionPlans()
        {
            //var options = new Options
            //{
            //    ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
            //    SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
            //    BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            //};

            //var pagingRequest = new PagingRequest
            //{
            //    Page = 10,
            //    Count = 10,
            //    Locale = Locale.TR.ToString(),
            //    ConversationId = Guid.NewGuid().ToString()
            //};
            //var product = Product.RetrieveAll(pagingRequest, options).Data.Items.First(x => x.Name == "School ByOkul");

            //var planRequest = new RetrieveAllPlanRequest
            //{
            //    ProductReferenceCode = product.ReferenceCode
            //};
            //var subscriptionPlans = Plan.RetrieveAll(planRequest, options).Data.Items.Select(x => new SubscriptionPlans
            //{
            //    PlanName = x.Name,
            //    PlanReferenceCode = x.ReferenceCode,
            //});
            //return subscriptionPlans;


            var subscriptionPlans = _schoolSubscriptionPlanRepository.GetAll().ToList();

            return _mapper.Map<List<SchoolSubscriptionPlansViewModel>>(subscriptionPlans);



        }

        public async Task<Payment> BuyClassCourse(BuyClassCourseViewModel model, string userId)
        {
            Options options = new Options
            {
                ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")
            };

            CreatePaymentRequest request = new CreatePaymentRequest();
            request.Locale = Locale.TR.ToString();
            request.ConversationId = Guid.NewGuid().ToString();
            request.Price = model.Amount.ToString();
            request.PaidPrice = "1.2";
            request.Currency = Currency.TRY.ToString();
            request.Installment = 1;
            request.BasketId = "B67832";
            request.PaymentChannel = PaymentChannel.WEB.ToString();
            request.PaymentGroup = PaymentGroup.PRODUCT.ToString();

            var paymentCard = await GetPaymentCard(model);
            request.PaymentCard = paymentCard;

            Buyer buyer = new Buyer();
            buyer.Id = "BY789";
            buyer.Name = "John";
            buyer.Surname = "Doe";
            buyer.GsmNumber = "+905350000000";
            buyer.Email = "email@email.com";
            buyer.IdentityNumber = "74300864791";
            buyer.LastLoginDate = "2015-10-05 12:43:35";
            buyer.RegistrationDate = "2013-04-21 15:12:09";
            buyer.RegistrationAddress = "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1";
            buyer.Ip = "85.34.78.112";
            buyer.City = "Istanbul";
            buyer.Country = "Turkey";
            buyer.ZipCode = "34732";
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
            firstBasketItem.Price = "0.3";
            basketItems.Add(firstBasketItem);

            BasketItem secondBasketItem = new BasketItem();
            secondBasketItem.Id = "BI102";
            secondBasketItem.Name = "Game code";
            secondBasketItem.Category1 = "Game";
            secondBasketItem.Category2 = "Online Game Items";
            secondBasketItem.ItemType = BasketItemType.VIRTUAL.ToString();
            secondBasketItem.Price = "0.5";
            basketItems.Add(secondBasketItem);

            BasketItem thirdBasketItem = new BasketItem();
            thirdBasketItem.Id = "BI103";
            thirdBasketItem.Name = "Usb";
            thirdBasketItem.Category1 = "Electronics";
            thirdBasketItem.Category2 = "Usb / Cable";
            thirdBasketItem.ItemType = BasketItemType.PHYSICAL.ToString();
            thirdBasketItem.Price = "0.2";
            basketItems.Add(thirdBasketItem);
            request.BasketItems = basketItems;


            var response = Payment.Create(request, options);

            return response;
        }

        public async Task<PaymentCard> GetPaymentCard(BuyClassCourseViewModel model)
        {
            int index = model.ExpiresOn.IndexOf('-');
            var expMonth = model.ExpiresOn.Substring(0, index);
            var expYear = model.ExpiresOn.Substring(index + 1);
            var cardNumber = model.CardNumber.Replace("-", "");

            PaymentCard paymentCard = new PaymentCard();
            paymentCard.CardHolderName = model.AccountHolderName;
            paymentCard.CardNumber = cardNumber;
            paymentCard.ExpireMonth = expMonth;
            paymentCard.ExpireYear = expYear;
            paymentCard.Cvc = model.SecurityCode;
            paymentCard.RegisterCard = 0;
            return paymentCard;
        }





    }
}