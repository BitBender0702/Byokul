using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class added_IsPinnedUser1_IsPinnedUser2_colInChatHead : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsPinned",
                table: "ChatHeads",
                newName: "IsPinnedUser2");

            migrationBuilder.AddColumn<bool>(
                name: "IsPinnedUser1",
                table: "ChatHeads",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPinnedUser1",
                table: "ChatHeads");

            migrationBuilder.RenameColumn(
                name: "IsPinnedUser2",
                table: "ChatHeads",
                newName: "IsPinned");
        }
    }
}
