import { factories } from '@strapi/strapi';
const sendEmail = require('../../email/email');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const otpStore = {};
export default factories.createCoreController('api::organizer.organizer', ({ strapi }) => ({
    async registerOrganizer(ctx) {
      try {
        // Destructure the fields directly from the request body
        const { firstName, lastName, email, alternativeContact, affiliation, department, password } = ctx.request.body;
  
        // Validation (optional)
        if (!firstName || !lastName || !email || !password ) {
          return ctx.badRequest('Missing required fields.');
        }
  
        // Check if the passwords match
        // if (password !== confirmPassword) {
        //   return ctx.badRequest('Passwords do not match.');
        // }
  
        // Check if the organizer already exists by email
        const existingOrganizer = await strapi.query('api::organizer.organizer').findOne({
          where: { Organizer_Email:email },
        });
  
        if (existingOrganizer) {
          return ctx.badRequest('Organizer with this email already exists.');
        }
  
        // Create the new organizer
       
        const fullName = `${firstName} ${lastName}`;
        let newOrganizer:any;
        const newUser = await strapi.entityService.create(
          'plugin::users-permissions.user',
          {
            data: {
              email: email,
              password: password, // Ensure the password is hashed automatically by Strapi
              username: firstName,
              confirmed:false,
              blocked:true,
              Type:'organizer',
            },
          }
        );
        newOrganizer = await strapi.entityService.create('api::organizer.organizer', {
          data: {
          Organizer_FirstName: firstName,
          Organizer_LastName: lastName,
          Organizer_Email: email,
          Alternative_contact: alternativeContact,
          Affiliation: affiliation,
          Department: department,
          reqStatus:'pending',
          UserID: newUser.id,
        },
      });
      await strapi.entityService.update(
        'plugin::users-permissions.user',
        newUser.id, // ID of the user to update
        {
          data: {
            organizerId: newOrganizer.id, // Add the organizer ID to the user
          },
        }
      );
      await sendEmail(
        email,
        'Your Account has been created',
        'Hello, Your request for an organizer account in bzchair has been received. Please wait for admin approval.',
        `<p>Hello,</p><p>Your request for an organizer account in bzchair has been received. Please wait for the admin's approval to login.</p>`
      );
  
        // Return the new organizer (without password)
        ctx.send({
          message: 'Organizer registered successfully!',
          organizer: {
            firstName: newOrganizer.Organizer_FirstName,
            lastName: newOrganizer.Organizer_LastName,
            email: newOrganizer.Organizer_Email,
          },
          user: {
            username: newUser.username,
            email: newUser.email,
           
          },
        });
      } catch (error) {
        console.error('Error during registration:', error);
        ctx.internalServerError('Something went wrong while registering the organizer.');
      }
    },
    async loginOrganizer(ctx) {
      const { username, password ,role} = ctx.request.body;
      
      console.log('Request Body:', ctx.request.body); // Log the request to inspect the data
      
      // Step 1: Fetch user by username or email
      let user;
      try {
        user = await strapi.query('plugin::users-permissions.user').findOne({
          where: {
            $or: [
              { username }, // Check by username
              { email: username } // Or check by email
            ],
          },
        });
      } catch (err) {
       // console.error("Error fetching user:", err);
        return ctx.badRequest("Error fetching user.");
      }
      
      if (!user) {
        
        return ctx.badRequest('Invalid credentials');
      }
      if (user.Type !== 'organizer') {
        // If Type is not organizer, return an error
        return ctx.badRequest('Invalid credentials');
      }
      if (!user.confirmed  || user.blocked) {
        
        return ctx.internalServerError('Account not approved yet');
      }
      try {
        const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(password, user.password);
        
        if (!validPassword) {
          // Password doesn't match
          return ctx.badRequest('Invalid credentials');
        }
          const jwtService = strapi.plugin('users-permissions').service('jwt');
    const token = jwtService.issue({
      id: user.id,
      username: user.username,
      role: user.Type,
    });
    
        const completeUser = await strapi.entityService.findOne(
          'plugin::users-permissions.user',
          user.id, // User ID
          {
            populate: '*', // Populate all fields and relations (use specific fields for better performance)
          }
        );
        return ctx.send({
          message: 'Login successful',
          user: completeUser,
          jwt: token,
        });
      } catch (err) {
        console.error("Error during password validation:", err);
        return ctx.internalServerError("Error during password validation.");
      }
    },

    async loginAdmin(ctx) {
      const { username, password ,role} = ctx.request.body;
      
      console.log('Request Body:', ctx.request.body); // Log the request to inspect the data
      
      // Step 1: Fetch user by username or email
      let user;
      try {
        user = await strapi.query('plugin::users-permissions.user').findOne({
          where: {
            $or: [
              { username }, // Check by username
              { email: username } // Or check by email
            ],
          },
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        return ctx.badRequest("Error fetching user.");
      }
      
      if (!user) {
        
        return ctx.badRequest('Invalid credentials');
      }
    
      if (user.Type !== 'admin') {
        // If Type is not organizer, return an error
        return ctx.badRequest('Invalid credentials');
      }
      try {
        const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(password, user.password);
        
        if (!validPassword) {
          // Password doesn't match
          return ctx.badRequest('Invalid credentials');
        }
          const jwtService = strapi.plugin('users-permissions').service('jwt');
    const token = jwtService.issue({
      id: user.id,
      username: user.username,
      role: user.Type,
    });
        return ctx.send({
          message: 'Login successful',
          user: user,
          jwt: token,
        });
      } catch (err) {
        console.error("Error during password validation:", err);
        return ctx.internalServerError("Error during password validation.");
      }
    },
    async updateStatus(ctx) {
      try {
        const { id, status } = ctx.request.body;
  
        if (!id || !status) {
          return ctx.badRequest('Missing required fields: id and status');
        }
  
        // Update the organizer's status
        const updatedOrganizer = await strapi.entityService.update('api::organizer.organizer', id, {
          data: {
            reqStatus: status,
          },
          populate: {
            UserID: true,
          },
        });
        if (!updatedOrganizer) {
          return ctx.notFound('Organizer not found');
        }
        
    
        if (status === 'approved') {
          // Get the linked user from the organizer
          const linkedUser = (updatedOrganizer as any).UserID?.id;
          const userEmail = (updatedOrganizer as any).UserID?.email;
      const loginUrl = 'https://bzchair.netlify.app/login';
          console.log('linedd',linkedUser);
          
          // Update the user's status (confirmed: true, blocked: false)
          await strapi.entityService.update('plugin::users-permissions.user', linkedUser, {
            data: {
              confirmed: true,
              blocked: false,
            },
          });
         await sendEmail(
        userEmail,
        'Your Account has been Approved',
        'Hello, Your request for a organizer account in bzchair  has been approved by the admin. You can now log in to your account using the following link: ' + loginUrl,
        `<p>Hello,</p><p>Your request for a organizer account in bzchair  has been approved by the admin. You can now log in to your account using the following link:</p><a href="${loginUrl}">${loginUrl}</a>`
      );
        }
        if (status === 'rejected') {
          const userEmail = (updatedOrganizer as any).UserID?.email;
          await sendEmail(
            userEmail,
            'Your Account has been Rejected',
            'Hello, Your request for a organizer account in bzchair  has been rejected by the admin. ',
            `<p>Hello,</p><p>Your request for a organizer account in bzchair  has been rejected by the admin </p>`
          );
        }
    
        // Respond with the updated organizer
        ctx.send({
          message: 'Status updated successfully',
          organizer: updatedOrganizer,
        });
      } catch (error) {
        console.error('Error updating organizer status:', error);
        ctx.internalServerError('An error occurred while updating status');
      }
    },
    async confirmReviewRequest(ctx) {
      const { paperId, reviewerId } = ctx.request.body;
      const reviewer = await strapi.entityService.findOne('api::reviewer.reviewer', reviewerId, {
        populate:'*',
    });
const reviewerEmail=reviewer.email;
    if (!reviewer) {
        return ctx.badRequest("Reviewer not found.");
    }
      console.log('Request Body:', ctx.request.body); // Log the request to inspect the data
      
      
      try {
        //for reviewr collection typee
        const AssignPaperToReviewer = await strapi.db.query("api::reviewer.reviewer").update({
          where: { id: reviewerId },
          data: {
            AssignedPapers: {
              connect: [{ id: paperId }], 
            },
          },
        });
        //for paper collection type
        const ConfirmReviewRequest = await strapi.db.query("api::paper.paper").update({
          where: { id: paperId },
          data: {
            reviewRequestsConfirmed: {
              connect: [{ id: reviewerId }], 
            },
          },
        });
        const updatedPaper = await strapi.db.query("api::paper.paper").update({
          where: { id: paperId },
          data: {
            reviewRequests: {
              disconnect: [{ id: reviewerId }],
            },
          },
          populate: ['reviewRequests'], // Ensure the updated data is returned
        });
        await sendEmail(
          reviewerEmail,
          `Your request for paper review with title "${updatedPaper.Paper_Title}" has been Approved`,
          `Hello, Your request to review the paper titled "${updatedPaper.Paper_Title}" has been approved by the organizer. You can now log in to your account and proceed with the review process. `,
          `<p>Hello,</p><p>Your request to review the paper titled <strong>"${updatedPaper.Paper_Title}"</strong> has been approved by the organizer.</p><p>You can now log in to your account and proceed with the review process.</p>`
        );
        
        
    
       
        return ctx.send({
          message: 'paper assignment successful',
          updatedPaper:updatedPaper
        });
      } catch (err) {
        console.error("Error during paper assignment  :", err);
        return ctx.internalServerError("Error during paper assignment.");
      }
    },
    async rejectReviewRequest(ctx) {
      const { paperId, reviewerId } = ctx.request.body;
      const reviewer = await strapi.entityService.findOne('api::reviewer.reviewer', reviewerId, {
        populate:'*',
     });
      const reviewerEmail=reviewer.email;
     if (!reviewer) {
        return ctx.badRequest("Reviewer not found.");
     }
      console.log('Request Body:', ctx.request.body); // Log the request to inspect the data   
      
       try {
        
        //for paper collection type
        const RejectReviewRequest = await strapi.db.query("api::paper.paper").update({
          where: { id: paperId },
          data: {
            reviewRequestsRejected: {
              connect: [{ id: reviewerId }], 
            },
          },
        });
        const updatedPaper = await strapi.db.query("api::paper.paper").update({
          where: { id: paperId },
          data: {
            reviewRequests: {
              disconnect: [{ id: reviewerId }],
            },
          },
          populate: ['reviewRequests'], // Ensure the updated data is returned
        });
        
        await sendEmail(
          reviewerEmail,
          `Your request for paper review with title "${updatedPaper.Paper_Title}" has been Rejected`,
          `Hello, Your request to review the paper titled "${updatedPaper.Paper_Title}" has been rejected by the orgaizer. If you have any questions, please contact support.`,
          `<p>Hello,</p><p>Your request to review the paper titled <strong>"${updatedPaper.Paper_Title}"</strong> has been rejected by the organizer.</p><p>If you have any questions, please contact support.</p>`
        );
        
       
        return ctx.send({
          message: 'paper rejection successful',
          updatedPaper:updatedPaper
        });
      } catch (err) {
        console.error("Error during paper assignment  :", err);
        return ctx.internalServerError("Error during paper assignment.");
      }
    
  },


  async assignSubOrganizerRole(ctx) {
    const { conferenceId, selectedAuthors, selectedReviewers } = ctx.request.body;

    // Log the request body to inspect the data
    console.log('Request Body:', ctx.request.body);
    const conference = await strapi.entityService.findOne(
      'api::conference.conference',
      conferenceId,
      { fields: ['Conference_title'] } // Only fetch the name to keep it efficient
    );
    
    if (!conference) {
      throw new Error('Conference not found');
    }
    
    const conferenceName = conference.Conference_title
    ;
    // Initialize arrays to hold the populated authors and reviewers
    let authorsData = [];
    let reviewersData = [];

    // Step 1: Check if selectedAuthors is not empty, then find authors
    if (selectedAuthors && selectedAuthors.length > 0) {
        try {
            // Find multiple authors by their IDs using the findMany method
            authorsData = await strapi.query('api::author.author').findMany({
                where: {
                    id: { $in: selectedAuthors }, // Use $in to match multiple IDs
                },
                populate: true,
            });
        } catch (error) {
            console.error('Error fetching authors:', error);
            return ctx.send({ message: 'Error fetching authors' }, 500);
        }
    }

    // Step 2: Check if selectedReviewers is not empty, then find reviewers by ID
    if (selectedReviewers && selectedReviewers.length > 0) {
        try {
            // Find multiple reviewers by their IDs using the findMany method
            reviewersData = await strapi.query('api::reviewer.reviewer').findMany({
                where: {
                    id: { $in: selectedReviewers }, // Use $in to match multiple IDs
                },
                populate: true,
            });
        } catch (error) {
            console.error('Error fetching reviewers:', error);
            return ctx.send({ message: 'Error fetching reviewers' }, 500);
        }
    } 

    console.log('authorsData:', authorsData);
    console.log('reviewersData:', reviewersData);

    // Step 3: Handle the case where no authors or reviewers were found
    if (authorsData.length === 0 && reviewersData.length === 0) {
        return ctx.send({ message: 'No authors or reviewers selected' }, 400);
    }

    // Step 4: Initialize arrays to store user IDs for authors and reviewers
    let authorsUserIds = [];
    let reviewersUserIds = [];

    // Step 5: Process authors and reviewers and store their UserIDs
    if (authorsData.length > 0) {
        for (let author of authorsData) {
            try {
                const assignSubOrganizerRole = await strapi.db.query("plugin::users-permissions.user").update({
                    where: { id: author.UserID.id }, // Update user with the respective author ID
                    data: {
                        SubOrganizerRole: {
                            connect: [{ id: conferenceId }],
                        },
                    },
                });
                console.log(`Assigned role to author with user ID: ${author.UserID.id} ${author.UserID.email}`);
                
                // Collect author UserIDs
                authorsUserIds.push(author.UserID.id);
                await sendEmail(
                  author.UserID.email,
                  'You have been assigned as a TPC_Chair',
                  `You have been assigned as a TPC_Chair for "${conferenceName}" in "bzchair" log in to your author account and see details by switching role.`,
                  `<p>Hello ${author.UserID.username},</p>
                   <p>You have been assigned as a TPC_Chair for the conference "<strong>${conferenceName}</strong>" in "bzchair" log in to your author account and see details by switching role.</p>`
                );
            } catch (error) {
                console.error(`Error assigning role to author with user ID: ${author.UserID.id}`, error);
            }
        }
    }

    if (reviewersData.length > 0) {
        for (let reviewer of reviewersData) {
            try {
                const assignSubOrganizerRole = await strapi.db.query("plugin::users-permissions.user").update({
                    where: { id: reviewer.UserID.id }, // Update user with the respective reviewer ID
                    data: {
                        SubOrganizerRole: {
                            connect: [{ id: conferenceId }],
                        },
                    },
                });
                console.log(`Assigned role to reviewer with user ID: ${reviewer.UserID.id}`);
                
                // Collect reviewer UserIDs
                reviewersUserIds.push(reviewer.UserID.id);
                await sendEmail(
                  reviewer.UserID.email,
                  'You have been assigned as a TPC_Chair',
                  `You have been assigned as a TPC_Chair for "${conferenceName}" in 'bzchair' log in to your author account and see details by switching role.`,
                  `<p>Hello ${reviewer.UserID.username},</p>
                   <p>You have been assigned as a TPC_Chair for the conference "<strong>${conferenceName}</strong>" in bzchair log in to your reviewer account and see details by switching role.</p>`
                );
            } catch (error) {
                console.error(`Error assigning role to reviewer with ID: ${reviewer.UserID.id}`, error);
            }
        }
    }

    // Step 6: Update the conference with the collected author and reviewer UserIDs
    try {
        const assignSubOrganizerToConference = await strapi.db.query("api::conference.conference").update({
            where: { id: conferenceId }, // Find the conference by its ID
            data: {
                AssignedSubOrganizer: {
                    connect: [
                        ...authorsUserIds.map(id => ({ id })), // Connect all author IDs
                        ...reviewersUserIds.map(id => ({ id })), // Connect all reviewer IDs
                    ],
                },
            },
        });
        console.log(`Assigned SubOrganizer roles to conference with ID: ${conferenceId}`);
    } catch (error) {
        console.error(`Error assigning SubOrganizers to conference with ID: ${conferenceId}`, error);
        return ctx.send({ message: 'Error updating conference with SubOrganizers' }, 500);
    }

    // Step 7: Return a successful response
    return ctx.send({
        message: 'Role Assigned Successfully',
        authors: authorsData,
        reviewers: reviewersData,
    });
},


async updateFinalDecision(ctx) {
  const { paperId, decision } = ctx.request.body;

  console.log('Request Body:', ctx.request.body); // Log the request to inspect the data

  try {
    // Fetch the paper by paperId and populate the submitted_by field
    const paper = await strapi.entityService.findOne(
      'api::paper.paper',
      paperId,
      {
        populate: {
          submitted_by: { // Populate the 'submitted_by' relation (which points to the author)
            fields: ['authorEmail'], // You can also specify which fields to include, like 'email'
          },
        },
      }
    )as any;
    console.log('paper',paper);
    // Check if the paper was found
    if (!paper) {
      return ctx.throw(404, 'Paper not found');
    }

    // Update the paper with the final decision
    await strapi.entityService.update(
      'api::paper.paper',
      paperId, // Paper ID
      {
        data: {
          finalDecisionByOrganizer: decision, // Set the final decision
        },
      }
    );

    // Extract the email of the user who submitted the paper (assuming submitted_by is the user object)
    const userEmail = paper.submitted_by.authorEmail
  const papertitle= paper.Paper_Title;
  const authors = paper.submitted_by;

  if (!authors || authors.length === 0) {
    return ctx.throw(400, 'No authors found for the submitted paper');
  }
  
  for (const author of authors) {
    const email = author.authorEmail;
    
    if (!email) {
      console.warn(`No email found for author with ID: ${author.id}`);
      continue;
    }
  
    try {
      
    const paperTitle = paper.Paper_Title;
    const paperID = paper.id;
    const reviews = paper.review || [];

    // Build the HTML reviews section
    let reviewsHtml = '';
    reviews.forEach((rev, index) => {
      reviewsHtml += `
        <h4>Review ${index + 1}</h4>
        <ul>
          <li><strong>Score:</strong> ${rev.Score}</li>
          <li><strong>Significance:</strong> ${rev.significance}</li>
          <li><strong>Originality:</strong> ${rev.originality}</li>
          <li><strong>Clarity:</strong> ${rev.clarity}</li>
          <li><strong>Technical Quality:</strong> ${rev.technical_quality}</li>
          <li><strong>Presentation:</strong> ${rev.presentation}</li>
          <li><strong>Novelty:</strong> ${rev.novelty}</li>
          <li><strong>Reproducibility:</strong> ${rev.reproducibility}</li>
          <li><strong>Writing Quality:</strong> ${rev.writing_quality}</li>
          <li><strong>Related Work:</strong> ${rev.related_work}</li>
          <li><strong>Experimental Validation:</strong> ${rev.experimental_validation}</li>
          <li><strong>Recommendations:</strong> ${rev.Recommendations}</li>
          <li><strong>Comments:</strong> ${rev.Comments}</li>
        </ul>
        <hr/>
      `;
    });

    // Author info
  //  const author = paper.submitted_by;
    const email = author?.authorEmail;

    if (!email) {
      console.warn('Author email not found');
      return ctx.throw(400, 'No email found for the paper author');
    }

    // Email Content
    const emailSubject = `Final Decision for Your Paper: "${paperTitle}"`;

    const emailText = `Dear Author,

Your paper submission has been reviewed.

Paper ID: ${paperID}
Title: "${paperTitle}"
Final Decision: ${decision}

Please log in to your account to view detailed feedback.

Best regards,
The Organizing Committee`;

    const emailHtml = `
      <p>Dear Author,</p>
      <p>Your paper submission has been reviewed and a final decision has been made.</p>
      <ul>
        <li><strong>Paper ID:</strong> ${paperID}</li>
        <li><strong>Title:</strong> "${paperTitle}"</li>
        <li><strong>Final Decision:</strong> <span style="color:blue;"><strong>${decision}</strong></span></li>
      </ul>
      <p><strong>Reviews:</strong></p>
      ${reviewsHtml || '<p>No reviews available.</p>'}
      <p>Thank you for your contribution.Please log in to your account to view detailed feedback.</p>
      <p>Best regards,<br/>The Organizing Committee</p>
    `;

    await sendEmail(
      email,
      emailSubject,
      emailText,
      emailHtml
    );

    console.log(`Email sent to author ${email}`);

      console.log(`Email sent to author ${email}`);
    } catch (err) {
      console.error(`Failed to send email to ${email}`, err);
    }
  }

    // Respond with success
    return { message: 'Decision updated and email sent successfully' };
  } catch (error) {
    console.error('Error updating decision:', error);
    return ctx.throw(500, 'Internal server error');
  }
},



async updateReviewFormFields(ctx) {
  const { id, reviewFormFields } = ctx.request.body;

  console.log('Request Body:', ctx.request.body); // Optional: Debug logging

  try {
    // Update the conference with the provided reviewFormFields
    const updatedConference = await strapi.entityService.update(
      'api::conference.conference',
      id,
      {
        data: {
          reviewFormFields: reviewFormFields,
        },
      }
    );

    return {
      message: 'Form fields updated successfully',
      data: updatedConference,
    };
  } catch (error) {
    console.error('Error updating form fields:', error);
    return ctx.throw(500, 'Internal server error');
  }
},

 async assignReviewersToPaper(ctx) {
  const { paperId, reviewers = [], newReviewerEmails = [] } = ctx.request.body;

  console.log('Request Body:', ctx.request.body);

  if (!paperId || (reviewers.length === 0 && newReviewerEmails.length === 0)) {
    return ctx.badRequest('Paper ID and at least one reviewer or email are required.');
  }

  try {
    
    // 🟡 Get paper info and conference details
    const paper = await strapi.entityService.findOne('api::paper.paper', paperId, {
  populate: '*'
});

console.log('pp',paper);

    const paperTitle = paper.Paper_Title;
    // const conferenceName = paper.SubmittedTo?.Conference_title || 'the conference';
    // const reviewDeadline = paper.SubmittedTo?.Review_deadline || 'N/A';

    // ✅ 1. Loop through existing reviewer IDs
      if (reviewers && reviewers.length > 0) {

    for (const reviewerId of reviewers) {
      const reviewer = await strapi.entityService.findOne('api::reviewer.reviewer', reviewerId, {
        fields: ['email'],
      });

      if (!reviewer) {
        console.warn(`Reviewer with ID ${reviewerId} not found.`);
        continue;
      }

      // Assign paper to reviewer
      await strapi.db.query('api::reviewer.reviewer').update({
        where: { id: reviewerId },
        data: {
          AssignedPapers: {
            connect: [{ id: paperId }],
          },
        },
      });

      // Assign reviewer to paper
      await strapi.db.query('api::paper.paper').update({
        where: { id: paperId },
        data: {
          reviewRequestsConfirmed: {
            connect: [{ id: reviewerId }],
          },
        },
      });

      // ✅ Email body and send
      const textBody = `Hello ${reviewer.firstName + reviewer.lastName || ''},

You have been assigned to review the paper:

Paper ID: ${paperId}
Title: "${paperTitle}"


You can now log in to your account and begin the review process.

Thank you,
The Organizing Committee`;

      const htmlBody = `
        <p>Hello ${reviewer.firstName + reviewer.lastName || ''},</p>
        <p>You have been assigned to review the following paper:</p>
        <ul>
          <li><strong>Paper ID:</strong> ${paperId}</li>
          <li><strong>Title:</strong> "${paperTitle}"</li>
         
        </ul>
        <p>You can now log in to your account and begin the review process.</p>
        <p>Thank you,<br/>The Organizing Committee</p>
      `;

      await sendEmail(
        reviewer.email,
        `Review Assignment: "${paperTitle}" (ID: ${paperId})`,
        textBody,
        htmlBody
      );
    }}

    if (newReviewerEmails && newReviewerEmails.length > 0) {
    for (const email of newReviewerEmails) {
      const existingReviewer = await strapi.db.query('api::reviewer.reviewer').findOne({
        where: { email },
      });

      let newReviewerId;

      if (existingReviewer) {
        console.log('reviewer with this email already exists');
        
      } else {
        const newReviewer = await strapi.entityService.create('api::reviewer.reviewer', {
          data: {
            email,
            AssignedPapers:paperId
          },
        });
        newReviewerId = newReviewer.id;
      }

      await strapi.db.query('api::paper.paper').update({
        where: { id: paperId },
        data: {
          reviewRequestsConfirmed: {
            connect: [{ id: newReviewerId }],
          },
        },
      });

      const textBody = `Hello,

You have been assigned to review the following paper on bzchair:

Paper ID: ${paperId}
Title: "${paperTitle}"

Please register your reviewer account at bzchair to begin the review process:
http://localhost:5173/register

Thank you,
The Organizing Committee`;

      const htmlBody = `
        <p>Hello,</p>
        <p>You have been assigned to review the following paper on <strong>bzchair</strong>:</p>
        <ul>
          <li><strong>Paper ID:</strong> ${paperId}</li>
          <li><strong>Title:</strong> "${paperTitle}"</li>
        </ul>
        <p>Please <a href="https://bzchair.netlify.app/register" style="color:blue;">register your reviewer account</a> to begin the review process.</p>
        <p>Thank you,<br/>The Organizing Committee</p>
      `;

      await sendEmail(
        email,
        `Review Invitation: "${paperTitle}" (ID: ${paperId})`,
        textBody,
        htmlBody
      );
    }
  }

 



    return ctx.send({
      message: 'Reviewers assigned successfully.',
    });

  } catch (error) {
    console.error('Assignment error:', error);
    return ctx.internalServerError('Failed to assign reviewers.');
  }
},

  async changePassword(ctx) {
    const {
      userId,
      userType,
      currentPassword,
      newPassword,
      confirmNewPassword,
    } = ctx.request.body;

    if (!userId || !userType || !currentPassword || !newPassword || !confirmNewPassword) {
      return ctx.badRequest('Missing required fields');
    }

    if (newPassword !== confirmNewPassword) {
      return ctx.badRequest('New passwords do not match');
    }

    try {
      // 🔍 Find user by ID and Type
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: {
          id: userId,
          Type: userType, // Type is a custom field in users-permissions user
        },
      });

      if (!user) {
        return ctx.notFound('User not found or type mismatch');
      }

      // 🔐 Check current password
      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordCorrect) {
        return ctx.badRequest('Current password is incorrect');
      }

      // 🔐 Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return ctx.send({ message: 'Password changed successfully' });
    } catch (err) {
      console.error('Password change error:', err);
      return ctx.internalServerError('Failed to change password');
    }
  },

 async sendOtp(ctx) {
    const { email } = ctx.request.body;
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { email } });

    if (!user) return ctx.throw(404, 'User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min expiry

    await sendEmail(email, 'Your OTP Code', `Your OTP is ${otp}`);

    return ctx.send({ message: 'OTP sent' });
  },


   async verifyOtp(ctx) {
    const { email, otp } = ctx.request.body;
    const record = otpStore[email];

    if (!record || record.otp !== otp || Date.now() > record.expires) {
      return ctx.throw(400, 'Invalid or expired OTP');
    }

    return ctx.send({ message: 'OTP verified' });
  },



  
   async resetPassword(ctx) {
    const { email, newPassword } = ctx.request.body;
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { email } });

    if (!user) return ctx.throw(404, 'User not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    delete otpStore[email]; // clear OTP

    return ctx.send({ message: 'Password reset successful' });
  }




  }));
  