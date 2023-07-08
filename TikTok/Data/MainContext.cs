using Microsoft.EntityFrameworkCore;
using TikTok.Models;

namespace TikTok.Data
{
    public class MainContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Comment> Comments { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(@"Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=DB;Integrated Security=True;");
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.CommentCreator)
                .WithMany(u => u.PublishedComments)
                .HasForeignKey(c => c.CommentCreatorId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<User>()
                .HasMany(u => u.PublishedComments)
                .WithOne(c => c.CommentCreator)
                .HasForeignKey(c => c.CommentCreatorId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Comment>()
                .HasMany(c => c.CommentLikes)
                .WithMany(u => u.LikedComments)
                .UsingEntity<Dictionary<string, object>>(
                "CommentLike",
                j => j.HasOne<User>().WithMany().HasForeignKey("UserId"),
                j => j.HasOne<Comment>().WithMany().HasForeignKey("CommentId"),
                j =>
                {
                    j.Property<int>("Id").ValueGeneratedOnAdd();
                    j.HasKey("Id");
                });



            modelBuilder.Entity<Comment>()
                .HasOne(c => c.ParentPost)
                .WithMany(p => p.PostComments)
                .HasForeignKey(c => c.ParentPostId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Post>()
                .HasMany(p => p.PostComments)
                .WithOne(c => c.ParentPost)
                .HasForeignKey(c => c.ParentPostId)
                .OnDelete(DeleteBehavior.NoAction);



            modelBuilder.Entity<Post>()
                .HasOne(p => p.PostCreator)
                .WithMany(u => u.PublishedPosts)
                .HasForeignKey(p => p.PostCreatorId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<User>()
                .HasMany(u => u.PublishedPosts)
                .WithOne(p => p.PostCreator)
                .HasForeignKey(p => p.PostCreatorId)
                .OnDelete(DeleteBehavior.NoAction);



            modelBuilder.Entity<User>()
                .HasMany(u => u.LikedPosts)
                .WithMany(p => p.PostLikes)
                .UsingEntity<Dictionary<string, object>>(
                "UserPost",
                j => j.HasOne<Post>().WithMany().HasForeignKey("CommentId"),
                j => j.HasOne<User>().WithMany().HasForeignKey("UserId"),
                j =>
                {
                    j.Property<int>("Id").ValueGeneratedOnAdd();
                    j.HasKey("Id");
                });
        }
    }
}