using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_ActionDoneBy_In_SchoolClassCourseTransaction_tbl2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SSCOwnerId",
                table: "SchoolClassCourseTransactions",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SchoolClassCourseTransactions_SSCOwnerId",
                table: "SchoolClassCourseTransactions",
                column: "SSCOwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_SchoolClassCourseTransactions_AspNetUsers_SSCOwnerId",
                table: "SchoolClassCourseTransactions",
                column: "SSCOwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SchoolClassCourseTransactions_AspNetUsers_SSCOwnerId",
                table: "SchoolClassCourseTransactions");

            migrationBuilder.DropIndex(
                name: "IX_SchoolClassCourseTransactions_SSCOwnerId",
                table: "SchoolClassCourseTransactions");

            migrationBuilder.DropColumn(
                name: "SSCOwnerId",
                table: "SchoolClassCourseTransactions");
        }
    }
}
