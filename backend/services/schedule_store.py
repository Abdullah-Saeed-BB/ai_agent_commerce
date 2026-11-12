import uuid
from typing import Dict, List

# In-memory store of generated schedule images. This replaces the old Telegram
# "send photo" flow: the web chat attaches the image to the API response and
# the browser fetches it from /chat/schedule/{image_id}.
#
# The raw bytes are kept in _IMAGES so the follow-up GET can serve them; only
# the per-session *pending list* is cleared when the response is built. A FIFO
# cap bounds memory usage (oldest images are evicted).
#
# Note: images live only for the lifetime of the backend process. That's fine
# for the simulator — a page refresh simply loses the rendered image.

_IMAGES: Dict[str, bytes] = {}                # image_id -> png bytes
_SESSION_PENDING: Dict[str, List[str]] = {}   # chat_id -> [image_id, ...]
MAX_IMAGES = 100


def save_schedule_image(chat_id: str, buffer) -> str:
    """Store a schedule image for a chat session and return its id."""
    data = buffer.getvalue() if hasattr(buffer, "getvalue") else bytes(buffer)
    image_id = uuid.uuid4().hex
    _IMAGES[image_id] = data
    _SESSION_PENDING.setdefault(str(chat_id), []).append(image_id)

    # Evict oldest images beyond the cap
    while len(_IMAGES) > MAX_IMAGES:
        oldest = next(iter(_IMAGES))
        _IMAGES.pop(oldest, None)
        for pending in _SESSION_PENDING.values():
            if oldest in pending:
                pending.remove(oldest)

    return image_id


def take_session_images(chat_id: str) -> List[str]:
    """Return and clear the pending image ids generated for a chat session.

    The image bytes stay in _IMAGES so the browser can still fetch them
    afterwards via get_schedule_image().
    """
    return _SESSION_PENDING.pop(str(chat_id), [])


def get_schedule_image(image_id: str):
    """Look up a stored image by id. Returns the raw PNG bytes or None."""
    return _IMAGES.get(image_id)
