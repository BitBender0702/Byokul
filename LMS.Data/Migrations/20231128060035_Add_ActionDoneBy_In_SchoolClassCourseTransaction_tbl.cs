using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_ActionDoneBy_In_SchoolClassCourseTransaction_tbl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SchoolClassCourseTransactions_AspNetUsers_UserId",
                table: "SchoolClassCourseTransactions");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "SchoolClassCourseTransactions",
                newName: "ActionDoneBy");

            migrationBuilder.RenameIndex(
                name: "IX_SchoolClassCourseTransactions_UserId",
                table: "SchoolClassCourseTransactions",
                newName: "IX_SchoolClassCourseTransactions_ActionDoneBy");

            migrationBuilder.AddForeignKey(
                name: "FK_SchoolClassCourseTransactions_AspNetUsers_ActionDoneBy",
                table: "SchoolClassCourseTransactions",
                column: "ActionDoneBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SchoolClassCourseTransactions_AspNetUsers_ActionDoneBy",
                table: "SchoolClassCourseTransactions");

            migrationBuilder.RenameColumn(
                name: "ActionDoneBy",
                table: "SchoolClassCourseTransactions",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_SchoolClassCourseTransactions_ActionDoneBy",
                table: "SchoolClassCourseTransactions",
                newName: "IX_SchoolClassCourseTransactions_UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_SchoolClassCourseTransactions_AspNetUsers_UserId",
                table: "SchoolClassCourseTransactions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
