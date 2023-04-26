using AutoMapper;
using LMS.Common.Enums;
using LMS.Common.ViewModels.Notification;
using LMS.Common.ViewModels.Stripe;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Stripe
{
    public class StripeService : IStripeService
    {
        private readonly IMapper _mapper;
        private readonly TokenService _tokenService;
        private readonly ChargeService _chargeService;
        private readonly CustomerService _customerService;
        private IGenericRepository<User> _userRepository;
        private IGenericRepository<School> _schoolRepository;
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<Course> _courseRepository;
        private IGenericRepository<Transaction> _transactionRepository;
        private IGenericRepository<Post> _postRepository;
        private readonly INotificationService _notificationService;
        private readonly StripeClient _client;
        private IConfiguration _config;






        public StripeService(IMapper mapper, TokenService tokenService, ChargeService chargeService, CustomerService customerService, IGenericRepository<User> userRepository, IGenericRepository<School> schoolRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository, IGenericRepository<Transaction> transactionRepository, INotificationService notificationService, IGenericRepository<Post> postRepository, IConfiguration config)
        {
            _mapper = mapper;
            _tokenService = tokenService;
            _chargeService = chargeService;
            _customerService = customerService;
            _userRepository = userRepository;
            _schoolRepository = schoolRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _transactionRepository = transactionRepository;
            _postRepository = postRepository;
            _notificationService = notificationService;
            _config = config;
            _client = new StripeClient(_config.GetSection("Stripe")["SecretKey"]);
        }

        public async Task<string> CreateProduct(BuySubscriptionViewModel model)
        {
            string productId = "";
            if (model.ParentType == ClassCourseEnum.Class)
            {
                var classProduct = _classRepository.GetById(model.ParentId);
                if (classProduct.StripeProductId == null)
                {
                    var productOptions = new ProductCreateOptions
                    {
                        Name = model.ParentName,
                    };
                    var service = new ProductService();
                    var product = service.Create(productOptions);
                    productId = product.Id;
                    await AddStripeProductId(productId, model);
                }
                productId = classProduct.StripeProductId;

            }
            else
            {
                var courseProduct = _courseRepository.GetById(model.ParentId);
                if (courseProduct.StripeProductId == null)
                {
                    var productOptions = new ProductCreateOptions
                    {
                        Name = model.ParentName,
                    };
                    var service = new ProductService();
                    var product = service.Create(productOptions);
                    productId = product.Id;
                    await AddStripeProductId(productId, model);
                }
                productId = courseProduct.StripeProductId;


            }

            var priceService = new PriceService();
            var prices = await priceService.ListAsync(new PriceListOptions
            {
                Product = productId,
                Active = true
            });

            if (prices.Data.Count == 0)
            {
                await CreatePrice(productId, model.Amount);
            }
            return productId;
        }

        public async Task<string> CreatePrice(string productId, long amount)
        {
            var priceOptions = new PriceCreateOptions
            {
                UnitAmount = amount * 100,
                Currency = "usd",
                Recurring = null,
                Product = productId,
            };
            var service = new PriceService();
            var price = service.Create(priceOptions);

            return price.Id;
        }

        public async Task<string> CreateCheckout(string priceId, string userId, BuySubscriptionViewModel model)
        {
            var ownerId = "";
            if (model.ParentType == ClassCourseEnum.Class)
            {
                ownerId = await _classRepository.GetAll().Include(x => x.School).Where(x => x.ClassId == model.ParentId).Select(x => x.School.CreatedById).FirstAsync();
            }
            else
            {
                ownerId = await _courseRepository.GetAll().Include(x => x.School).Where(x => x.CourseId == model.ParentId).Select(x => x.School.CreatedById).FirstAsync();
            }

            var user = _userRepository.GetById(userId);
            int index = model.ExpiresOn.IndexOf('-');
            var expMonth = model.ExpiresOn.Substring(0, index);
            var expYear = model.ExpiresOn.Substring(index + 1);

            var options = new PaymentMethodCreateOptions
            {
                Type = "card",
                Card = new PaymentMethodCardOptions
                {
                    Number = model.CardNumber,
                    ExpMonth = 10,
                    ExpYear = 25,
                    Cvc = model.SecurityCode
                }
            };

            var paymentMethodService = new PaymentMethodService();
            var paymentMethod = await paymentMethodService.CreateAsync(options);

            // Set Customer options using
            var customerId = await GetStripeCustomerId(options.Card.Token, userId, user.Email, model);

            // Set the options for the payment we would like to create at Stripe
            var paymentIntentOptions = new PaymentIntentCreateOptions
            {
                Amount = model.Amount * 100,
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" },
                Customer = customerId,
                Description = "Service Payment",
                ReceiptEmail = user.Email,
                PaymentMethod = paymentMethod.Id,
                Confirm = true,
                Metadata = new Dictionary<string, string>
        {
            { "product_id", priceId },
            { "customer_name", model.FirstName + model.LastName },
            { "user_id", userId },
            { "owner_id", ownerId }

        }
            };

            var paymentIntentService = new PaymentIntentService();
            var paymentIntent = await paymentIntentService.CreateAsync(paymentIntentOptions);

            if (paymentIntent.Status == "requires_action" && paymentIntent.NextAction.Type == "use_stripe_sdk")
            {
                var options1 = new PaymentIntentConfirmOptions
                {
                    PaymentMethod = paymentMethod.Id,
                    ReturnUrl = "http://localhost:44472/stripe/succesCheckout",
                };
                var service2 = new PaymentIntentService();
                var confirmation = service2.Confirm(paymentIntent.Id, options1);
            }
            else
            {
                var options2 = new PaymentIntentConfirmOptions
                {
                    PaymentMethod = paymentMethod.Id,
                };
                var confirmation = paymentIntentService.Confirm(paymentIntent.Id, options2); // Confirm the PaymentIntent
            }

            return paymentIntent.ClientSecret;
        }

        public async Task<string> GetStripeCustomerId(string cardToken, string userId, string email, BuySubscriptionViewModel model)
        {
            var user = _userRepository.GetById(userId);
            if (user.StripeCustomerId == null)
            {
                CustomerCreateOptions customerOptions = new CustomerCreateOptions
                {
                    Name = model.FirstName + " " + model.LastName,
                    Email = email,
                    Source = cardToken,
                    Address = new AddressOptions
                    {
                        Line1 = "123 Main St",
                        Line2 = "Apt 4",
                        City = "San Francisco",
                        State = "CA",
                        PostalCode = "94111",
                        Country = "US"
                    }
                };

                // Create customer at Stripe
                Customer createdCustomer = await _customerService.CreateAsync(customerOptions, null);
                user.StripeCustomerId = createdCustomer.Id;
                _userRepository.Update(user);
                _userRepository.Save();
                return createdCustomer.Id;
            }
            return user.StripeCustomerId;

        }

        public async Task AddStripeProductId(string productId, BuySubscriptionViewModel model)
        {
            if (model.ParentType == ClassCourseEnum.Class)
            {
                var classes = _classRepository.GetById(model.ParentId);
                classes.StripeProductId = productId;

                _classRepository.Update(classes);
                _classRepository.Save();
            }
            else
            {
                var course = _courseRepository.GetById(model.ParentId);
                course.StripeProductId = productId;

                _courseRepository.Update(course);
                _courseRepository.Save();
            }
        }

        public async Task<TransactionViewModel> SaveTransaction(TransactionViewModel model)
        {
            //var isTransactionExist = await _transactionRepository.GetAll().Where(x => x.StripeProductId == model.StripeProductId && x.StripeCustomerId == model.StripeCustomerId).FirstAsync();
            //if (isTransactionExist != null)
            //{
            //    return null;
            //}

            string parentName = "";
            string avatar = "";
            string notificationContent = "";
            int noOfLectures = 0;
            Guid classId = new Guid();
            Guid courseId = new Guid();
            var user = await _userRepository.GetAll().Where(x => x.StripeCustomerId == model.StripeCustomerId).FirstAsync();
            var classes = await _classRepository.GetAll().Where(x => x.StripeProductId == model.StripeProductId).FirstOrDefaultAsync();
            if (classes == null)
            {
                var course = await _courseRepository.GetAll().Where(x => x.StripeProductId == model.StripeProductId).FirstOrDefaultAsync();
                parentName = course.CourseName;
                courseId = course.CourseId;
                avatar = course.Avatar;
                noOfLectures = await _postRepository.GetAll().Where(x => x.ParentId == course.CourseId).CountAsync();
                notificationContent = $"Your transaction is successful for course {course.CourseName}({noOfLectures} Lectures)";

            }
            else
            {
                parentName = classes.ClassName;
                classId = classes.ClassId;
                avatar = classes.Avatar;
                noOfLectures = await _postRepository.GetAll().Where(x => x.ParentId == classes.ClassId).CountAsync();
                notificationContent = $"Your transaction is successful for class {classes.ClassName}({noOfLectures} Lectures)";

            }
            var transaction = new Transaction
            {
                Amount = model.Amount,
                StripeCustomerId = model.StripeCustomerId,
                StripeProductId = model.StripeProductId,
                CreatedOn = DateTime.UtcNow,
                //Message = $"{user.FirstName + " " + user.LastName} paid ${model.Amount} for {parentName}",
                Message = $"<strong>{user.FirstName + " " + user.LastName}</strong> paid you <strong>${model.Amount}</strong> for <strong>{parentName}</strong> ({noOfLectures} Lectures)",

                UserId = model.UserId,
                ClassId = classId == new Guid() ? null : classId,
                CourseId = courseId == new Guid() ? null : courseId,
                OwnerId = model.OwnerId,
                TransactionType = TransactionTypeEnum.OwnedSchoolPayment
            };

            _transactionRepository.Insert(transaction);
            _transactionRepository.Save();

            var notificationViewModel = new NotificationViewModel();
            notificationViewModel.UserId = model.UserId;
            notificationViewModel.Avatar = avatar;
            notificationViewModel.NotificationContent = notificationContent;
            notificationViewModel.ChatTypeId = classId == null ? courseId : classId;
            await _notificationService.SaveTransactionNotification(notificationViewModel);
            return _mapper.Map<TransactionViewModel>(transaction);
        }

        public async Task<TransactionDetailsViewModel> GetSchoolTransactionDetails(TransactionParamViewModel model, string userId)
        {
            int pageSize = 10;
            var transactionDetails = new TransactionDetailsViewModel();
            var transactions = await _transactionRepository.GetAll()
                              .Include(x => x.User)
                              .Include(x => x.Class)
                              .Include(x => x.Course).Where(x => x.OwnerId == userId && x.TransactionType == TransactionTypeEnum.OwnedSchoolPayment && ((string.IsNullOrEmpty(model.SearchString)) || (x.User.FirstName.Contains(model.SearchString)) || (x.Course != null && x.Course.CourseName.Contains(model.SearchString)) || (x.Class != null && x.Class.ClassName.Contains(model.SearchString)) || (x.User.FirstName.Contains(model.SearchString)) || (x.User.FirstName + " " + x.User.LastName).ToLower().Contains(model.SearchString.ToLower())) && ((model.StartDate == null) || (model.EndDate == null) || (x.CreatedOn.Date >= model.StartDate.Value.Date && x.CreatedOn.Date <= model.EndDate.Value.Date))).OrderByDescending(x => x.CreatedOn).Skip((model.pageNumber - 1) * pageSize)
             .Take(pageSize).ToListAsync();

            var transactionResponse = _mapper.Map<List<TransactionViewModel>>(transactions);
            if (transactions.Count != 0)
            {
                transactionDetails.MonthlyIncome = await GetMonthlyIncome(userId);
                transactionDetails.SourceOfIncome = await _transactionRepository.GetAll().Where(x => x.TransactionType == TransactionTypeEnum.OwnedSchoolPayment).CountAsync();

            }
            transactionDetails.Transactions = transactionResponse;

            var userOwnedSchools = await _schoolRepository.GetAll().Where(x => x.CreatedById == userId).ToListAsync();

            if (userOwnedSchools.Count > 0)
            {
                transactionDetails.IsUserHasOwnedSchool = true;
            }

            return transactionDetails;
        }

        public async Task<TransactionDetailsViewModel> GetWithdrawDetails(TransactionParamViewModel model, string userId)
        {
            int pageSize = 10;
            var transactionDetails = new TransactionDetailsViewModel();
            var transactions = await _transactionRepository.GetAll().Where(x => x.OwnerId == userId && x.TransactionType == TransactionTypeEnum.Withdraw && ((string.IsNullOrEmpty(model.SearchString))) && ((model.StartDate == null) || (model.EndDate == null) || (x.CreatedOn.Date >= model.StartDate.Value.Date && x.CreatedOn.Date <= model.EndDate.Value.Date))).OrderByDescending(x => x.CreatedOn).Skip((model.pageNumber - 1) * pageSize)
             .Take(pageSize).ToListAsync();

            var transactionResponse = _mapper.Map<List<TransactionViewModel>>(transactions);
            transactionDetails.Transactions = transactionResponse;
            return transactionDetails;
        }

        public async Task<TransactionDetailsViewModel> GetAllTransactionDetails(TransactionParamViewModel model, string userId)
        {
            int pageSize = 10;
            var transactionDetails = new TransactionDetailsViewModel();
            var transactions = await _transactionRepository.GetAll()
                              .Include(x => x.User)
                              .Include(x => x.Class)
                              .Include(x => x.Course).Where(x => x.OwnerId == userId && ((string.IsNullOrEmpty(model.SearchString)) || (x.User.FirstName.Contains(model.SearchString)) || (x.Course != null && x.Course.CourseName.Contains(model.SearchString)) || (x.Class != null && x.Class.ClassName.Contains(model.SearchString)) || (x.User.FirstName.Contains(model.SearchString)) || (x.User.FirstName + " " + x.User.LastName).ToLower().Contains(model.SearchString.ToLower())) && ((model.StartDate == null) || (model.EndDate == null) || (x.CreatedOn.Date >= model.StartDate.Value.Date && x.CreatedOn.Date <= model.EndDate.Value.Date))).OrderByDescending(x => x.CreatedOn).Skip((model.pageNumber - 1) * pageSize)
             .Take(pageSize).ToListAsync();

            var transactionResponse = _mapper.Map<List<TransactionViewModel>>(transactions);
            transactionDetails.Transactions = transactionResponse;
            return transactionDetails;
        }



        public async Task<decimal> GetMonthlyIncome(string userId)
        {
            var startDate = DateTime.Now.AddMonths(-1);
            var endDate = DateTime.UtcNow;

            var amountList = await _transactionRepository.GetAll().Where(x => x.CreatedOn >= startDate && x.CreatedOn <= endDate).Select(x => x.Amount).ToListAsync();

            decimal totalMonthIncome = 0.0m;
            // Calculate the total income for the time range
            foreach (var amount in amountList)
            {
                totalMonthIncome += amount;
            }

            return totalMonthIncome;

        }

        public async Task<string> Payout(PayoutViewModel model, string userId)
        {
            var user = _userRepository.GetById(userId);
            // get total money
            var balanceService = new BalanceService();
            var balance = await balanceService.GetAsync();
            var totalBalance = balance.Available.Sum(b => b.Amount);

            // create a bank account token
            var tokenOptions = new TokenCreateOptions
            {
                BankAccount = new TokenBankAccountOptions
                {
                    Country = model.Country,
                    Currency = "usd",
                    RoutingNumber = model.RoutingNumber,
                    AccountNumber = model.AccountNumber,
                    AccountHolderName = model.AccountHolderName,
                    AccountHolderType = model.AccountHolderType == AccountHolderTypeEnum.Individual ? BankAccountHolderType.Individual : BankAccountHolderType.Company,
                }
            };

            var tokenService = new TokenService();
            var token = tokenService.Create(tokenOptions);

            // create a bank account using the token
            var accountOptions = new AccountCreateOptions
            {
                Type = AccountType.Standard,
                Country = model.Country,
                Email = user.Email,
                ExternalAccount = token.Id,

                BusinessProfile = new AccountBusinessProfileOptions
                {
                    ProductDescription = "Product Description",
                    SupportPhone = "4155552671",
                    Url = "https://byokul.com",
                },

            };

            var accountService = new AccountService();
            var account = await  accountService.CreateAsync(accountOptions);
            var bankAccount = account.ExternalAccounts.Data.FirstOrDefault(e => e.Object == "bank_account");

            // transfer money to the bank account
            var transferOptions = new TransferCreateOptions
            {
                Amount = long.Parse(model.Amount),
                Currency = "usd",
                Destination = account.Id
            };

            var transferService = new TransferService();
            var transfer = transferService.Create(transferOptions);
            // here we will store the withdraw information and we will return amount to the frontend to show withdraw ammount if transfer successful

            await SaveWithdrawDetails(model.Amount,userId,model.AccountNumber);
            return model.Amount;
        }

        public async Task SaveWithdrawDetails(string amount, string userId, string accountNumber)
        {
            string maskedAccountNumber = new string('*', Math.Max(0, accountNumber.Length - 4)) + accountNumber.Substring(Math.Max(0, accountNumber.Length - 4));

            var transaction = new Transaction
            {
                Amount = decimal.Parse(amount),
                OwnerId = userId,
                Message = $"You have withdrawn <strong>${amount}</strong> to <strong>Bank Account</strong> ({maskedAccountNumber})",
                CreatedOn = DateTime.UtcNow,
                TransactionType = TransactionTypeEnum.Withdraw
            };

            _transactionRepository.Insert(transaction);
            _transactionRepository.Save();
        }
    }




}
