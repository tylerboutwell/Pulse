using Api.Endpoints;
using Api.Hubs;
using Api.Services;
using Microsoft.EntityFrameworkCore;
using Api.Data;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddConsole(); // Required for Log Stream
builder.Logging.AddAzureWebAppDiagnostics(); // Required to forward to App Service logs
builder.Services.AddDbContext<QuizLiveDb>(opt => opt.UseInMemoryDatabase("QuizLiveDb"));
builder.Services.AddOpenApi();
builder.Services.AddSignalR();
builder.Services.AddScoped<GameService>();

var frontendUrl = builder.Configuration["frontendUrl"] ?? throw new InvalidOperationException("FrontendUrl is not configured.");

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        builder =>
        {
            builder.WithOrigins(frontendUrl)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();
app.Logger.LogInformation("Frontend URL: {FrontendUrl}", frontendUrl);
app.UseDefaultFiles();
app.UseStaticFiles();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<QuizLiveDb>();
    SeedData.Seed(db);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

QuestionEndpoints.Map(app);
PlayerEndpoints.Map(app);
QuizEndpoints.Map(app);
GameEndpoints.Map(app);

app.MapHub<GameHub>("/gameHub");
app.Run();