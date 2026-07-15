const fs = require("fs");
const path = require("path");
const {
  AlignmentType,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} = require("docx");

const output = path.join(
  __dirname,
  "..",
  "demo-documents",
  "04_procurement_purchase_requisition_sop.docx",
);

const steps = [
  "A requestor creates a purchase requisition in Coupa with business justification, cost centre, category, supplier suggestion, expected value, and required-by date.",
  "The requestor attaches at least one supplier quote for purchases over 5,000 EUR. Requests without a quote are returned for completion unless a documented sole-source exemption applies.",
  "Coupa routes the requisition to the Budget Owner. The Budget Owner confirms available budget and approves or rejects within two business days.",
  "A requisition above 25,000 EUR routes to the Procurement Specialist for sourcing review. A requisition above 100,000 EUR also routes to the Finance Controller.",
  "The Procurement Specialist checks the supplier record, conflict-of-interest declaration, contract coverage, and quote comparison. The specialist records the selected supplier and reason in Coupa.",
  "After approvals, Procurement converts the requisition into a purchase order in Coupa. Coupa sends the purchase order to the supplier and posts the commitment to NetSuite overnight.",
  "The requestor confirms delivery in Coupa within two business days of receipt. Accounts Payable may not pay an invoice without a valid purchase order and goods receipt, except through the urgent-payment exception process.",
  "Procurement retains the requisition, approvals, quotes, exemption evidence, purchase order, and receipt confirmation in Coupa for seven years.",
];

const doc = new Document({
  creator: "FlowLens",
  title: "Procurement purchase requisition SOP",
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Arial", size: 28, bold: true },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Arial", size: 24, bold: true },
        paragraph: { spacing: { before: 140, after: 80 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "procedure",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 840, right: 900, bottom: 840, left: 900 },
        },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: "FLOWLENS DEMO DOCUMENT", bold: true, size: 20 })],
        }),
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("Procurement purchase requisition SOP")],
        }),
        new Paragraph("Organisation: Northstar Retail (fictional)"),
        new Paragraph("SOP ID: PROC-PR-001 | Version: 1.0 | Effective date: 2026-07-01"),
        new Paragraph("Owner: Head of Procurement | Review cadence: annual"),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Purpose")] }),
        new Paragraph(
          "Ensure that purchases are necessary, properly approved, competitively sourced where required, and supported by an auditable purchase order before supplier commitment.",
        ),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Roles and systems")] }),
        new Paragraph(
          "Requestor creates the request and confirms delivery. Budget Owner confirms budget. Procurement Specialist conducts sourcing and supplier checks. Finance Controller approves high-value requests. Accounts Payable uses the purchase order and goods receipt for invoice matching. Coupa is the purchasing workflow and NetSuite is the finance ledger.",
        ),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Procedure")] }),
        ...steps.map(
          (step) =>
            new Paragraph({
              numbering: { reference: "procedure", level: 0 },
              spacing: { after: 80 },
              children: [new TextRun(step)],
            }),
        ),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Risks and controls")] }),
        new Paragraph(
          "Risk: employees commit spend before approval. Control: suppliers receive purchase orders only from Coupa. Risk: purchases bypass competitive sourcing. Control: quote and exemption evidence is required above 5,000 EUR. Risk: invoices are paid without proof of delivery. Control: Accounts Payable requires a three-way match between invoice, purchase order, and goods receipt.",
        ),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Known issues")] }),
        new Paragraph(
          "Requestors frequently submit incomplete business justification. Budget Owners approve from email but do not always complete the Coupa task. Coupa commitments reach NetSuite overnight, so finance teams cannot see same-day committed spend. Procurement tracks expiring sole-source exemptions in a spreadsheet.",
        ),
      ],
    },
  ],
});

fs.mkdirSync(path.dirname(output), { recursive: true });
Packer.toBuffer(doc).then((buffer) => fs.writeFileSync(output, buffer));
