"""Shared status history writer for subscription/invoice services."""
from sqlalchemy.orm import Session
from app.models import StatusHistory


def record_status_change(
    db: Session, *, entity_type: str, entity_id: int | str,
    old_status: str | None, new_status: str, changed_by_user_id: int | None = None,
    reason: str | None = None, commit: bool = True,
) -> StatusHistory:
    row = StatusHistory(entity_type=entity_type, entity_id=str(entity_id), old_status=old_status,
                        new_status=new_status, changed_by_user_id=changed_by_user_id, reason=reason)
    db.add(row)
    if commit:
        db.commit()
        db.refresh(row)
    else:
        db.flush()
    return row
