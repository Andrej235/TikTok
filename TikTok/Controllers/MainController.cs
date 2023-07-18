using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TikTok.Data;
using TikTok.Models;

namespace TikTok.Controllers
{
    [ApiController]
    public class MainController : ControllerBase
    {
        public MainContext context = new();
        #region api/user/
        [Route("api/user/getall")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await context.Users
                .Include(u => u.LikedPosts)
                .Include(u => u.LikedComments)
                .Include(u => u.PublishedPosts)
                .Include(u => u.PublishedComments)
                .ToListAsync();

            var usersDTO = users.Select(user => new UserDTO
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Password = user.Password,
                LikedPostIds = user.LikedPosts?.Select(p => p.Id).ToList(),
                LikedCommentIds = user.LikedComments?.Select(p => p.Id).ToList(),
                PublishedPostIds = user.PublishedPosts?.Select(p => p.Id).ToList(),
                PublishedCommentIds = user.PublishedComments?.Select(p => p.Id).ToList()
            }).ToList();
            return Ok(usersDTO);
        }

        [Route("api/user/get/{userId}")]
        [HttpGet]
        public async Task<IActionResult> GetUserById(int userId)
        {
            var user = await context.Users
                .Include(u => u.LikedPosts)
                .Include(u => u.LikedComments)
                .Include(u => u.PublishedPosts)
                .Include(u => u.PublishedComments)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound("User not found. Id: " + userId);

            var usersDTO = new UserDTO
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Password = user.Password,
                LikedPostIds = user.LikedPosts?.Select(p => p.Id).ToList(),
                LikedCommentIds = user.LikedComments?.Select(p => p.Id).ToList(),
                PublishedPostIds = user.PublishedPosts?.Select(p => p.Id).ToList(),
                PublishedCommentIds = user.PublishedComments?.Select(p => p.Id).ToList()
            };
            return Ok(usersDTO);
        }

        [Route("api/user/create")]
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] RegisterInfoDTO registerInfo)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == registerInfo.Email);
            if (user != null)
                return BadRequest("User with email " + registerInfo.Email + " already exists");

            User newUser = new()
            {
                Name = registerInfo.Name,
                Email = registerInfo.Email,
                Password = registerInfo.Password
            };
            context.Users.Add(newUser);
            await context.SaveChangesAsync();
            return Ok(newUser);
        }

        [Route("api/user/login")]
        [HttpPut]
        public async Task<IActionResult> LogIn([FromBody] LogInInfoDTO logInInfo)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == logInInfo.Email);
            if (user == null)
                return NotFound("User not found");

            return Ok(user.Password == logInInfo.Password ? user.Id : 0);
        }
        #endregion

        #region api/post/
        [Route("api/post/publish")]
        [HttpPost]
        public async Task<IActionResult> PublishPost([FromBody] Post post)
        {
            int userId = post.PostCreator.Id;
            var user = await context.Users
                .Include(u => u.PublishedPosts)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound("User not found. Id: " + post.PostCreator.Id);


            post.PostCreator = user;
            user.PublishedPosts ??= new List<Post>();

            context.Posts.Add(post);
            user.PublishedPosts.Add(post);

            await context.SaveChangesAsync();
            return Ok("Successfully published post " + post.Id);
        }

        [Route("api/post/getall")]
        [HttpGet]
        public async Task<IActionResult> GetAllPosts()
        {
            List<Post> posts = await context.Posts
                .Include(p => p.PostCreator)
                .Include(p => p.PostLikes)
                .Include(p => p.PostComments)
                .ToListAsync();
            List<PostDTO> postDTOs = posts.Select(post => new PostDTO()
            {
                Id = post.Id,
                Caption = post.Caption,
                MediaUrl = post.MediaUrl,
                PostCreatorId = post.PostCreator.Id,
                PostLikeIds = post.PostLikes?.Select(u => u.Id).ToList(),
                PostCommentIds = post.PostComments?.Select(c => c.Id).ToList(),
                PostNumberOfShares = post.NumberOfShares

            }).ToList();
            return Ok(postDTOs);
        }

        [Route("api/post/get/{postId}")]
        [HttpGet]
        public async Task<IActionResult> GetPostById(int postId)
        {
            var post = await context.Posts
                .Include(p => p.PostCreator)
                .Include(p => p.PostLikes)
                .Include(p => p.PostComments)
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null)
                return NotFound("Post not found. Id: " + postId);

            PostDTO postDTO = new()
            {
                Id = post.Id,
                Caption = post.Caption,
                MediaUrl = post.MediaUrl,
                PostCreatorId = post.PostCreator.Id,
                PostLikeIds = post.PostLikes?.Select(p => p.Id).ToList(),
                PostCommentIds = post.PostComments?.Select(p => p.Id).ToList(),
                PostNumberOfShares = post.NumberOfShares
            };
            return Ok(postDTO);
        }

        [Route("api/post/get/publishedbyuser/{userId}")]
        [HttpGet]
        public async Task<IActionResult> GetPostsPublishedByUser(int userId)
        {
            var user = await context.Users
                .Include(u => u.PublishedPosts)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound("User not found. Id: " + userId);

            var posts = user.PublishedPosts?
                .Select(post => context.Posts
                    .Include(p => p.PostCreator)
                    .Include(p => p.PostLikes)
                    .Include(p => p.PostComments)
                    .First(p => p.Id == post.Id)).ToList();

            if (posts == null)
                return Ok(new List<PostDTO>());

            List<PostDTO> postDTOs = posts.Select(post => new PostDTO()
            {
                Id = post.Id,
                Caption = post.Caption,
                MediaUrl = post.MediaUrl,
                PostCreatorId = post.PostCreator.Id,
                PostLikeIds = post.PostLikes?.Select(u => u.Id).ToList(),
                PostCommentIds = post.PostComments?.Select(c => c.Id).ToList(),
                PostNumberOfShares = post.NumberOfShares
            }).ToList();

            return Ok(postDTOs);
        }

        [Route("api/post/get/likedbyuser/{userId}")]
        [HttpGet]
        public async Task<IActionResult> GetPostsLikedByUser(int userId)
        {
            var user = await context.Users
                .Include(u => u.LikedPosts)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound("User not found. Id: " + userId);

            var posts = user.LikedPosts?
                .Select(post => context.Posts
                    .Include(p => p.PostCreator)
                    .Include(p => p.PostLikes)
                    .Include(p => p.PostComments)
                    .First(p => p.Id == post.Id)).ToList();

            if (posts == null)
                return Ok(new List<PostDTO>());

            List<PostDTO> postDTOs = posts.Select(post => new PostDTO()
            {
                Id = post.Id,
                Caption = post.Caption,
                MediaUrl = post.MediaUrl,
                PostCreatorId = post.PostCreator.Id,
                PostLikeIds = post.PostLikes?.Select(u => u.Id).ToList(),
                PostCommentIds = post.PostComments?.Select(c => c.Id).ToList(),
                PostNumberOfShares = post.NumberOfShares
            }).ToList();

            return Ok(postDTOs);
        }

        [Route("api/post/like")]
        [HttpPut]
        public async Task<IActionResult> LikePost([FromBody] PostLikeInfoDTO likeInfo)
        {
            var user = await context.Users
                .Include(u => u.LikedPosts)
                .FirstOrDefaultAsync(u => u.Id == likeInfo.UserId);

            if (user == null)
                return NotFound("User not found. Id: " + likeInfo.UserId);

            var post = await context.Posts
                .Include(p => p.PostLikes)
                .FirstOrDefaultAsync(p => p.Id == likeInfo.PostId);

            if (post == null)
                return NotFound("Post not found. Id: " + likeInfo.PostId);

            if (post.PostLikes != null && post.PostLikes.Contains(user))
                return BadRequest("User has already liked this comment");

            user.LikedPosts ??= new List<Post>();
            user.LikedPosts.Add(post);

            post.PostLikes ??= new List<User>();
            post.PostLikes.Add(user);

            await context.SaveChangesAsync();
            return Ok("User " + likeInfo.UserId + " successfully liked post " + likeInfo.PostId);
        }

        [Route("api/post/unlike")]
        [HttpPut]
        public async Task<IActionResult> UnlikePost([FromBody] PostLikeInfoDTO likeInfo)
        {
            var user = await context.Users
                .Include(u => u.LikedPosts)
                .FirstOrDefaultAsync(u => u.Id == likeInfo.UserId);

            if (user == null)
                return NotFound("User not found. Id: " + likeInfo.UserId);

            var post = await context.Posts
                .Include(p => p.PostLikes)
                .FirstOrDefaultAsync(p => p.Id == likeInfo.PostId);

            if (post == null)
                return NotFound("Post not found. Id: " + likeInfo.PostId);

            if (user.LikedPosts == null || post.PostLikes == null || !user.LikedPosts.Contains(post) || !post.PostLikes.Contains(user))
                return BadRequest("User " + likeInfo.UserId + " didn't like post " + likeInfo.PostId + ". Can't unlike");

            user.LikedPosts.Remove(post);
            post.PostLikes.Remove(user);

            await context.SaveChangesAsync();
            return Ok("User " + likeInfo.UserId + " successfully unliked post " + likeInfo.PostId);
        }

        [Route("api/post/addshare/{postId}")]
        [HttpPut]
        public async Task<IActionResult> SharePost(int postId)
        {
            var post = await context.Posts.FindAsync(postId);
            if (post == null)
                return NotFound("Post not found");

            post.NumberOfShares++;
            await context.SaveChangesAsync();
            return Ok("Successfully shared post " + postId);
        }

        [Route("api/post/delete/{postId}")]
        [HttpDelete]
        public async Task<IActionResult> DeletePost(int postId)
        {
            var post = await context.Posts.FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null)
                return NotFound("Post not found. Id: " + postId);

            context.Posts.Remove(post);
            await context.SaveChangesAsync();
            return Ok("Successfully deleted post " + postId);
        }
        #endregion

        #region api/comment/
        [Route("api/comment/publish")]
        [HttpPost]
        public async Task<IActionResult> PublishAComment([FromBody] Comment comment)
        {
            var user = await context.Users
                .Include(u => u.PublishedComments)
                .FirstOrDefaultAsync(u => u.Id == comment.CommentCreator.Id);

            if (user == null)
                return NotFound("User not found. Id: " + comment.CommentCreator.Id);

            var parentPost = await context.Posts
                .Include(p => p.PostComments)
                .FirstOrDefaultAsync(p => p.Id == comment.ParentPost.Id);

            if (parentPost == null)
                return NotFound("Post not found. Id: " + comment.ParentPost.Id);

            comment.CommentCreator = user;
            comment.ParentPost = parentPost;
            await context.Comments.AddAsync(comment);

            user.PublishedComments ??= new List<Comment>();
            user.PublishedComments.Add(comment);

            parentPost.PostComments ??= new List<Comment>();
            parentPost.PostComments.Add(comment);

            await context.SaveChangesAsync();
            return Ok(comment.Id);
        }

        [Route("/api/comment/get/{commentId}")]
        [HttpGet]
        public async Task<IActionResult> GetCommentById(int commentId)
        {
            var comment = await context.Comments
                .Include(c => c.CommentCreator)
                .Include(c => c.ParentPost)
                .Include(c => c.CommentLikes)
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
                return NotFound("Comment not found. Id: " + commentId);

            CommentDTO commentDTO = new()
            {
                Id = comment.Id,
                Content = comment.Content,
                IsEdited = comment.IsEdited,
                IsLikedByCreator = comment.IsLikedByCreator,
                IsPinned = comment.IsPinned,
                ParentPostId = comment.ParentPost.Id,
                CommentCreatorId = comment.CommentCreator.Id,
                CommentLikeIds = comment.CommentLikes?.Select(u => u.Id).ToList()
            };
            return Ok(commentDTO);
        }

        [Route("/api/comment/post/get/{postId}")]
        [HttpGet]
        public async Task<IActionResult> GetCommentsOnPost(int postId)
        {
            var post = await context.Posts.FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null)
                return NotFound("Post not found. Id: " + postId);

            var comments = context.Comments.Where(p => p.ParentPostId == post.Id)
                .Select(comment => new CommentDTO()
                {
                    Id = comment.Id,
                    Content = comment.Content,
                    IsEdited = comment.IsEdited,
                    IsLikedByCreator = comment.IsLikedByCreator,
                    IsPinned = comment.IsPinned,
                    ParentPostId = comment.ParentPost.Id,
                    CommentCreatorId = comment.CommentCreator.Id,
                    CommentLikeIds = comment.CommentLikes != null ? comment.CommentLikes.Select(u => u.Id).ToList() : null
                });
            return Ok(comments);
        }

        [Route("/api/comment/edit/{commentId}")]
        [HttpPut]
        public async Task<IActionResult> EditComments(int commentId, [FromBody] StringDTO newCommentContent)
        {
            var comment = await context.Comments.FirstOrDefaultAsync(c => c.Id == commentId);
            if (comment == null)
                return NotFound("Comment not found. Id: " + commentId);

            comment.IsEdited = true;
            comment.IsLikedByCreator = false;
            comment.Content = newCommentContent.Value;
            await context.SaveChangesAsync();
            return Ok(comment);
        }

        [Route("/api/comment/delete/{commentId}")]
        [HttpDelete]
        public async Task<IActionResult> DeleteComments(int commentId)
        {
            var comment = await context.Comments.FirstOrDefaultAsync(c => c.Id == commentId);
            if (comment == null)
                return NotFound("Comment not found. Id: " + commentId);

            context.Comments.Remove(comment);
            await context.SaveChangesAsync();
            return Ok("Successfully deleted comment " + commentId);
        }

        [Route("/api/comment/like")]
        [HttpPut]
        public async Task<IActionResult> LikeComments([FromBody] CommentLikeDTO likeInfo)
        {
            var comment = await context.Comments
                .Include(c => c.ParentPost)
                .ThenInclude(p => p.PostCreator)
                .Include(c => c.CommentLikes)
                .FirstOrDefaultAsync(c => c.Id == likeInfo.CommentId);
            if (comment == null)
                return NotFound("Comment not found. Id: " + likeInfo.CommentId);

            var user = await context.Users
                .Include(u => u.LikedComments)
                .FirstOrDefaultAsync(u => u.Id == likeInfo.UserId);
            if (user == null)
                return NotFound("User not found. Id: " + likeInfo.UserId);

            if (comment.CommentLikes != null && comment.CommentLikes.Contains(user))
                return BadRequest("User has already liked this comment");

            if (comment.ParentPost.PostCreator == user)
                comment.IsLikedByCreator = true;

            comment.CommentLikes ??= new List<User>();
            comment.CommentLikes.Add(user);

            user.LikedComments ??= new List<Comment>();
            user.LikedComments.Add(comment);

            await context.SaveChangesAsync();
            return Ok("Successfully liked comment " + likeInfo.CommentId + ". User id: " + likeInfo.UserId);
        }

        [Route("/api/comment/unlike")]
        [HttpPut]
        public async Task<IActionResult> UnlikeComments([FromBody] CommentLikeDTO likeInfo)
        {
            var comment = await context.Comments
                .Include(c => c.ParentPost)
                .ThenInclude(p => p.PostCreator)
                .Include(c => c.CommentLikes)
                .FirstOrDefaultAsync(c => c.Id == likeInfo.CommentId);
            if (comment == null)
                return NotFound("Comment not found. Id: " + likeInfo.CommentId);

            var user = await context.Users
                .Include(u => u.LikedComments)
                .FirstOrDefaultAsync(u => u.Id == likeInfo.UserId);
            if (user == null)
                return NotFound("User not found. Id: " + likeInfo.UserId);

            if (comment.CommentLikes == null || user.LikedComments == null || !comment.CommentLikes.Contains(user))
                return BadRequest("User hasn't liked this comment in the first place");

            if (comment.ParentPost.PostCreator == user)
                comment.IsLikedByCreator = false;

            comment.CommentLikes.Remove(user);
            user.LikedComments.Remove(comment);

            await context.SaveChangesAsync();
            return Ok("Successfully liked comment " + likeInfo.CommentId + ". User id: " + likeInfo.UserId);
        }
        #endregion
    }


    #region DTOs
    public class UserDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;

        public ICollection<int>? LikedPostIds { get; set; }
        public ICollection<int>? LikedCommentIds { get; set; }
        public ICollection<int>? PublishedPostIds { get; set; }
        public ICollection<int>? PublishedCommentIds { get; set; }
    }

    public class PostDTO
    {
        public int Id { get; set; }
        public string Caption { get; set; } = null!;
        public string MediaUrl { get; set; } = null!;

        public int PostCreatorId { get; set; }
        public ICollection<int>? PostLikeIds { get; set; }
        public ICollection<int>? PostCommentIds { get; set; }
        public int PostNumberOfShares { get; set; }
    }

    public class CommentDTO
    {
        public int Id { get; set; }
        public string Content { get; set; } = null!;
        public bool IsEdited { get; set; }
        public bool IsLikedByCreator { get; set; }
        public bool IsPinned { get; set; }

        public int ParentPostId { get; set; }
        public int CommentCreatorId { get; set; }
        public ICollection<int>? CommentLikeIds { get; set; }
    }

    public class StringDTO
    {
        public string Value { get; set; } = null!;
    }

    public class LogInInfoDTO
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class RegisterInfoDTO
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class PostLikeInfoDTO
    {
        public int UserId { get; set; }
        public int PostId { get; set; }
    }

    public class CommentLikeDTO
    {
        public int UserId { get; set; }
        public int CommentId { get; set; }
    }
    #endregion
}