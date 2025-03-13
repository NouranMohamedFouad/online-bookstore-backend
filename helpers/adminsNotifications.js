import {UsersController} from '../controllers/index.js';
import {sendEmail} from '../services/emailService.js';

export const notifyAdmins = async () => {
  const [err, users] = await UsersController.getAll();
  if (err) {
    console.error('Error fetching users:', err);
    return;
  }
  const admins = users.filter((user) => user.role === 'admin');
  console.log(admins);

  const emailText = `
  📢 **New Order Notification**  

  Dear Admin,

  A new order has been placed with the following details:  

  Please review and process the order at your earliest convenience.  

  Best regards,  
  **The LitVerse Team**  
`;
  console.log(emailText);

  admins.forEach(async (admin) => {
    await sendEmail(admin.email, 'New Order Notification', emailText);
    console.log(`Email sent to admin: ${admin.email}`);
  });
};

/*

🔹 **Customer Name:** ${data.user.name}
  🔹 **Customer Email:** ${data.user.email}
  🔹 **Order ID:** ${data.order.orderId}
  🔹 **Total Price:** $${data.order.totalPrice}
  🔹 **Order Date:** ${data.order.createdAt}
*/
