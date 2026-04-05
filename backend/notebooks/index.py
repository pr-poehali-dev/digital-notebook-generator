"""
Управление тетрадями учителя.
GET    /         — список тетрадей учителя
POST   /save     — сохранить / обновить тетрадь
GET    /{id}     — получить тетрадь по ID (для ученика без авторизации)
"""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_user(cur, token: str):
    cur.execute(
        "SELECT u.id, u.role FROM users u JOIN user_sessions s ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > now()",
        (token,)
    )
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")
    token = (event.get("headers") or {}).get("X-Auth-Token") or ""

    conn = get_db()
    cur = conn.cursor()

    # ── GET /notebooks/{id} — публичный доступ для ученика ──────────────────
    parts = [p for p in path.split("/") if p]
    if method == "GET" and len(parts) >= 1 and not parts[-1] == "save":
        nb_id = parts[-1]
        if nb_id and nb_id != "":
            cur.execute("SELECT data FROM notebooks WHERE id = %s", (nb_id,))
            row = cur.fetchone()
            conn.close()
            if not row:
                return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Тетрадь не найдена"})}
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"notebook": row[0]})}

    # ── POST /notebooks/save ─────────────────────────────────────────────────
    if method == "POST" and path.endswith("/save"):
        user = get_user(cur, token)
        if not user:
            conn.close()
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
        user_id, role = user
        if role != "teacher":
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Только для учителей"})}

        body = json.loads(event.get("body") or "{}")
        notebook = body.get("notebook")
        if not notebook:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нет данных тетради"})}

        nb_id = notebook.get("id")
        cur.execute("SELECT id, teacher_id FROM notebooks WHERE id = %s", (nb_id,))
        existing = cur.fetchone()
        if existing:
            if str(existing[1]) != str(user_id):
                conn.close()
                return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет прав на эту тетрадь"})}
            cur.execute("UPDATE notebooks SET data = %s, updated_at = now() WHERE id = %s", (json.dumps(notebook), nb_id))
        else:
            cur.execute(
                "INSERT INTO notebooks (id, teacher_id, data) VALUES (%s, %s, %s)",
                (nb_id, str(user_id), json.dumps(notebook))
            )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "id": nb_id})}

    # ── GET / — список тетрадей учителя ─────────────────────────────────────
    if method == "GET":
        user = get_user(cur, token)
        if not user:
            conn.close()
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
        user_id, role = user
        if role != "teacher":
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Только для учителей"})}

        cur.execute("SELECT id, data, created_at, updated_at FROM notebooks WHERE teacher_id = %s ORDER BY updated_at DESC", (str(user_id),))
        rows = cur.fetchall()
        conn.close()
        notebooks = [{"id": r[0], "notebook": r[1], "created_at": r[2].isoformat(), "updated_at": r[3].isoformat()} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"notebooks": notebooks})}

    conn.close()
    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
