using Microsoft.EntityFrameworkCore;

namespace LineRunnerApp.Models
{
    /// <summary>
    /// Контекст для работы с учетными записями
    /// </summary>
    public class AccountContext : DbContext
    {
        public DbSet<UserModel> Users { get; set; }

        public AccountContext()
        {
            // Создаем базу при первом обращении
            Database.EnsureCreated();
        }

        protected override void OnConfiguring(
            DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql(
                @"Host=storage;Port=5102;Database=runnerDB;Username=postgres;Password=Qwerty123");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Создаем одного пользователя
            UserModel adminUser = new()
            {
                Login = "Admin",
                LastLogin = System.DateTime.Now
            };

            // Закидываем его в базу при первом обращении
            modelBuilder.Entity<UserModel>()
                .HasData(new UserModel[] { adminUser });

            base.OnModelCreating(modelBuilder);
        }
    }
}
