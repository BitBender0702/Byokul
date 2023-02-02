using Abp.AspNetCore.SignalR.Hubs;
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
using LMS.Services.Stripe;
using LMS.Services.Students;
using LMS.Services.UserDashboard;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Stripe;
using System.Text;

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

builder.Services.AddIdentity<User, IdentityRole>(option =>
{
    option.Password.RequireDigit = false;
    option.Password.RequiredLength = 5;
    option.Password.RequireLowercase = false;
    option.Password.RequireNonAlphanumeric = false;
    option.Password.RequireUppercase = false;
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
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped(typeof(IAsyncGenericRepository<>), typeof(AsyncGenericRepository<>));

//builder.Services.Configure<IdentityOptions>(options =>
//{
//    options.Password.RequireDigit = false;
//    options.Password.RequiredLength = 5;
//    options.Password.RequireLowercase = false;
//    options.Password.RequireNonAlphanumeric = false;
//    options.Password.RequireUppercase = false;
//    options.SignIn.RequireConfirmedEmail = true;

//});

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

// Add service for JWT.

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme
    /*CookieAuthenticationDefaults.AuthenticationScheme*/)
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
});

builder.Services.AddSwaggerGen();
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

var app = builder.Build();
//var temp = new Seeder(app);
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("EnableCORS");
app.UseAuthentication();
app.UseAuthorization();
app.UseSwagger();
app.UseSwaggerUI();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<ChatHub>("/chatHub", options =>
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
