import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Gmail App Password
  },
});

export const sendWelcomeMail = async (email, name) => {
  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>ยินดีต้อนรับสู่ Rungroj CarRental</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #ff7a18, #ff9f1c);
          padding: 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
          color: #333;
        }
        .content h2 {
          margin-top: 0;
        }
        .content p {
          line-height: 1.6;
          font-size: 16px;
        }
        .button {
          display: inline-block;
          margin-top: 20px;
          padding: 14px 28px;
          background: #ff7a18;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 30px;
          font-weight: bold;
          font-size: 16px;
        }
        .features {
          margin-top: 30px;
        }
        .feature {
          margin-bottom: 10px;
        }
        .footer {
          background: #f9f9f9;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #777;
        }
        .footer strong {
          color: #ff7a18;
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 ยินดีต้อนรับสู่ Rungroj CarRental</h1>
        </div>

        <div class="content">
          <h2>สวัสดีครับ คุณ${name} 👋</h2>

          <p>
            เรายินดีที่คุณเข้าร่วมกับเรา! บัญชีของคุณถูก
            <strong>สร้างเรียบร้อยแล้ว</strong>
          </p>

          <p>
            กับ <strong>Rungroj CarRental รุ่งโรจน์คาร์เร้นท์</strong> คุณสามารถจองรถเช่าอุดรธานีได้ง่ายๆ
            ทั้งรถเช่าขับเอง และรถเช่าพร้อมคนขับ รถใหม่ สะอาด ปลอดภัย
          </p>

          <div class="features">
            <div class="feature">✅ รถใหม่ สะอาด ปลอดภัย</div>
            <div class="feature">✅ บริการรับ-ส่งฟรีที่สนามบิน</div>
            <div class="feature">✅ ฟรีประกันภัยชั้น 1</div>
            <div class="feature">✅ ไม่ต้องใช้บัตรเครดิต</div>
          </div>

          <p style="margin-top: 20px;">
            📞 โทร: 086-634-8619 / 096-363-8519
          </p>

          <a href="http://localhost:5173/profile" class="button">
            เข้าสู่แดชบอร์ด
          </a>
        </div>

        <div class="footer">
          <p>
            ต้องการความช่วยเหลือ? ตอบกลับอีเมลนี้ได้เลย เรายินดีช่วยเสมอ 😊
          </p>
          <p>
            © ${new Date().getFullYear()} <strong>Rungroj CarRental รุ่งโรจน์คาร์เร้นท์</strong> สงวนลิขสิทธิ์
          </p>
        </div>
      </div>
    </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"Rungroj CarRental 🚗" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "🎉 ยินดีต้อนรับสู่ Rungroj CarRental รุ่งโรจน์คาร์เร้นท์!",
    html: htmlTemplate,
  });
};
