/**
 * reviewer controller
 */
const sendEmail = require('../../email/email');
import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::reviewer.reviewer', ({ strapi }) => ({
    async registerReviewer(ctx) {
        try {
            // Destructure the fields directly from the request body
            const { firstName, lastName, email, alternativeContact, domain,subDomain, password } = ctx.request.body;
      
           
            if (!firstName || !lastName || !email || !password ) {
              return ctx.badRequest('Missing required fields.');
            }
      console.log('reviewer', ctx.request.body);
      
           
      
           
             const existingReviewer = await strapi.db.query('api::reviewer.reviewer').findOne({
      where: { email },
    });

    if (!existingReviewer) {
      return ctx.badRequest('No reviewer record found for this email. Only reviewer that have invitation by the organizer can register to the system.');
    }

    // ✅ Check if user already registered
    const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email },
    });

    if (existingUser) {
      return ctx.badRequest('A user with this email is already registered.');
    }
             if (!existingReviewer && !existingUser) {
      return ctx.badRequest('Only invited reviewers can register.');
    }
           
            const fullName = `${firstName} ${lastName}`;
            let newReviewer:any;
            const newUser = await strapi.entityService.create(
              'plugin::users-permissions.user',
              {
                data: {
                  email: email,
                  password: password, // Ensure the password is hashed automatically by Strapi
                  username: fullName,
                  confirmed:true,
                  blocked:false,
                  Type:'reviewer',
                },
              }
            );
const updatedReviewer = await strapi.entityService.update('api::reviewer.reviewer', existingReviewer.id, {
  data: {
                firstName: firstName,
              lastName: lastName,
              alternativeContact: alternativeContact,
              domain:domain,
              subDoimain:subDomain,
              UserID: newUser.id,
  },
});
const defaultAuthor= await strapi.entityService.create('api::author.author',
   {
  data: {
                firstName: firstName,
              lastName: lastName,
              authorEmail:email,
              alternativeContact: alternativeContact,
              UserID: newUser.id,
  },
});

