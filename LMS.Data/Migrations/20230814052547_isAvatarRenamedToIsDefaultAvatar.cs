using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class isAvatarRenamedToIsDefaultAvatar : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsAvatar",
                table: "Schools",
                newName: "IsDefaultAvatar");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsDefaultAvatar",
                table: "Schools",
                newName: "IsAvatar");
        }
    }
}
