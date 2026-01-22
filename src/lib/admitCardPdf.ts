import { jsPDF } from "jspdf";

interface AdmitCardData {
  admitCardNumber: string;
  applicationNumber: string;
  studentName: string;
  courseName: string;
  preferredCollege: string | null;
  stream: string | null;
  generatedAt: string;
  studentEmail?: string;
  studentPhone?: string;
}

export const generateAdmitCardPDF = (data: AdmitCardData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background
  doc.setFillColor(30, 64, 175); // Blue
  doc.rect(0, 0, pageWidth, 50, "F");
  
  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("ADMIT CARD", pageWidth / 2, 25, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Academic Admission Portal", pageWidth / 2, 38, { align: "center" });
  
  // Admit Card Number Box
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(30, 64, 175);
  doc.roundedRect(20, 60, pageWidth - 40, 25, 3, 3, "FD");
  
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ADMIT CARD NUMBER", pageWidth / 2, 70, { align: "center" });
  
  doc.setFontSize(18);
  doc.text(data.admitCardNumber, pageWidth / 2, 80, { align: "center" });
  
  // Student Details Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT DETAILS", 20, 105);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 108, pageWidth - 20, 108);
  
  const detailsStartY = 120;
  const lineHeight = 12;
  
  const details = [
    { label: "Name", value: data.studentName },
    { label: "Application Number", value: data.applicationNumber },
    { label: "Course", value: data.courseName },
    { label: "College", value: data.preferredCollege || "Not Specified" },
    { label: "Stream", value: data.stream || "Not Specified" },
  ];
  
  if (data.studentEmail) {
    details.push({ label: "Email", value: data.studentEmail });
  }
  
  if (data.studentPhone) {
    details.push({ label: "Phone", value: data.studentPhone });
  }
  
  details.forEach((detail, index) => {
    const y = detailsStartY + index * lineHeight;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${detail.label}:`, 25, y);
    doc.setFont("helvetica", "normal");
    doc.text(detail.value, 80, y);
  });
  
  // Important Instructions
  const instructionsY = detailsStartY + details.length * lineHeight + 20;
  
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(234, 179, 8);
  doc.roundedRect(20, instructionsY, pageWidth - 40, 45, 3, 3, "FD");
  
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT INSTRUCTIONS", 25, instructionsY + 12);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const instructions = [
    "1. This admit card must be presented for verification during admission.",
    "2. Carry a valid photo ID along with this admit card.",
    "3. Report to the admission office as per the scheduled date.",
  ];
  
  instructions.forEach((instruction, index) => {
    doc.text(instruction, 25, instructionsY + 22 + index * 7);
  });
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, footerY, pageWidth - 20, footerY);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(
    `Generated on: ${new Date(data.generatedAt).toLocaleString()}`,
    pageWidth / 2,
    footerY + 10,
    { align: "center" }
  );
  doc.text(
    "This is a computer generated document.",
    pageWidth / 2,
    footerY + 18,
    { align: "center" }
  );
  
  // Save PDF
  doc.save(`AdmitCard_${data.admitCardNumber}.pdf`);
};
