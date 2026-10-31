"""HTTP errors. Plain FastAPI HTTPException subclasses, so every error is {"detail": ...}."""
from fastapi import HTTPException


class Unauthorized(HTTPException):
    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(401, detail, headers={"WWW-Authenticate": "Bearer"})


class Forbidden(HTTPException):
    def __init__(self, detail: str = "You do not have permission to perform this action"):
        super().__init__(403, detail)


class NotFound(HTTPException):
    def __init__(self, detail: str = "Not found"):
        super().__init__(404, detail)


class Conflict(HTTPException):
    def __init__(self, detail: str):
        super().__init__(409, detail)


class BadRequest(HTTPException):
    def __init__(self, detail: str):
        super().__init__(400, detail)


class Unprocessable(HTTPException):
    def __init__(self, detail: str):
        super().__init__(422, detail)
