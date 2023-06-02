using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_IsDisableByOwner_In_School_Class_Course : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDisableByOwner",
                table: "Schools",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDisableByOwner",
                table: "Courses",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDisableByOwner",
                table: "Classes",
                type: "bit",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDisableByOwner",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "IsDisableByOwner",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "IsDisableByOwner",
                table: "Classes");
        }
    }
}
