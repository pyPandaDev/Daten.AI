import io
import base64
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT

class PDFService:
    """Generate PDF reports from analysis results"""
    
    def generate_report(self, result_data: Dict[str, Any]) -> bytes:
        """Generate a PDF report from execution results"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
        
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#0284c7'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#075985'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Title
        story.append(Paragraph("Data Analysis Report", title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Metadata
        metadata_text = f"""
        <b>Generated:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}<br/>
        <b>Task ID:</b> {result_data.get('task_execution_id', 'N/A')}<br/>
        <b>Status:</b> {result_data.get('status', 'N/A')}<br/>
        <b>Execution Time:</b> {result_data.get('execution_time', 0):.2f} seconds
        """
        story.append(Paragraph(metadata_text, styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Executive Summary
        if result_data.get('summary'):
            story.append(Paragraph("Executive Summary", heading_style))
            story.append(Paragraph(result_data['summary'], styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # Plan
        if result_data.get('plan'):
            story.append(Paragraph("Analysis Plan", heading_style))
            for i, step in enumerate(result_data['plan'], 1):
                story.append(Paragraph(f"{i}. {step}", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # Assumptions
        if result_data.get('assumptions'):
            story.append(Paragraph("Assumptions", heading_style))
            for assumption in result_data['assumptions']:
                story.append(Paragraph(f"• {assumption}", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # Artifacts
        if result_data.get('artifacts'):
            story.append(Paragraph("Results", heading_style))
            
            for artifact in result_data['artifacts']:
                artifact_type = artifact.get('type')
                
                if artifact_type == 'table':
                    story.append(self._create_table(artifact))
                    story.append(Spacer(1, 0.2*inch))
                
                elif artifact_type == 'plot':
                    story.append(self._create_plot(artifact))
                    story.append(Spacer(1, 0.2*inch))
                
                elif artifact_type == 'metrics':
                    story.append(self._create_metrics(artifact, styles))
                    story.append(Spacer(1, 0.2*inch))
        
        # Follow-ups
        if result_data.get('followups'):
            story.append(Paragraph("Suggested Next Steps", heading_style))
            for followup in result_data['followups']:
                story.append(Paragraph(f"• {followup}", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # Python Code
        if result_data.get('python_code'):
            story.append(PageBreak())
            story.append(Paragraph("Generated Python Code", heading_style))
            
            code_style = ParagraphStyle(
                'Code',
                parent=styles['Code'],
                fontSize=8,
                leftIndent=20,
                rightIndent=20,
                spaceAfter=6
            )
            
            code_lines = result_data['python_code'].split('\n')
            for line in code_lines[:50]:  # Limit to first 50 lines
                story.append(Paragraph(line.replace('<', '&lt;').replace('>', '&gt;'), code_style))
        
        # Build PDF
        doc.build(story)
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return pdf_bytes
    
    def _create_table(self, artifact: Dict[str, Any]) -> Table:
        """Create a table from artifact data"""
        table_data = artifact.get('data', [])
        
        # Limit rows for PDF
        if len(table_data) > 21:  # Header + 20 rows
            table_data = table_data[:21]
        
        # Limit column width
        formatted_data = []
        for row in table_data:
            formatted_row = [str(cell)[:50] for cell in row]
            formatted_data.append(formatted_row)
        
        table = Table(formatted_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284c7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))
        
        return table
    
    def _create_plot(self, artifact: Dict[str, Any]) -> Image:
        """Create an image from base64 plot data"""
        plot_data = artifact.get('data', '')
        
        try:
            image_bytes = base64.b64decode(plot_data)
            image_buffer = io.BytesIO(image_bytes)
            
            img = Image(image_buffer, width=5*inch, height=3.5*inch)
            return img
        except Exception as e:
            print(f"Error creating plot image: {e}")
            from reportlab.platypus import Paragraph
            from reportlab.lib.styles import getSampleStyleSheet
            styles = getSampleStyleSheet()
            return Paragraph(f"[Plot: {artifact.get('name', 'Unknown')}]", styles['Normal'])
    
    def _create_metrics(self, artifact: Dict[str, Any], styles) -> Table:
        """Create a metrics table"""
        items = artifact.get('items', [])
        
        data = [['Metric', 'Value']]
        for item in items:
            name = item.get('name', '')
            value = item.get('value', '')
            
            # Format value
            if isinstance(value, float):
                value = f"{value:.4f}"
            
            data.append([name, str(value)])
        
        table = Table(data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284c7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        
        return table

# Global service instance
pdf_service = PDFService()
