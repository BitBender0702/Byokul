//using Abp.AspNetCore.SignalR.Hubs;
using BigBlueButtonAPI.Core;
using LMS.Data;
using LMS.Data.Entity;
using LMS.DataAccess.Automapper;
using LMS.DataAccess.GenericRepository;
using LMS.DataAccess.Repository;
using LMS.Services;
using LMS.Services.Account;
using LMS.Services.Admin;
using LMS.Services.BigBlueButton;
using LMS.Services.Blob;
using LMS.Services.Chat;
using LMS.Services.Common;
using LMS.Services;
using LMS.Services.Stripe;
using LMS.Services.Students;
using LMS.Services.UserDashboard;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Identity;
//using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Stripe;
using System.Text;
using Microsoft.Extensions.Azure;
using Azure.Storage.Blobs;
using LMS.Services.FileStorage;
using Hangfire;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.Http.Features;
using LMS.Services.Iyizico;
using LMS.Services.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddScoped<DbSeed>();

// Add service for Identity.

var configuration = builder.Configuration;

builder.Services.AddCors(options =>
{
    options.AddPolicy("EnableCORS", builder =>
    {
        builder.AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
    });

});

builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlServer(configuration.GetConnectionString("DataContext"));
});


builder.Services.Configure<BlobConfig>(configuration.GetSection("MyConfig"));
//builder.Services.AddAzureClients(builder =>
//{
//    builder.AddBlobServiceClient(configuration.GetSection("MyConfig: StorageConnection"));
//});
builder.Services.AddIdentity<User, IdentityRole>(option =>
{
    option.Password.RequireDigit = false;
    option.Password.RequiredLength = 5;
    option.Password.RequireLowercase = false;
    option.Password.RequireNonAlphanumeric = false;
    option.Password.RequireUppercase = true;
    option.SignIn.RequireConfirmedEmail = true;
    option.SignIn.RequireConfirmedEmail = true;
})
    .AddEntityFrameworkStores<DataContext>()
    .AddDefaultTokenProviders();


builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStudentsService, StudentsService>();
builder.Services.AddScoped<ISchoolService, SchoolService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IBlobService, BlobService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IBigBlueButtonService, BigBlueButtonService>();
builder.Services.AddScoped<ICommonService, CommonService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserDashboardService, UserDashboardService>();
builder.Services.AddScoped<IStripeService, StripeService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<IVideoLibraryService, VideoLibraryService>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped(typeof(IAsyncGenericRepository<>), typeof(AsyncGenericRepository<>));
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IIyizicoService, IyizicoService>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<ChargeService>();
builder.Services.AddScoped<TokenService>();
StripeConfiguration.ApiKey = configuration.GetSection("Stripe")["SecretKey"];

builder.Services.AddOptions();
builder.Services.AddHttpClient();
builder.Services.Configure<BigBlueButtonAPISettings>(configuration.GetSection("BigBlueButtonAPISettings"));
builder.Services.AddScoped<BigBlueButtonAPIClient>(provider =>
{
    var settings = provider.GetRequiredService<IOptions<BigBlueButtonAPISettings>>().Value;
    var factory = provider.GetRequiredService<IHttpClientFactory>();
    return new BigBlueButtonAPIClient(settings, factory.CreateClient());
});

builder.Services.AddLogging(loggingBuilder =>
{
    loggingBuilder.AddConfiguration(configuration.GetSection("Logging"));
});

// Add service for JWT.

builder.Services.AddAuthentication(options =>
 {
     options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
     options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
     options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
 })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidAudience = configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                // If the request is for our hub...
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    (path.StartsWithSegments("/chatHub")))
                {
                    // Read the token out of the query string
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });


builder.Services.AddAutoMapper(config =>
{
    config.AddProfile<SchoolProfile>();
    config.AddProfile<TeacherProfile>();
    config.AddProfile<ClassProfile>();
    config.AddProfile<StudentProfile>();
    config.AddProfile<CourseProfile>();
    config.AddProfile<CommonProfile>();
    config.AddProfile<ChatProfile>();
    config.AddProfile<NotificationProfile>();
});

builder.Services.AddStackExchangeRedisCache(options =>
{
    IConfigurationSection cacheConfiguration = configuration.GetSection("Caching:Redis");
    options.Configuration = cacheConfiguration["ConnectionString"];
    options.InstanceName = "SampleInstance";
});


builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                            Id = "Bearer"
                    }
                },
                new string[] {}
        }
    });
});

builder.Services.AddHangfire(config =>
{
    config.UseSqlServerStorage(configuration.GetConnectionString("DataContext"));
});

builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = long.MaxValue;
});

builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = long.MaxValue;
});

builder.Services.Configure<FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = long.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

builder.Services.AddHangfireServer();


builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromDays(1);
});

var app = builder.Build();
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("EnableCORS");
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseSwagger();
app.UseSwaggerUI();
app.UseHangfireDashboard();
app.UseMiddleware<UrlMiddleware>();



app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<ChatHubs>("/chatHub", options =>
    {
        options.Transports =
            HttpTransportType.WebSockets |
            HttpTransportType.LongPolling;
    });
});



app.Run();

public class Seeder
{
    public Seeder(WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            var seeder = scope.ServiceProvider.GetRequiredService<DbSeed>();
            seeder?.SeedAsync().Wait();
        }
    }
}
