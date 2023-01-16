using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Edit_Like_table : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Likes_PostAttachments_PostAttachmentId",
                table: "Likes");

            migrationBuilder.RenameColumn(
                name: "PostAttachmentId",
                table: "Likes",
                newName: "PostId");

            migrationBuilder.RenameIndex(
                name: "IX_Likes_PostAttachmentId",
                table: "Likes",
                newName: "IX_Likes_PostId");

            migrationBuilder.AddForeignKey(
                name: "FK_Likes_Posts_PostId",
                table: "Likes",
                column: "PostId",
                principalTable: "Posts",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Likes_Posts_PostId",
                table: "Likes");

            migrationBuilder.RenameColumn(
                name: "PostId",
                table: "Likes",
                newName: "PostAttachmentId");

            migrationBuilder.RenameIndex(
                name: "IX_Likes_PostId",
                table: "Likes",
                newName: "IX_Likes_PostAttachmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Likes_PostAttachments_PostAttachmentId",
                table: "Likes",
                column: "PostAttachmentId",
                principalTable: "PostAttachments",
                principalColumn: "Id");
        }
    }
}