// ✅ Step 3: Link reviewerId in the user table (back-reference)
await strapi.entityService.update('plugin::users-permissions.user', newUser.id, {
  data: {
    reviewerId: updatedReviewer.id,
    authorId: defaultAuthor.id
  },
});
            
            ctx.send({
              message: 'Reviewer registered successfully!',
              reviewer: {
                firstName: updatedReviewer.firstName,
                lastName: updatedReviewer.lastName,
                email: updatedReviewer.email,
              },
              user: {
                username: newUser.username,
                email: newUser.email,
               
              },
            });
          } catch (error) {
            console.error('Error during registration:', error);
            ctx.internalServerError('Something went wrong while registering the author.');
          }
    
    
    },


    async loginReviewer(ctx) {
    
      const { username, password ,role} = ctx.request.body;
      
      console.log('Request Body:', ctx.request.body); // Log the request to inspect the data
      
      
      let user;
      try {
        user = await strapi.query('plugin::users-permissions.user').findOne({
          where: {
            $or: [
              { username }, // Check by username
              { email: username } // Or check by email
            ],
          },
          populate: ["reviewerId"]
        });
      } catch (err) {
       // console.error("Error fetching user:", err);
        return ctx.badRequest("Error fetching user.");
      }
      
      if (!user) {
        
        return ctx.badRequest('Invalid credentials');
      }
      if (!user.reviewerId) {
  return ctx.badRequest('Invalid credentials: Not a reviewer');
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
            populate: '*', 
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
    async requestReview(ctx) {
      try {
        const { paperId, reviewerId, status } = ctx.request.body;
    
        console.log("Request Body:", ctx.request.body);
        const reviewer = await strapi.entityService.findOne('api::reviewer.reviewer', reviewerId, {
          fields: ['email', 'firstName', 'lastName'],
        });
        
        const reviewerEmail = reviewer?.email;
        
        if (!reviewerEmail) {
          return ctx.throw(400, 'Reviewer email not found');
        }
        const updatedPaper = await strapi.db.query("api::paper.paper").update({
          where: { id: paperId },
          data: {
            reviewRequests: {
              connect: [{ id: reviewerId }], 
            },
          },
        });
        const paperTitle= updatedPaper.Paper_Title;
        await sendEmail(
          reviewerEmail,
          'Your Request for Paper Review Revieved',
          `Hello, Your request to review paper with title "${paperTitle}" is recieved now wait for Organizer decision for further actions.`,
          `<p>Hello,</p><p>Hello, Your request to review paper with title <strong>${paperTitle}</strong> is recieved now wait for Organizer decision for further actions. `
        );
        return ctx.send({
          message: "Request received successfully!",
          paper: updatedPaper,
        });
      } catch (error) {
        console.error("Error processing review request:", error);
    
        return ctx.badRequest("Failed to process review request");
      }
    },
    async submitReview(ctx) {
      try {
         const {
      comments,
      recommendation,
      score,
      paperId,
      reviewerId,
      significance,
      overall,
      presentation,
      originality,
      technical_quality,
      clarity,
      novelty,
      reproducibility,
      related_work,
      experimental_validation,
      writing_quality
    } = ctx.request.body;

        console.log("Request Body:", ctx.request.body);
        const reviewer = await strapi.entityService.findOne('api::reviewer.reviewer', reviewerId, {
          fields: ['email', 'firstName', 'lastName'],
        });
        
        const reviewerEmail = reviewer?.email;
        
        if (!reviewerEmail) {
          return ctx.throw(400, 'Reviewer email not found');
        }
         const reviewData: Record<string, any> = {
  paper: paperId,
  reviewer: reviewerId,
};

    // Optional fields — only add if provided
    if (comments !== undefined) reviewData.Comments = comments;
    if (recommendation !== undefined) reviewData.Recommendations = recommendation;
    if (score !== undefined) reviewData.Score = score;
    if (significance !== undefined) reviewData.significance = significance;
    if (overall !== undefined) reviewData.overall = overall;
    if (presentation !== undefined) reviewData.presentation = presentation;
    if (originality !== undefined) reviewData.originality = originality;
    if (technical_quality !== undefined) reviewData.technical_quality = technical_quality;
    if (clarity !== undefined) reviewData.clarity = clarity;
    if (novelty !== undefined) reviewData.novelty = novelty;
    if (reproducibility !== undefined) reviewData.reproducibility = reproducibility;
    if (related_work !== undefined) reviewData.related_work = related_work;
    if (experimental_validation !== undefined) reviewData.experimental_validation = experimental_validation;
    if (writing_quality !== undefined) reviewData.writing_quality = writing_quality;

    const review = await strapi.entityService.create('api::review.review', {
      data: reviewData,
    });
      const updatedPaper = await strapi.db.query("api::paper.paper").update({
        where: { id: paperId },
        data: {
          reviewRequestsConfirmed: {
            disconnect: [{ id: reviewerId }],
          },
        },});
        const paperTitle= updatedPaper.Paper_Title;
    const textBody = `Hello ${reviewer.firstName + ' ' + reviewer.lastName || ''},

Thank you for submitting your review for the following paper:

Title: "${paperTitle}"
Paper Id: "${updatedPaper.id}"
We have received your review successfully. Your contribution is highly appreciated and plays a vital role in maintaining the quality of the conference.

Best regards,  
The Organizing Committee`;

const htmlBody = `
  <p>Hello ${reviewer.firstName + ' ' + reviewer.lastName || ''},</p>
  <p>Thank you for submitting your review for the following paper:</p>
  <ul>
    <li><strong>Title:</strong> "${paperTitle}"</li>
  </ul>
  <p>Your review has been received successfully.</p>
  <p>We greatly appreciate your valuable contribution to the review process and the overall success of the conference.</p>
  <p>Best regards,<br/>The Organizing Committee</p>
`;

await sendEmail(
  reviewer.email,
  `Review Submitted Successfully: "${paperTitle}"`,
  textBody,
  htmlBody
);

        return ctx.send({
          message: "Request received successfully!",
         
        });
      } catch (error) {
        console.error("Error processing review request:", error);
    
        return ctx.badRequest("Failed to process review request");
      }
    },
    
    
}));