using Microsoft.EntityFrameworkCore;

namespace LineRunnerApp.Models
{
    /// <summary>
    /// Контекст для работы с учетными записями
    /// </summary>
    public class AccountContext : DbContext
    {
        public DbSet<UserModel> Users { get; set; }
        public DbSet<UserEventModel> Events { get; set; }
        public DbSet<AxeModel> Axes { get; set; }

        public AccountContext()
        {
            // Создаем базу при первом обращении
            // Database.EnsureCreated();
        }

        protected override void OnConfiguring(
            DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseNpgsql(
                    @"Host=storage;Port=5102;Database=postgres;Username=postgres;Password=Qwerty123");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Создаем одного пользователя
            UserModel adminUser = new()
            {
                Id = 1,
                Login = "Admin",
                LastLogin = System.DateTime.Now
            };

            // Закидываем его в базу при первом обращении
            modelBuilder.Entity<UserModel>()
                .HasData(new UserModel[] { adminUser });

            // Каскадное удаление истории пользователя
            // (я без понятия зачем оно тут без функции удаления)
            modelBuilder.Entity<UserModel>()
                .HasMany(u => u.Events)
                .WithOne(e => e.User)
                .OnDelete(DeleteBehavior.Cascade);

            base.OnModelCreating(modelBuilder);
        }
    }
}
