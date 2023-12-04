using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_SchoolSubscription_tbl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SchoolSubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SchoolId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SchoolSubscriptionPlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchoolSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SchoolSubscriptions_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SchoolSubscriptions_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SchoolSubscriptions_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "SchoolId");
                    table.ForeignKey(
                        name: "FK_SchoolSubscriptions_SchoolSubscriptionPlans_SchoolSubscriptionPlanId",
                        column: x => x.SchoolSubscriptionPlanId,
                        principalTable: "SchoolSubscriptionPlans",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_SchoolSubscriptions_CreatedById",
                table: "SchoolSubscriptions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolSubscriptions_DeletedById",
                table: "SchoolSubscriptions",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolSubscriptions_SchoolId",
                table: "SchoolSubscriptions",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolSubscriptions_SchoolSubscriptionPlanId",
                table: "SchoolSubscriptions",
                column: "SchoolSubscriptionPlanId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SchoolSubscriptions");
        }
    }
}
