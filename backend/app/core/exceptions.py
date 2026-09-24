from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("aml.exceptions")


class AMLBaseException(Exception):
    """Base exception for all domain errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class PluginNotFoundError(AMLBaseException):
    def __init__(self, plugin_name: str):
        super().__init__(
            message=f"ML Model Plugin '{plugin_name}' not found in registry.",
            status_code=status.HTTP_404_NOT_FOUND
        )


class PluginExecutionError(AMLBaseException):
    def __init__(self, plugin_name: str, details: str):
        super().__init__(
            message=f"Execution error in plugin '{plugin_name}': {details}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class TransactionNotFoundError(AMLBaseException):
    def __init__(self, tx_id: str):
        super().__init__(
            message=f"Transaction with ID '{tx_id}' not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )


class AlertNotFoundError(AMLBaseException):
    def __init__(self, alert_id: int):
        super().__init__(
            message=f"Alert case with ID '{alert_id}' not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )


async def aml_exception_handler(request: Request, exc: AMLBaseException):
    logger.warning(f"Domain exception on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.__class__.__name__, "message": exc.message}
    )
