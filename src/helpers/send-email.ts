import { config } from 'dotenv';
import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import logger from '../logs/config';
import { Product } from '../database/models/Product';

config();

interface IData {
  email: string;
  name: string;
  link?: string;
  otp?: string;
  productName?: string;
}
interface EmailContent {
  name: string;
  intro: string;
  otp: {
    bold: boolean;
    content: string;
  };
  outro: string;
}

const { EMAIL, PASSWORD } = process.env;

export const sendEmail = async (type: string, data: IData) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Mavericks-team',
        link: 'https://mailgen.js/',
      },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL,
        pass: PASSWORD,
      },
    });

    const mailOptions = {
      from: EMAIL,
      to: data.email,
      subject: '',
      html: '',
    };

    let email;

    switch (type) {
      case 'account_verify':
        email = {
          body: {
            name: data.name,
            intro: "Welcome to Mavericks E-Commerce! We're very excited to have you on board.",
            action: {
              instructions: 'To verify your acccount on Mavericks, please click here:',
              button: {
                color: '#22BC66',
                text: 'Confirm your account',
                link: `${data.link}`,
              },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
          },
        };

        mailOptions.subject = 'Account confirmation';
        mailOptions.html = mailGenerator.generate(email);
        break;

      case 'User_Account_Blocked':
        email = {
          body: {
            name: data.name,
            intro: 'Your account has been blocked due to violation of our terms and conditions.',
            action: {
              instructions: 'If you believe this is an error, please contact support at support@yourapp.com.',
              button: {
                color: '#22BC66',
                text: 'Contact Support',
                link: 'mailto:support@yourapp.com',
              },
            },
            outro: 'Thank you for your understanding.',
          },
        };

        mailOptions.subject = 'Account Blocked';
        mailOptions.html = mailGenerator.generate(email);
        break;

      case 'User_Account_unblocked':
        email = {
          body: {
            name: data.name,
            intro: 'Your account has been unblocked.',
            action: {
              instructions: 'You can now access your account again.',
              button: {
                color: '#22BC66',
                text: 'Access Account',
                link: 'https://e-commerce-mavericks.com/login',
              },
            },
            outro: 'If you did not request this action, please contact support immediately.',
          },
        };

        mailOptions.subject = 'Account Blocked';
        mailOptions.html = mailGenerator.generate(email);
        break;

      case 'user_account_verification':
        email = {
          body: {
            name: data.name,
            intro: "Welcome to Mailgen! We're very excited to have you on board.",
            action: {
              instructions: 'To get started with Mailgen, please click here:',
              button: {
                color: '#22BC66',
                text: 'Confirm your account',
                link: 'https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010',
              },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
          },
        };
        mailOptions.subject = 'Verification of Email';
        mailOptions.html = mailGenerator.generate(email);
        break;
      case 'reset_password':
        email = {
          body: {
            name: data.name,
            intro: "Welcome to Mailgen! We're very excited to have you on board.",
            action: {
              instructions: 'To get started with Mailgen, please click here:',
              button: {
                color: '#22BC66',
                text: 'Confirm your account',
                link: 'https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010',
              },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
          },
        };
        mailOptions.subject = 'Reset password';
        mailOptions.html = mailGenerator.generate(email);
        break;
      case 'product_expired':
        email = {
          body: {
            name: data.name,
            intro: ` Your product ${data.productName} has been delisted due to expiration please check and take action.`,
            action: {
              instructions: 'If you have any questions or need assistance, please contact our support team.',
              button: {
                color: '#22BC66',
                text: 'Contact Support',
                link: 'mailto:andela.mavericks@gmail.com',
              },
            },
            outro: 'Thank you for your understanding.',
          },
        };

        mailOptions.subject = 'Product Delisted';
        mailOptions.html = mailGenerator.generate(email);
        break;

      case 'OTP':
        const emailContent = `
        <html>
          <head>
            <style>
              /* CSS styles */
              body {
                font-family: Arial, sans-serif;
                line-height: 1.3;
                background-color: #f4f4f4;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
              }
              .otp {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
              }
              .footer {
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 style="text-align: center; color: #007bff;">Verification Code</h1>
              <p style="text-align: center;">Hello ${data.name},</p>
              <p style="text-align: center;">Your verification code is:</p>
              <p class="otp" style="text-align: center;">${data.otp}</p>
              <p style="text-align: center;">Use this code to verify your account.</p>
              <p style="text-align: center;">Regards,<br/>Mavericks Team</p>
            </div>
          </body>
        </html>
        `;

        mailOptions.subject = 'Verification code';
        mailOptions.html = emailContent;
        break;
      case 'added_product_notification':
        email = {
          body: {
            name: data.name,
            intro: `Your product has been added successfully!`,
            action: {
              instructions: 'To view your product on platform, Click here:',
              button: {
                color: '#22BC66',
                text: 'View on the platform',
                link: 'https://e-commerce-mavericks.com/login',
              },
            },
            outro: 'Thank you for working with us. If you need any help, please free to contact us!',
          },
        };
        mailOptions.subject = 'Product added successfully';
        mailOptions.html = mailGenerator.generate(email);
        break;
    }
    const info = await transporter.sendMail(mailOptions);
    logger.info('Send Mailer', info);
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
  }
};
