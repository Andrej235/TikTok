using System.ComponentModel.DataAnnotations.Schema;

namespace TikTok.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string Caption { get; set; } = null!;
        public string MediaUrl { get; set; } = null!;

        public User PostCreator { get; set; } = null!;
        public int PostCreatorId { get; set; }

        public ICollection<User>? PostLikes { get; set; }

        public ICollection<Comment>? PostComments { get; set; }

        public int NumberOfShares { get; set; }
    }
}