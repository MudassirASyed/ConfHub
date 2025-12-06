import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::reviewer-invitation.reviewer-invitation',({ strapi }) => ({




  async respondToInvitation(ctx) {
    try {
      const { token, action } = ctx.query;

    //   if (!token || !["accept", "reject"].includes(action)) {
    //     return ctx.badRequest("Missing or invalid token/action.");
    //   }

      // 1️⃣ Find the invitation by token
      const invitation = await strapi.db
        .query("api::reviewer-invitation.reviewer-invitation")
        .findOne({
          where: { token },
          populate: ["conference", "reviewer"],
        });

      if (!invitation) {
        return ctx.notFound("Invalid or expired invitation token.");
      }

      // 2️⃣ Update the status based on user action
      const newStatus = action === "accept" ? "accepted" : "rejected";

      await strapi.entityService.update(
        "api::reviewer-invitation.reviewer-invitation",
        invitation.id,
        { data: { InvitationStatus: newStatus } }
      );

      // 3️⃣ Send simple HTML response for browser
      ctx.type = "html";
      ctx.body = `
        <html>
          <head><title>Invitation ${newStatus}</title></head>
          <body style="font-family:sans-serif;text-align:center;padding:40px;">
            <h2>Invitation ${newStatus.toUpperCase()}</h2>
            <p>You have successfully ${newStatus} the invitation for 
              <strong>${invitation.conference?.Conference_title || "this conference"}</strong>.
            </p>
            <p><a href="https://www.bzchair.org/login">Go to Login</a></p>
             <p>or if not already registered as reviewer then.<a><a href="https://www.bzchair.org/register" className="text-blue-600 mt-4 inline-block">
          Go to SignUp
        </a></a></p>
          </body>
        </html>
      `;
    } catch (error) {
      strapi.log.error("Invitation response error:", error);
      return ctx.internalServerError("Failed to handle invitation response.");
    }
  },










}));