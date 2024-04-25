import { config } from 'dotenv';
import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import logger from '../logs/config';

config();

interface IData {
  email: string;
  name: string;
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
      case 'administrator_account_verification':
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

        mailOptions.subject = 'this is a subject';
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
    }
    const info = await transporter.sendMail(mailOptions);
    logger.info(info);
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
  }
};
