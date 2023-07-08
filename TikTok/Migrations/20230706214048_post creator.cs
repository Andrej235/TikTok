using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TikTok.Migrations
{
    /// <inheritdoc />
    public partial class postcreator : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Posts_Users_PostCreatorId",
                table: "Posts");

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Users_PostCreatorId",
                table: "Posts",
                column: "PostCreatorId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Posts_Users_PostCreatorId",
                table: "Posts");

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Users_PostCreatorId",
                table: "Posts",
                column: "PostCreatorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
