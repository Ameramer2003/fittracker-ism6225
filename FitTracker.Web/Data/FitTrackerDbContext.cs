using Microsoft.EntityFrameworkCore;
using FitTracker.Web.Models;

namespace FitTracker.Web.Data;

public class FitTrackerDbContext : DbContext
{
    public FitTrackerDbContext(DbContextOptions<FitTrackerDbContext> options)
        : base(options) { }

    public DbSet<Workout> Workouts => Set<Workout>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Workout>(entity =>
        {
            entity.HasKey(w => w.Id);
            entity.Property(w => w.Exercise)  .IsRequired().HasMaxLength(200);
            entity.Property(w => w.Category)  .IsRequired().HasMaxLength(100);
            entity.Property(w => w.Difficulty).IsRequired().HasMaxLength(50);
            entity.Property(w => w.Equipment) .HasMaxLength(100);
            entity.Property(w => w.Notes)     .HasMaxLength(1000);
            entity.Property(w => w.Weight)    .HasColumnType("decimal(8,2)");
        });
    }
}
