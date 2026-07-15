# FlowLens manual testing pack

Every document in this pack is original, fictional test data. It contains no personal, customer, or production information.

## Suggested test flow

1. Create a project named `Northstar Operations Transformation`.
2. Upload all five documents below.
3. Confirm each upload reaches the `Ready` state and that the document list retains the original filename.
4. Generate an analysis.
5. Check that the report identifies the named actors, systems, pain points, risks, automation opportunities, and a phased roadmap.
6. Ask the project chat: `What should Northstar automate first, and what evidence supports that recommendation?`

## Files

| File | Upload purpose | Expected signals |
| --- | --- | --- |
| `01_customer_onboarding_meeting_notes.txt` | Unstructured meeting notes | Handoffs, duplicate entry, missing purchase orders, the two-day kickoff target |
| `02_accounts_payable_sop.md` | Structured Markdown SOP | Invoice intake process, approval thresholds, ERP and workflow systems, late-payment risk |
| `03_invoice_exception_log.csv` | Tabular operational evidence | Repeated missing-PO and duplicate-invoice exceptions, resolution SLA pressure |
| `04_procurement_purchase_requisition_sop.docx` | Word extraction | Procurement roles, sourcing threshold, three-way match, audit trail |
| `../output/pdf/05_order_to_cash_runbook.pdf` | PDF extraction | Order-to-cash stages, credit hold, billing failure risk, CRM and finance systems |

The Word and PDF documents are intentionally paragraph-led because FlowLens MVP extracts DOCX paragraph text and PDF text. This makes expected analysis results clear during manual testing.

The binary fixtures can be regenerated with `tools/generate_demo_docx.cjs` and `tools/generate_demo_pdf.py`; normal manual testing does not require this.

## Reset testing

Use a fresh project when testing a revised document set. Analysis reports are versioned, so generating another report in the same project is also useful for checking how the UI presents the latest version.
