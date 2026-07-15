"""Generate the FlowLens PDF manual-testing document."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


OUTPUT = Path(__file__).parent.parent / "output" / "pdf" / "05_order_to_cash_runbook.pdf"


def section(story: list[object], styles: object, heading: str, body: str) -> None:
    """Append a consistent heading and paragraph to the document flow."""
    story.append(Paragraph(heading, styles["Heading2"]))
    story.append(Paragraph(body, styles["BodyText"]))
    story.append(Spacer(1, 10))


def build() -> None:
    """Create a legible, paragraph-led order-to-cash runbook for upload testing."""
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="DemoTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            alignment=TA_CENTER,
            spaceAfter=8,
        )
    )
    styles["Heading2"].fontName = "Helvetica-Bold"
    styles["Heading2"].fontSize = 13
    styles["Heading2"].leading = 16
    styles["BodyText"].fontName = "Helvetica"
    styles["BodyText"].fontSize = 10
    styles["BodyText"].leading = 14

    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=LETTER,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
        title="Order-to-cash runbook",
        author="FlowLens",
    )
    story: list[object] = [
        Paragraph("FLOWLENS DEMO DOCUMENT", styles["Heading3"]),
        Paragraph("Order-to-cash runbook", styles["DemoTitle"]),
        Paragraph(
            "Organisation: Northstar Retail (fictional) | Owner: Revenue Operations Director | Version: 1.0 | Effective date: 2026-07-01",
            styles["BodyText"],
        ),
        Spacer(1, 14),
    ]

    section(
        story,
        styles,
        "Purpose",
        "Convert an approved customer order into an accurate invoice and a collected payment while preserving a clear audit trail from opportunity to cash receipt.",
    )
    section(
        story,
        styles,
        "Roles and systems",
        "Sales Representative owns opportunity data. Deal Desk approves commercial terms. Revenue Operations creates the order. Credit Control manages credit risk. Billing issues invoices. Collections follows overdue balances. Salesforce is the CRM, Coupa Contracts stores executed agreements, NetSuite is the finance ledger, Stripe processes card payments, and Zendesk records customer billing queries.",
    )
    story.append(Paragraph("Process stages", styles["Heading2"]))
    stage_style = ParagraphStyle(
        "StageCell",
        parent=styles["BodyText"],
        fontSize=8.5,
        leading=10.5,
    )
    stages = [
        ["1", "Sales", "Mark opportunity Closed Won only after the signed agreement is attached in Coupa Contracts."],
        ["2", "Deal Desk", "Check pricing, discount, term, legal entity, tax treatment, and renewal date within one business day."],
        ["3", "Revenue Operations", "Create the sales order in NetSuite using the approved Salesforce opportunity and contract data."],
        ["4", "Credit Control", "Review new accounts above the credit threshold. Place an order on credit hold when required financial evidence is missing."],
        ["5", "Billing", "Generate the invoice from the released sales order and send it using the approved customer billing contact."],
        ["6", "Collections", "Review unpaid invoices weekly, send reminder notices, and escalate disputes in Zendesk."],
    ]
    stage_rows = [
        [Paragraph(value, stage_style) for value in stage]
        for stage in stages
    ]
    table = Table(stage_rows, colWidths=[0.4 * inch, 1.25 * inch, 4.6 * inch], repeatRows=0)
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("LEADING", (0, 0), (-1, -1), 12),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#B8C2CC")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EAF2F8")),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.extend([table, Spacer(1, 14)])
    section(
        story,
        styles,
        "Service levels",
        "Deal Desk approval target: one business day. Revenue Operations order creation target: four business hours after approval. Billing invoice target: one business day after order release. Credit hold decisions must be communicated to Sales within one business day.",
    )
    section(
        story,
        styles,
        "Exceptions",
        "A missing signed agreement, incomplete tax data, or unresolved credit hold prevents order release. Sales must not promise a billing date while a credit hold is active. Billing disputes are recorded in Zendesk and assigned to either Sales, Billing, or Credit Control within four business hours.",
    )
    section(
        story,
        styles,
        "Current pain points",
        "Revenue Operations manually copies approved terms from Salesforce into NetSuite. Discount approvals are sometimes recorded in email rather than Deal Desk. Billing contacts differ between Salesforce and NetSuite. Credit holds are tracked in a shared spreadsheet and Sales does not receive a reliable status update. Collections compiles aged debt manually from NetSuite into a weekly slide deck.",
    )
    section(
        story,
        styles,
        "Risks and controls",
        "Risk: incorrect price or legal entity causes a rejected invoice. Control: Deal Desk approval and contract attachment are required before order creation. Risk: customer receives service while credit review is incomplete. Control: NetSuite credit hold blocks order release. Risk: billing disputes are not visible to Collections. Control: Zendesk ticket category and escalation owner are mandatory. Risk: terms are changed without evidence. Control: retain the original contract, approval history, sales order, invoice, payment reference, and dispute record for seven years.",
    )
    section(
        story,
        styles,
        "Improvement hypotheses to validate",
        "Integrate approved opportunity and contract fields into NetSuite order creation. Replace the credit-hold spreadsheet with workflow status visible to Sales. Use invoice data extraction and validation to identify missing billing contacts before invoice release. Create an automated aged-debt dashboard for Collections with owner, dispute status, and promised payment date.",
    )
    document.build(story)


if __name__ == "__main__":
    build()
