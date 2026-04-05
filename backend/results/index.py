"""
Результаты прохождения тетради учениками.
POST /save               — сохранить результат прохождения (ученик)
GET  /?notebook_id=...   — все результаты по тетради (учитель)
POST /update             — учитель редактирует оценку / комментарий
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
    if not token:
        return None
    cur.execute(
        "SELECT u.id, u.role, u.name FROM users u JOIN user_sessions s ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > now()",
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

    # ── POST /results/save ───────────────────────────────────────────────────
    if method == "POST" and path.endswith("/save"):
        body = json.loads(event.get("body") or "{}")
        notebook_id   = body.get("notebook_id") or ""
        student_name  = (body.get("student_name") or "").strip()
        student_class = (body.get("student_class") or "").strip()
        answers       = body.get("answers") or {}
        checked       = body.get("checked") or {}
        earned_points = int(body.get("earned_points") or 0)
        total_points  = int(body.get("total_points") or 0)
        grade         = body.get("grade")

        if not notebook_id or not student_name:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нет notebook_id или имени ученика"})}

        # Определяем номер попытки
        cur.execute(
            "SELECT COALESCE(MAX(attempt), 0) FROM notebook_results WHERE notebook_id = %s AND student_name = %s",
            (notebook_id, student_name)
        )
        max_attempt = cur.fetchone()[0]
        attempt = max_attempt + 1

        # student_id из токена (если залогинен)
        student_id = None
        user = get_user(cur, token)
        if user:
            student_id = str(user[0])

        cur.execute(
            """INSERT INTO notebook_results
               (notebook_id, student_id, student_name, student_class, answers, checked,
                earned_points, total_points, grade, attempt)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
               RETURNING id""",
            (notebook_id, student_id, student_name, student_class,
             json.dumps(answers), json.dumps(checked),
             earned_points, total_points, grade, attempt)
        )
        result_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "id": str(result_id), "attempt": attempt})}

    # ── GET /?notebook_id=... — результаты для учителя ──────────────────────
    if method == "GET":
        user = get_user(cur, token)
        if not user:
            conn.close()
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
        user_id, role, _ = user
        if role != "teacher":
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Только для учителей"})}

        params = event.get("queryStringParameters") or {}
        notebook_id = params.get("notebook_id") or ""
        if not notebook_id:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите notebook_id"})}

        # Проверяем, что эта тетрадь принадлежит учителю
        cur.execute("SELECT id FROM notebooks WHERE id = %s AND teacher_id = %s", (notebook_id, str(user_id)))
        if not cur.fetchone():
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа к этой тетради"})}

        cur.execute(
            """SELECT id, student_name, student_class, earned_points, total_points,
                      grade, attempt, teacher_comment, teacher_grade, started_at, finished_at
               FROM notebook_results
               WHERE notebook_id = %s
               ORDER BY finished_at DESC""",
            (notebook_id,)
        )
        rows = cur.fetchall()
        conn.close()
        results = [{
            "id": str(r[0]), "student_name": r[1], "student_class": r[2],
            "earned_points": r[3], "total_points": r[4], "grade": r[5],
            "attempt": r[6], "teacher_comment": r[7], "teacher_grade": r[8],
            "started_at": r[9].isoformat() if r[9] else None,
            "finished_at": r[10].isoformat() if r[10] else None,
        } for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"results": results})}

    # ── POST /results/update — учитель ставит оценку/комментарий ────────────
    if method == "POST" and path.endswith("/update"):
        user = get_user(cur, token)
        if not user or user[1] != "teacher":
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Только для учителей"})}

        body = json.loads(event.get("body") or "{}")
        result_id      = body.get("result_id") or ""
        teacher_grade   = body.get("teacher_grade")
        teacher_comment = body.get("teacher_comment") or ""

        if not result_id:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нет result_id"})}

        cur.execute(
            "UPDATE notebook_results SET teacher_grade = %s, teacher_comment = %s WHERE id = %s",
            (teacher_grade, teacher_comment, result_id)
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
