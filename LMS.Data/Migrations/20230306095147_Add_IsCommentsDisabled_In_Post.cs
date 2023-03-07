using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_IsCommentsDisabled_In_Post : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCommentsDisabled",
                table: "Posts",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsCommentsDisabled",
                table: "Posts");
        }
    }
}
