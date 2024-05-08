import { Product } from '../database/models/Product';
import { Size } from '../database/models/Size';
import User from '../database/models/user';
import { sendEmail } from '../helpers/send-email';
import logger from '../logs/config';

const checkProductExpiryAndNotifySeller = async () => {
  try {
    const currentDate = new Date();

    // Find all products with expired sizes and include the associated Seller
    const expiredProducts = await Product.findAll({
      include: [
        { model: Size, as: 'Sizes' },
        { model: User, as: 'Users' },
      ],
    });

    // Filtering products with expired sizes
    const productsToSendEmail: any[] = [];
    expiredProducts.forEach((product: any) => {
      const expiredSizes = product.Sizes.filter(
        (size: { expiryDate: string | number | Date }) => new Date(size.expiryDate) <= currentDate
      );
      if (expiredSizes.length > 0) {
        productsToSendEmail.push(product);
      }
    });

    // Send email to the seller for each product with expired sizes
    productsToSendEmail.forEach(async (product: any) => {
      const sellerEmail = product.Seller.email;
      const sellerName = product.Seller.name;

      const emailData = {
        type: 'product_expired',
        data: {
          name: sellerName,
          email: sellerEmail,
          productName: product.name,
        },
      };

      // Sending notification email every day 12:00AM
      await sendEmail(emailData.type, emailData.data);
    });

    logger.info('Expired product emails sent successfully.');
  } catch (error) {
    logger.error('Error sending expired product emails:', error);
  }
};

export default checkProductExpiryAndNotifySeller;
