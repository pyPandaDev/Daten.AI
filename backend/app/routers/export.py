from fastapi import APIRouter, HTTPException
import base64
import io

from app.models.schemas import ExportRequest, ExportResponse, DownloadItem
from app.services.storage import storage
from app.services.pdf_service import pdf_service

router = APIRouter()

@router.post("/export/pdf", response_model=ExportResponse)
async def export_pdf(request: ExportRequest):
    """Export analysis results as PDF"""
    
    try:
        # Get result data
        result_data = storage.get_result(request.task_execution_id)
        
        if not result_data:
            raise HTTPException(status_code=404, detail="Result not found")
        
        # Generate PDF
        pdf_bytes = pdf_service.generate_report(result_data)
        
        # Encode to base64
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        
        return ExportResponse(
            download=DownloadItem(
                type="pdf",
                name=f"analysis_report_{request.task_execution_id[:8]}.pdf",
                data=pdf_base64
            )
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

@router.post("/export/csv", response_model=ExportResponse)
async def export_csv(request: ExportRequest):
    """Export cleaned/filtered data as CSV"""
    
    try:
        # Get result data
        result_data = storage.get_result(request.task_execution_id)
        
        if not result_data:
            raise HTTPException(status_code=404, detail="Result not found")
        
        # For now, return a simple CSV with summary info
        # In a real app, you'd need to pass the actual cleaned dataframe
        csv_content = "Analysis Summary\n"
        csv_content += f"Task ID: {request.task_execution_id}\n"
        csv_content += f"Status: {result_data.get('status')}\n"
        csv_content += f"Execution Time: {result_data.get('execution_time')}\n"
        
        # Encode to base64
        csv_base64 = base64.b64encode(csv_content.encode('utf-8')).decode('utf-8')
        
        return ExportResponse(
            download=DownloadItem(
                type="csv",
                name=f"analysis_data_{request.task_execution_id[:8]}.csv",
                data=csv_base64
            )
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating CSV: {str(e)}")
