import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

export const generateInvoicePDF = async (payment) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          td, th { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>SmartPark - Invoice</h1>
        <p><strong>Payment Number:</strong> ${payment.paymentNumber}</p>
        <p><strong>Payment Date:</strong> ${new Date(payment.paymentDate).toLocaleString()}</p>
        <p><strong>Recorded By:</strong> ${payment.user.username}</p>

        <h2>Car Information</h2>
        <table>
          <tr><th>Plate Number</th><td>${payment.servicePackage.car.plateNumber}</td></tr>
          <tr><th>Car Type</th><td>${payment.servicePackage.car.carType}</td></tr>
          <tr><th>Driver Name</th><td>${payment.servicePackage.car.driverName}</td></tr>
          <tr><th>Phone</th><td>${payment.servicePackage.car.phoneNumber}</td></tr>
        </table>

        <h2>Package Information</h2>
        <table>
          <tr><th>Package Name</th><td>${payment.servicePackage.package.packageName}</td></tr>
          <tr><th>Description</th><td>${payment.servicePackage.package.packageDescription}</td></tr>
          <tr><th>Price</th><td>${payment.amountPaid} RWF</td></tr>
        </table>
      </body>
    </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const filePath = path.resolve(`./invoices/invoice_${payment._id}.pdf`);
  await page.pdf({ path: filePath, format: 'A4' });

  await browser.close();
  return filePath;
};
