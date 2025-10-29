/**
 * conference controller
 */
const sendEmail = require('../../email/email');
import { factories } from '@strapi/strapi'
const nodemailer = require('nodemailer');
export default factories.createCoreController('api::conference.conference', ({ strapi }) => ({
    async createConference(ctx) {
        try {
            console.log('conf data',ctx.request.body);
            
            // Destructure fields directly from the request body
            const {
                conferenceTitle,
                conferenceDescription,
                conferenceTopics,
                startDate,
                conferenceTime,
                conferenceLocation,
                trackTitle,
                trackDescription,
                sessionTitle,
                speakerNames,
                submissionDeadline,
                reviewDeadline,
                organizerId
              
            } = ctx.request.body;
        
            // Validation for required fields
            
          
              // Ensure end date is not earlier than start date
              // if (new Date(startDate) > new Date(endDate)) {
              //   return ctx.badRequest("End date cannot be earlier than start date.");
              // }
          
              // Ensure review deadline is not earlier than submission deadline
              // if (new Date(submissionDeadline) > new Date(reviewDeadline)) {
              //   return ctx.badRequest("Review deadline cannot be earlier than submission deadline.");
              // }
          
              // Check if a conference with the same title already exists
              const existingConference = await strapi.query("api::conference.conference").findOne({
                where: { Conference_title: conferenceTitle }, // Make sure you're using the correct column name.
              });
              
          
              if (existingConference) {
                return ctx.badRequest("A conference with this title already exists.");
              }
          
              // Create the conference
              const newConference = await strapi.entityService.create("api::conference.conference", {
                data: {
                    Conference_title: conferenceTitle,
                    Description:conferenceDescription,
                    Conference_Topics:conferenceTopics,
                  Start_date:startDate,
                  Submission_deadline:submissionDeadline,
                  Organizer: organizerId,
                  requestStatus:'pending',
                }, 
            
              });
              const organizerEmail = await strapi.query("api::organizer.organizer").findOne({
                where: { id: organizerId },
                select: ["Organizer_Email"]  // Ensure you're selecting only the email field
            });
            console.log('org email', organizerEmail);
            const emailAddress = organizerEmail?.Organizer_Email;
            if (emailAddress) {
             
            
              // Send email using the extracted email address
              await sendEmail(
                emailAddress,  // Pass the email string here
                'Your Conference Request Has Been Received',
                `Thank you for submitting your conference request on bzchair. We have received your request to create "${conferenceTitle}" and it is currently under review. Our team will review the details, and you will be notified once it has been approved.`,
                `<p>Hello,</p>
                 <p>Your request to create the conference "<strong>${conferenceTitle}</strong>" on bzchair has been received. Please wait for the admin's approval. You will be notified once the review process is complete.</p>
                 <p>Best regards,<br>bzchair Team</p>`
              );
            } else {
              console.error('No organizer email found.');
            }
            
              return ctx.send({
                message: "Conference created successfully.",
                conference: newConference,
              });
            } catch (error) {
              console.error("Error creating conference:", error);
              return ctx.internalServerError("An error occurred while creating the conference.");
            }
          
        
    },

    async updateStatus(ctx) {
        try {
          const { id, status } = ctx.request.body;
    console.log('confo', ctx.request.body);
    
          if (!id || !status) {
            return ctx.badRequest('Missing required fields: id and status');
          }
    
          // Update the organizer's status
          const updatedConference = await strapi.entityService.update('api::conference.conference', id, {
            data: {
              requestStatus: status,
              Status:'inProgress',
            },
          });
         console.log('up dat coff',updatedConference);
         
          if (!updatedConference) {
            return ctx.notFound('conference not found');
          }
          // Fetch the conference and populate the organizer relationship
const conference = await strapi.entityService.findOne('api::conference.conference', id, {
  populate: ['Organizer']  // Ensure 'organizer' relation is populated
});

if (!conference || !(conference as any).Organizer) {
  return ctx.badRequest('Organizer not found for this conference');
}

// Extract organizer details
const organizerId = (conference as any).Organizer.id;
const organizerEmail = (conference as any).Organizer.Organizer_Email;

// Fetch the conference title separately (optional)
const conferenceTitle = conference.Conference_title;

console.log('Organizer ID:', organizerId);
console.log('Organizer Email:', organizerEmail);
console.log('Conference Title:', conferenceTitle);

      
          await sendEmail(
            organizerEmail,
            'Your Conference Status Has Been Updated',
            `Your conference "${conferenceTitle}" on bzchair has been updated to the status: ${status}.`,
            `<p>Hello,</p>
             <p>The status of your conference "<strong>${conferenceTitle}</strong>" on bzchair has been updated to <strong>${status}</strong>.</p>
             <p>Please log in to your account to view further details.</p>
             <p>If you have any questions, feel free to contact our support team.</p>
             <p>Best regards,<br>bzchair Team</p>`
        );
        
      
          // Respond with the updated organizer
          ctx.send({
            message: 'Status updated successfully',
            organizer: updatedConference,
          });
        } catch (error) {
          console.error('Error updating organizer status:', error);
          ctx.internalServerError('An error occurred while updating status');
        }
      },

      async updateSubmissiondate(ctx) {
        try {
          const { id, Submission_deadline,Start_date,Conference_Topics,Conference_title } = ctx.request.body;
    console.log('pop', ctx.request.body);
    console.log('popo',id, Submission_deadline);
    
          if (!id || !Submission_deadline || !Start_date || !Conference_Topics || !Conference_title) {
            return ctx.badRequest('Missing id or newDeadline or other details');
          }
    
          const updated = await strapi.entityService.update('api::conference.conference', id, {
            data: {
              Conference_title:Conference_title,
              Submission_deadline: Submission_deadline,
              Conference_Topics:Conference_Topics,
              Start_date:Start_date,
            },
          });
    
          ctx.send({ message: 'Submission deadline updated', data: updated });
        } catch (err) {
          ctx.internalServerError('Failed to update submission deadline');
        }
      },
      async updateReviewDeadline(ctx) {
        try {
          const { id, Review_deadline } = ctx.request.body;
    console.log('pop', ctx.request.body);
    console.log('popo',id, Review_deadline);
    
          if (!id || !Review_deadline) {
            return ctx.badRequest('Missing id or newDeadline');
          }
    
          const updated = await strapi.entityService.update('api::conference.conference', id, {
            data: {
              Review_deadline: Review_deadline,
            },
          });
    
          ctx.send({ message: 'review deadline added', data: updated });
        } catch (err) {
          ctx.internalServerError('Failed to update submission deadline');
        }
      },
       async updateConferenceStatus(ctx) {
        try {
          const { id, status } = ctx.request.body;
    console.log('confo', ctx.request.body);
    
          if (!id || !status) {
            return ctx.badRequest('Missing required fields: id and status');
          }
    
          // Update the organizer's status
          const updatedConference = await strapi.entityService.update('api::conference.conference', id, {
            data: {
              
              Status:status,
            },
          });
         console.log('up dat coff',updatedConference);
         
          if (!updatedConference) {
            return ctx.notFound('conference not found');
          }
          // Fetch the conference and populate the organizer relationship
const conference = await strapi.entityService.findOne('api::conference.conference', id, {
  populate: ['Organizer']  // Ensure 'organizer' relation is populated
});

if (!conference || !(conference as any).Organizer) {
  return ctx.badRequest('Organizer not found for this conference');
}

// Extract organizer details
const organizerId = (conference as any).Organizer.id;
const organizerEmail = (conference as any).Organizer.Organizer_Email;

// Fetch the conference title separately (optional)
const conferenceTitle = conference.Conference_title;

console.log('Organizer ID:', organizerId);
console.log('Organizer Email:', organizerEmail);
console.log('Conference Title:', conferenceTitle);

      
          // const transporter = nodemailer.createTransport({
          //   service: 'gmail',
          //   auth: {
          //     user: 'mudassiralishah555@gmail.com',  // Your Gmail address
          //     pass: 'mfrm qmsz yiey pgzp',   // Your Gmail password (or App Password if 2FA is enabled)
          //   },
          // });
          
          // // Function to send email
          // const sendEmail = async (to, subject, text, html) => {
          //   const mailOptions = {
          //     from: 'mudassiralishah555@gmail.com',    // Sender address
          //     to,                              // Recipient address
          //     subject,                         // Subject line
          //     text,                            // Plain text body
          //     html,                            // HTML body
          //   };
          
          //   try {
          //     await transporter.sendMail(mailOptions);
          //     console.log('Email sent successfully');
          //   } catch (error) {
          //     console.error('Error sending email:', error);
          //   }
          // };
          await sendEmail(
            organizerEmail,
            'Your Conference Status Has Been Updated',
            `Your conference "${conferenceTitle}" on bzchair has been updated to the status: ${status}.`,
            `<p>Hello,</p>
             <p>The status of your conference "<strong>${conferenceTitle}</strong>" on bzchair has been updated to <strong>${status}</strong>.</p>
             
             <p>If you have any questions, feel free to contact our support team.</p>
             <p>Best regards,<br>bzchair Team</p>`
        );
        
      
          // Respond with the updated organizer
          ctx.send({
            message: 'Status updated successfully',
            organizer: updatedConference,
          });
        } catch (error) {
          console.error('Error updating organizer status:', error);
          ctx.internalServerError('An error occurred while updating status');
        }
      },
    
}));