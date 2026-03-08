const { prepare } = require('../config/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Export employees as Excel
exports.exportExcel = async (req, res) => {
  try {
    const employees = prepare('SELECT * FROM employees ORDER BY id').all();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Employee ID', key: 'employee_id', width: 15 },
      { header: 'Full Name', key: 'full_name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Company', key: 'company_name', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Date of Joining', key: 'date_of_joining', width: 15 },
      { header: 'Aadhaar', key: 'aadhaar_number', width: 15 },
      { header: 'PAN', key: 'pan_number', width: 15 },
      { header: 'Bank Name', key: 'bank_name', width: 20 },
      { header: 'IFSC Code', key: 'ifsc_code', width: 15 },
      { header: 'Branch', key: 'branch_name', width: 20 },
      { header: 'Account No', key: 'account_number', width: 20 },
      { header: 'Salary', key: 'salary', width: 12 },
      { header: 'Status', key: 'status', width: 10 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A237E' } };

    employees.forEach(emp => worksheet.addRow(emp));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
};

// Export employees as PDF
exports.exportPDF = (req, res) => {
  try {
    const employees = prepare('SELECT * FROM employees ORDER BY id').all();

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.pdf');
    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Veera Group - Employee Report', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    // Table headers
    const headers = ['#', 'Emp ID', 'Name', 'Email', 'Department', 'Designation', 'Salary', 'Status'];
    const colWidths = [30, 70, 100, 140, 80, 80, 70, 60];
    let startX = 30;
    let y = doc.y;

    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, startX, y, { width: colWidths[i], align: 'left' });
      startX += colWidths[i] + 5;
    });

    y += 20;
    doc.moveTo(30, y).lineTo(770, y).stroke();
    y += 5;

    doc.font('Helvetica').fontSize(8);
    employees.forEach((emp, index) => {
      if (y > 520) {
        doc.addPage();
        y = 30;
      }
      startX = 30;
      const row = [index + 1, emp.employee_id, emp.full_name, emp.email, emp.department || '-', emp.designation || '-', `Rs.${emp.salary}`, emp.status];
      row.forEach((cell, i) => {
        doc.text(String(cell || ''), startX, y, { width: colWidths[i], align: 'left' });
        startX += colWidths[i] + 5;
      });
      y += 18;
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
};
