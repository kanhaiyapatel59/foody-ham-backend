// Try to require nodemailer, fallback to null if not available
let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (error) {
  console.log('⚠️ Nodemailer not installed, using mock emails only');
}

// Create transporter based on environment
const createTransporter = () => {
  if (process.env.EMAIL_ENABLED === 'true' && nodemailer) {
    try {
      return nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } catch (error) {
      console.log('⚠️ Nodemailer configuration failed, using mock emails');
      return null;
    }
  }
  return null;
};

let transporter = null;
try {
  transporter = createTransporter();
} catch (error) {
  console.log('⚠️ Email service initialization failed, using mock emails');
}

const emailService = {
  async sendOrderConfirmation(userEmail, orderData) {
    if (process.env.EMAIL_ENABLED === 'true' && transporter) {
      // Send real email
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: userEmail,
          subject: '🍕 Order Confirmation - Foody-Ham',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Order Confirmed! 🎉</h2>
              <p>Hi ${orderData.customerName},</p>
              <p>Thank you for your order! We're preparing your delicious meal.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Order Details:</h3>
                <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
                <p><strong>Items:</strong></p>
                <ul>
                  ${orderData.items.map(item => `<li>${item.name} x${item.quantity}</li>`).join('')}
                </ul>
              </div>
              
              <p><strong>Status:</strong> Order confirmed and being prepared</p>
              <p><strong>Estimated delivery:</strong> 30-45 minutes</p>
              
              <p>Thank you for choosing Foody-Ham! 🍽️</p>
            </div>
          `
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Real email sent:', result.messageId);
        return {
          success: true,
          messageId: result.messageId,
          message: 'Order confirmation email sent successfully'
        };
      } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw error;
      }
    } else {
      // Mock email - just log to console
      console.log('\n📧 MOCK EMAIL SENT:');
      console.log('To:', userEmail);
      console.log('Subject: Order Confirmation - Foody-Ham');
      console.log('Order ID:', orderData.orderId);
      console.log('Total:', `$${orderData.total}`);
      console.log('Items:', orderData.items.map(item => `${item.name} x${item.quantity}`).join(', '));
      console.log('Status: Order confirmed and being prepared');
      console.log('Estimated delivery: 30-45 minutes');
      console.log('─────────────────────────────────────\n');
      
      return {
        success: true,
        messageId: 'mock_' + Date.now(),
        message: 'Order confirmation email sent successfully'
      };
    }
  },

  async sendOrderStatusUpdate(userEmail, orderData, newStatus) {
    if (process.env.EMAIL_ENABLED === 'true' && transporter) {
      // Send real email
      try {
        const statusMessages = {
          preparing: 'Your order is being prepared! 👨‍🍳',
          ready: 'Your order is ready for pickup/delivery! 🚚',
          delivered: 'Your order has been delivered! Enjoy! 🎉'
        };
        
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: userEmail,
          subject: `📦 Order Status Update - ${newStatus.toUpperCase()}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Order Status Update</h2>
              <p>Hi ${orderData.customerName},</p>
              <p>${statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`}</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                <p><strong>Status:</strong> ${newStatus.toUpperCase()}</p>
              </div>
              
              <p>Thank you for choosing Foody-Ham! 🍽️</p>
            </div>
          `
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Status update email sent:', result.messageId);
        return {
          success: true,
          messageId: result.messageId,
          message: 'Status update email sent successfully'
        };
      } catch (error) {
        console.error('❌ Status email sending failed:', error);
        throw error;
      }
    } else {
      // Mock email
      console.log('\n📧 MOCK STATUS UPDATE EMAIL:');
      console.log('To:', userEmail);
      console.log('Subject: Order Status Update - Foody-Ham');
      console.log('Order ID:', orderData.orderId);
      console.log('New Status:', newStatus);
      console.log('─────────────────────────────────────\n');
      
      return {
        success: true,
        messageId: 'mock_status_' + Date.now(),
        message: 'Status update email sent successfully'
      };
    }
  }
};

module.exports = emailService;