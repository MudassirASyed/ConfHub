/**
 * author controller
 */
const sendEmail = require('../../email/email');
const { predictDomain } = require('../../predictPaperDomain/predictDomain');
import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::author.author', ({ strapi }) => ({
    async registerAuthor(ctx) {
        
        try {
            // Destructure the fields directly from the request body
            const { firstName, lastName, email, alternativeContact, country,biography,researchInterests, password ,selectedConferenceId} = ctx.request.body;
      
            // Validation (optional)
            if (!firstName || !lastName || !email || !password ) {
              return ctx.badRequest('Missing required fields.');
            }
      console.log('authorr', ctx.request.body);
      
      const existingUser= await strapi.query('plugin::users-permissions.user').findOne({
        where: { email:email },
      });
      
            // Check if the organizer already exists by email
            const existingAuthor= await strapi.query('api::author.author').findOne({
              where: { authorEmail:email },
            });
      
            if (existingAuthor && existingUser) {
              return ctx.badRequest('Author and user with this email already exist.');
            }

            //for author that were created when multiple author in submitted paper and these were un registered
            if (existingAuthor && !existingUser) {
              const fullName = `${firstName} ${lastName}`;
        
              const newUser = await strapi.entityService.create(
                'plugin::users-permissions.user',
                {
                  data: {
                    email: email,
                    password: password, 
                    username: fullName,
                    confirmed:true,
                    blocked:false,
                    Type:'author',
                    authorId: existingAuthor.id,
                  },
                }
              );
              await strapi.entityService.update('api::author.author', existingAuthor.id, {
                data: {
                  firstName:firstName,
                  lastName:lastName,
                  alternativeContact: alternativeContact,
                  country:country,
                  biography:biography,
                  researchInterest:researchInterests,
                  UserID: newUser.id,
                   selected_conferences:selectedConferenceId,
                },
              });
             console.log('in condition when  author that were created when multiple author in submitted paper ');
             
              return ctx.send({ message: 'Author linked and user created.' });
            }    
            // Create the new author 
            if (!existingAuthor && !existingUser) {
              console.log('in condition new author');   
            const fullName = `${firstName} ${lastName}`;
            let newAuthor:any;
            const newUser = await strapi.entityService.create(
              'plugin::users-permissions.user',
              {
                data: {
                  email: email,
                  password: password, // Ensure the password is hashed automatically by Strapi
                  username: fullName,
                  confirmed:true,
                  blocked:false,
                  Type:'author',
                },
              }
            );
            newAuthor = await strapi.entityService.create('api::author.author', {
              data: {
                firstName: firstName,
              lastName: lastName,
              authorEmail: email,
              alternativeContact: alternativeContact,
              country:country,
              biography:biography,
              researchInterest:researchInterests,
              UserID: newUser.id,
              selected_conferences:selectedConferenceId,
            },
          });
          await strapi.entityService.update(
            'plugin::users-permissions.user',
            newUser.id, // ID of the user to update
            {
              data: {
                authorId: newAuthor.id, // Add the organizer ID to the user
              },
            }
          ); return ctx.send({ message: 'Author and user created.' });
        }
    
        // If user exists but author doesn't — likely invalid scenario
        return ctx.badRequest('User already exists but no linked author.');
      } catch (err) {
        console.error('Registration error:', err);
        return ctx.internalServerError('Something went wrong during registration.');
      }
    
    
    },
    async loginAuthor(ctx) {
            const { username, password ,role} = ctx.request.body;
            
          
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
                populate: ["authorId"]
              });
            } catch (err) {
             // console.error("Error fetching user:", err);
              return ctx.badRequest("Error fetching user.");
            }
            console.log("rr",user);
            
            if (!user) {
              
              return ctx.badRequest('Invalid credentials');
            }
           if (!user.authorId) {
  return ctx.badRequest('Invalid credentials: Not an author');
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
   async submitPaper(ctx) {
      try {
        const { paperTitle, abstract, submittedBy, submittedTo ,selectedTrack,authors} = ctx.request.body;
        const files = ctx.request.files ;
  console.log('papper',ctx.request.body);    

  const author = await strapi.entityService.findOne('api::author.author', submittedBy, {
    populate: '*'
});

if (!author) {
    return ctx.badRequest('Invalid SubmittedBy ID: Author not found');
}
let domain;
try {
  domain = await predictDomain(paperTitle, abstract);
  console.log("Predicted Domain:", domain);
} catch (error) {
  console.error("Failed to predict domain", error);
  domain = "Unknown"; // fallback if AI fails
}


const authorName = `${author.firstName} ${author.lastName}`;
const authorEmail = author.authorEmail
          const newPaper = await strapi.entityService.create('api::paper.paper', {
              data: {
                  Paper_Title: paperTitle,
                  Abstract: abstract,
                  submissionDate: new Date(),
                  submitted_by: submittedBy,
                  SubmittedTo: submittedTo,
                  conference:submittedTo,
                  Domain:domain,
                  Author:authorName,
                  Selected_Track:selectedTrack
              },
          });
         // console.log('ctx.request.body.authors', ctx.request.body.authors);

          //for multiple authorss
          if (authors!==0) {
            let parsedAuthors;
  

  try {
    parsedAuthors = typeof authors === 'string' ? JSON.parse(authors) : authors;
  } catch (err) {
    console.error('Invalid authors JSON:', err);
  }

  if (Array.isArray(parsedAuthors) && parsedAuthors.length > 0) {
    const authorNames = parsedAuthors
      .map(a => a.name)
      .filter(Boolean)
      .join(', ');

    const updatedAuthorField = `${authorName}${authorNames ? ', ' + authorNames : ''}`;
    console.log('uii', updatedAuthorField);

    await strapi.entityService.update('api::paper.paper', newPaper.id, {
      data: {
        Author: updatedAuthorField,
      },
    });
  }


            try {
              const parsedAuthors = Array.isArray(ctx.request.body.authors)
                ? ctx.request.body.authors
                : JSON.parse(ctx.request.body.authors);

              // Step 2: Check it's not empty
              const emails = parsedAuthors.map((author) => author.email); // Step 3: Extract emails

              // Step 4: Check if these authors already exist in DB
              const existingAuthors = await strapi.db
                .query("api::author.author")
                .findMany({
                  where: {
                    authorEmail: {
                      $in: emails,
                    },
                  },
                });
              const foundEmails = existingAuthors.map(
                (author) => author.authorEmail
              );

              // Get not registered emails
              const notRegistered = parsedAuthors
                .filter((author) => !foundEmails.includes(author.email))
                .map((author) => author.email);

              // console.log("Existing authors found:", existingAuthors);
              // console.log("Authors not registered:", notRegistered);
              const newAuthorIds = [];
              for (const author of notRegistered) {
                const newAuthor = await strapi.db.query("api::author.author").create({
                  data: {
                    authorEmail: author,
                  },
                });
                newAuthorIds.push({ id: newAuthor.id });
                try {
                  const registerUrl = 'https://www.bzchair.org/register';
                  await sendEmail(
                    author,
                    'You have been added as a Co-Author in bzchair',
                    `You have been added as a co-author for a paper submission in bzchair with paper title ${newPaper.Paper_Title}. Please register using this email (${author}) to access your paper.`,
                    `<p>Hello,</p>
                     <p>You have been added as a co-author for a paper submission in <strong>bzchair</strong> with paper title ${newPaper.Paper_Title}.</p>
                     <p>Please <a href="${registerUrl}">register</a> using this email address (<strong>${author}</strong>) to view your paper and participate.</p>`
                );
                  console.log(`Invitation email sent to ${author}`);
                } catch (err) {
                  console.error(`Failed to send email to ${author}`, err);
                }
              }
              const existingAuthorIds = existingAuthors.map((author) => ({
                id: author.id,
              }));

            //  console.log("authoreee", existingAuthorIds);
              
              // Step 4: Combine all authors to connect
              const allAuthorsToConnect = [...existingAuthorIds, ...newAuthorIds];
              console.log("Connecting authors:", allAuthorsToConnect);
              
              await strapi.db.query("api::paper.paper").update({
                where: { id: newPaper.id },
                data: {
                  submitted_by: {
                    connect: allAuthorsToConnect,
                  },
                },
              });
            } catch (err) {
              console.error("Invalid authors JSON format:", err);
            }
          } else {
            console.log("No Multiple authors.");
          }
        


          
          // If files are uploaded, associate them with the new paper
          if (files && files.file) {
            const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
              files: files.file, // Ensure that the correct field is used here (files.file or files[0] depending on the structure)
              data: {
                refId: newPaper.id,
                ref: 'api::paper.paper',
                field: 'file', // Field name in the content type (must match the field defined in the content type)
              },
            });
      
            await strapi.entityService.update('api::paper.paper', newPaper.id, {
              data: {
                file: uploadedFiles[0].id, // Assuming it's a single file upload
              },
            });
            
           // console.log('New Paper:', newPaper);
          }
   let conferenceTitle = '';

        let organizerEmail=''; 
            // Fetch the conference (submittedTo) by ID
           const conference: any = await strapi.entityService.findOne(
  'api::conference.conference',
  submittedTo,
  { populate: ['Papers','Organizer'] }
);
             
              
    conferenceTitle = conference.Conference_title || '';
    organizerEmail=conference.Organizer?.Organizer_Email;

          
          const textBody = `Dear ${authorName},

Your paper has been successfully submitted.

Paper ID: ${newPaper.id}
Title: "${paperTitle}"
Conference: ${conferenceTitle}

Thank you for your contribution.

Best regards,  
The Organizing Committee`;

const htmlBody = `
  <p>Dear ${authorName},</p>
  <p>Your paper has been successfully submitted.</p>
  <ul>
    <li><strong>Paper ID:</strong> ${newPaper.id}</li>
    <li><strong>Title:</strong> "${paperTitle}"</li>
    <li><strong>Conference:</strong> ${conferenceTitle}</li>
  </ul>
  <p>Now wait for the further process.Thank you for your contribution.</p>
  <p>Best regards,<br/>The Organizing Committee</p>
`;

// 4. Send the email
await sendEmail(
  authorEmail,
  `Paper Submission Confirmation: "${paperTitle}"`,
  textBody,
  htmlBody
);


//send email to organizer to


  const organizerText = `Dear Organizer,

A new paper has been submitted to your conference.

Conference: ${conferenceTitle}
Paper ID: ${newPaper.id}
Title: "${paperTitle}"
Author: ${authorName}

Please review it in your dashboard.

Regards,
BZChair`;

  const organizerHtml = `
    <p>Dear Organizer,</p>
    <p>A new paper has been submitted.</p>
    <ul>
      <li><strong>Conference:</strong> ${conferenceTitle}</li>
      <li><strong>Paper ID:</strong> ${newPaper.id}</li>
      <li><strong>Title:</strong> "${paperTitle}"</li>
      <li><strong>Author:</strong> ${authorName}</li>
    </ul>
    <p>You can review it on your panel.</p>
    <p>Regards,<br/>BZChair</p>
  `;
 

await sendEmail(
  organizerEmail,
  `New Paper Submission - ${paperTitle}`,
  organizerText,
  organizerHtml,
);




          ctx.send({
              message: 'Paper submitted successfully',
              paper: newPaper,
          });
      } catch (error) {
          ctx.throw(500, 'An error occurred while submitting the paper', error);
      }
  },
   async updateSelectedConferences(ctx) {
  const { conferenceId, authorId } = ctx.request.body;

  try {
    // 1️⃣ Fetch author with current selected_conferences
    const author = await strapi.db.query("api::author.author").findOne({
      where: { id: authorId },
      populate: ["selected_conferences"],
    });

    if (!author) {
      return ctx.notFound("Author not found");
    }

    // 2️⃣ Check if conference already exists in selected_conferences
    const alreadyExists = author.selected_conferences.some(
      (conf) => conf.id === conferenceId
    );

    if (alreadyExists) {
      return ctx.send({
        message: "Conference already selected for this author",
      });
    }

    // 3️⃣ Add new conference to existing list
    const updatedConferences = [
      ...author.selected_conferences.map((conf) => conf.id),
      conferenceId,
    ];

    // 4️⃣ Update author record
    const updatedAuthor = await strapi.db.query("api::author.author").update({
      where: { id: authorId },
      data: {
        selected_conferences: updatedConferences,
      },
      populate: ["selected_conferences"],
    });

    return ctx.send({
      message: "Selected conference updated successfully",
      data: updatedAuthor,
    });

  } catch (err) {
    console.error("Error updating selected conferences:", err);
    return ctx.internalServerError("Error updating selected conferences.");
  }
}

      
      
    
}));
