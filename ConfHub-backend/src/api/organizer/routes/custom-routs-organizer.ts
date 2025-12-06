export default {
    routes: [
      {
        method: 'POST',
        path: '/organizers/register', // Custom endpoint for registration
        handler: 'organizer.registerOrganizer',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
      },
      {
        method: 'POST',
        path: '/organizers/login', // Custom endpoint for registration
        handler: 'organizer.loginOrganizer',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
      },
      {
        method: 'POST',
        path: '/organizers/Adminlogin', // Custom endpoint for registration
        handler: 'organizer.loginAdmin',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
        
      },
      {
        method: 'POST',
        path: '/organizers/send-otp', // Custom endpoint for registration
        handler: 'organizer.sendOtp',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
        
      },
      {
        method: 'POST',
        path: '/organizers/verify-otp', // Custom endpoint for registration
        handler: 'organizer.verifyOtp',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
        
      },
      {
        method: 'POST',
        path: '/organizers/reset-password', // Custom endpoint for registration
        handler: 'organizer.resetPassword',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
        
      },
      {
        method: 'PUT',
        path: '/organizers/update-status',
        handler: 'organizer.updateStatus',
        config: {
          auth: false, // Set to true if authentication is required
          policies: [],
        },
      },
      {
        method: 'POST',
        path: '/organizers/ConfirmReviewRequest', // Custom endpoint for registration
        handler: 'organizer.confirmReviewRequest',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
        
      },
      {
        method: 'POST',
        path: '/organizers/RejectReviewRequest', // Custom endpoint for registration
        handler: 'organizer.rejectReviewRequest',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
        
      },
      {
        method: 'POST',
        path: '/organizers/AssignRole', // Custom endpoint for registration
        handler: 'organizer.assignSubOrganizerRole',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
        
      },
      {
        method: 'POST',
        path: '/organizers/final-decision', // Custom endpoint for registration
        handler: 'organizer.updateFinalDecision',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
        
      },
       {
        method: 'POST',
        path: '/organizers/updateReviewFormFields', // Custom endpoint for registration
        handler: 'organizer.updateReviewFormFields',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
        
      },
        {
        method: 'POST',
        path: '/organizers/assign-reviewers', // Custom endpoint for registration
        handler: 'organizer.assignReviewersToPaper',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
        
      },
         {
        method: 'POST',
        path: '/organizers/update-password', // Custom endpoint for registration
        handler: 'organizer.changePassword',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
        
      },
      {
        method: 'POST',
        path: '/organizers/invite-reviewers', // Custom endpoint for registration
        handler: 'organizer.inviteReviewersToConf',
        config: {
          auth: false, // Disable authentication for this specific endpoint (if needed)
        },
      }
    ],
  };