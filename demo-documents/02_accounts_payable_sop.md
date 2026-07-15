# Accounts payable invoice intake and approval SOP

**Organisation:** Northstar Retail (fictional)  
**Owner:** Finance Operations Manager  
**Effective date:** 2026-07-01  
**Systems:** Microsoft 365 shared mailbox, Coupa, NetSuite, SharePoint, Teams

## Purpose

Process supplier invoices accurately, secure the required approval, and pay valid invoices by their agreed due date.

## Roles

- Accounts Payable Analyst: receives, validates, records, and queues invoices.
- Budget Owner: confirms goods or services were received and approves the invoice.
- Procurement Specialist: resolves purchase-order, supplier, or three-way-match exceptions.
- Finance Controller: approves invoices over 25,000 EUR or urgent manual payments.
- Treasury Analyst: releases the approved payment batch.

## Procedure

1. The Accounts Payable Analyst monitors `ap@northstar.example` and the supplier portal at 09:00, 13:00, and 16:00 each business day.
2. The analyst saves each invoice PDF to the SharePoint intake folder and creates an invoice record in Coupa.
3. The analyst checks supplier name, invoice number, currency, bank details, tax amount, purchase-order number, and duplicate invoice number.
4. Coupa attempts a three-way match against the purchase order and goods-receipt record. A successful match is routed to the Budget Owner.
5. The Budget Owner must approve or reject the invoice within 48 hours. Coupa sends a reminder after 24 hours.
6. An invoice over 25,000 EUR, an urgent payment, or a change to bank details also requires Finance Controller approval.
7. After all approvals, the analyst posts the invoice to NetSuite and adds it to the next Tuesday or Thursday payment batch.
8. The Treasury Analyst reviews the batch, releases payment in the banking portal, and marks the payment reference in NetSuite.
9. The analyst records any exception in the invoice exception log and closes the Coupa task when resolved.

## Exception handling

- Missing purchase order: assign to Procurement Specialist within four business hours.
- Duplicate invoice: place on hold, notify the supplier, and retain the evidence in SharePoint.
- Missing goods receipt: ask the Budget Owner to confirm receipt or dispute the invoice.
- Incorrect bank details: do not amend supplier master data from an invoice; send the approved supplier-change workflow to Procurement.

## Known operational constraints

- Analysts manually key invoice header data from PDFs into Coupa.
- Coupa and NetSuite supplier records are not synchronised in real time.
- Some Budget Owners approve from email without opening the Coupa task, which leaves the workflow pending.
- The exception log is a CSV file in a Teams channel and has no automatic escalation.

## Controls and evidence

- Retain the source invoice, approval history, match status, and payment reference for seven years.
- Finance Operations reviews overdue approvals and exception ageing every Monday.
- Finance Controller reviews a monthly sample of urgent payments and supplier bank-detail changes.
