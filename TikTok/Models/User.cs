using System.ComponentModel.DataAnnotations.Schema;

namespace TikTok.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;

        public ICollection<Post>? LikedPosts { get; set; }

        public ICollection<Comment>? LikedComments { get; set; }

        public ICollection<Post>? PublishedPosts { get; set; }

        public ICollection<Comment>? PublishedComments { get; set; }
    }
}