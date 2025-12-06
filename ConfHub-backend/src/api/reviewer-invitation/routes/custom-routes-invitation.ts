module.exports = {
  routes: [
    {
      method: "GET",
      path: "/reviewer-invitation/respond",
      handler: "reviewer-invitation.respondToInvitation",
      config: { auth: false },
    },
  ],
};