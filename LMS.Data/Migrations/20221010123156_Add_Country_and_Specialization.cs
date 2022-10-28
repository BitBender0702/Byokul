using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_Country_and_Specialization : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Country",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "Specialization",
                table: "Schools");

            migrationBuilder.AddColumn<Guid>(
                name: "CountryId",
                table: "Schools",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SpecializationId",
                table: "Schools",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Countries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Countries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Specializations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Specializations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Schools_CountryId",
                table: "Schools",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Schools_SpecializationId",
                table: "Schools",
                column: "SpecializationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Schools_Countries_CountryId",
                table: "Schools",
                column: "CountryId",
                principalTable: "Countries",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Schools_Specializations_SpecializationId",
                table: "Schools",
                column: "SpecializationId",
                principalTable: "Specializations",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Schools_Countries_CountryId",
                table: "Schools");

            migrationBuilder.DropForeignKey(
                name: "FK_Schools_Specializations_SpecializationId",
                table: "Schools");

            migrationBuilder.DropTable(
                name: "Countries");

            migrationBuilder.DropTable(
                name: "Specializations");

            migrationBuilder.DropIndex(
                name: "IX_Schools_CountryId",
                table: "Schools");

            migrationBuilder.DropIndex(
                name: "IX_Schools_SpecializationId",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "CountryId",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "SpecializationId",
                table: "Schools");

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "Schools",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Specialization",
                table: "Schools",
                type: "int",
                nullable: true);
        }
    }
}
