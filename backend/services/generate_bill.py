import os
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Image, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
import barcode
from barcode.writer import ImageWriter

def generate_bill_buffer(
        barber_name, booking_datetime,
        service_name, price, payment_status,
        customer_name, booking_id):
    
    # Create an in-memory buffer
    buffer = BytesIO()
    
    custom_width = 4.5 * inch
    custom_height = 6.5 * inch
    
    # Pass the buffer instead of a filename
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=(custom_width, custom_height),
        rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20
    )
    
    styles = getSampleStyleSheet()
    elements = []

    # --- Section 1: Logo ---
    try:
        logo_path = "static/images/logo.png"
        logo = Image(logo_path, width=0.8*inch, height=0.8*inch)
        elements.append(logo)
    except:
        elements.append(Paragraph("<b>SILVER BLADE</b>", styles['Title']))

    brand_style = ParagraphStyle('BrandStyle', parent=styles['Title'], alignment=TA_CENTER, fontSize=18)
    elements.append(Paragraph("SILVER BLADE", brand_style))
    elements.append(Spacer(1, 0.2 * inch))

    # --- Section 2 & 3: Info ---
    def format_cell(label, value):
        return Paragraph(f"<b>{label.upper()}</b><br/>{value}", styles['Normal'])

    table_data = [
        [format_cell("Barber", barber_name), format_cell("Date", booking_datetime)],
        [format_cell("Service", service_name), format_cell("Price", f"${price}")],
        [format_cell("Status", payment_status), format_cell("Customer", customer_name)]
    ]

    table = Table(table_data, colWidths=[2 * inch, 2 * inch])
    table.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.white), 
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 0.3 * inch))

    # --- Section 4: Barcode ---
    booking_id_str = str(booking_id)
    code128 = barcode.get('code128', booking_id_str, writer=ImageWriter())
    barcode_buffer = BytesIO()
    code128.write(barcode_buffer)
    barcode_buffer.seek(0)

    barcode_img = Image(barcode_buffer, width=3.2 * inch, height=0.8 * inch)
    barcode_img.hAlign = 'CENTER'
    elements.append(barcode_img)
    
    id_style = ParagraphStyle('IDStyle', parent=styles['Normal'], alignment=TA_CENTER, fontSize=10)
    elements.append(Paragraph(f"ID: {booking_id_str}", id_style))

    # Build PDF and seek to start
    doc.build(elements)
    buffer.seek(0) 
    return buffer