using System.ComponentModel.DataAnnotations.Schema;

namespace TikTok.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Content { get; set; } = null!;
        public bool IsEdited { get; set; }
        public bool IsLikedByCreator { get; set; }
        public bool IsPinned { get; set; }



        public Post ParentPost { get; set; } = null!;
        public int ParentPostId { get; set; }

        /*        [InverseProperty("ChildComments")]
                public Comment? ParentComment { get; set; }

                [InverseProperty("ParentComment")]
                public ICollection<Comment>? ChildComments { get; set; }*/

        public User CommentCreator { get; set; } = null!;
        public int CommentCreatorId { get; set; }

        public ICollection<User>? CommentLikes { get; set; }
    }
}