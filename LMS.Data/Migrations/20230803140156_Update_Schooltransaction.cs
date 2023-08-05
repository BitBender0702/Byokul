using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Update_Schooltransaction : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "SchoolTransactions",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SchoolTransactions_UserId",
                table: "SchoolTransactions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_SchoolTransactions_AspNetUsers_UserId",
                table: "SchoolTransactions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SchoolTransactions_AspNetUsers_UserId",
                table: "SchoolTransactions");

            migrationBuilder.DropIndex(
                name: "IX_SchoolTransactions_UserId",
                table: "SchoolTransactions");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "SchoolTransactions");
        }
    }
}
