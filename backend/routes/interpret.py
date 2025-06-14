# backend/routes/interpret.py
from flask import Blueprint, request, jsonify, current_app
from openai import OpenAI, RateLimitError, OpenAIError
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
interpret_bp = Blueprint('interpret', __name__, url_prefix='/api')

MAX_PROMPT_LENGTH = 2000  # characters

def build_prompt(categories: dict, audits: dict) -> str:
    # 1) pick top 3 categories by descending score
    top_cats = sorted(
        categories.items(),
        key=lambda item: item[1].get('score', 0),
        reverse=True
    )[:3]

    cat_parts = ", ".join(
        f"{name}: {round(info.get('score', 0) * 100)}%"
        for name, info in top_cats
    )

    # 2) build the 4 key metrics only if present
    metric_keys = [
        'first-contentful-paint',
        'largest-contentful-paint',
        'total-blocking-time',
        'cumulative-layout-shift'
    ]
    metric_lines = []
    for key in metric_keys:
        if key in audits:
            title = audits[key]['title']
            val = audits[key].get('displayValue', audits[key].get('numericValue'))
            metric_lines.append(f"- {title}: {val}")

    prompt = (
        "Provide a short, human-friendly summary of these Lighthouse audit results:\n\n"
        f"Category scores (top 3): {cat_parts}\n\n"
        "Key metrics:\n"
        + "\n".join(metric_lines)
    )
    return prompt

def trim_prompt(prompt: str, max_chars: int = MAX_PROMPT_LENGTH) -> str:
    if len(prompt) <= max_chars:
        return prompt
    return prompt[:max_chars].rsplit('\n', 1)[0] + "\n\n[...truncated for brevity...]"

def local_summary(categories: dict, audits: dict) -> str:
    lines = ["AI quota exceeded — here’s a raw summary instead:\n"]
    lines.append("Category scores (top 3):")
    top_cats = sorted(
        categories.items(),
        key=lambda item: item[1].get('score', 0),
        reverse=True
    )[:3]
    for name, info in top_cats:
        lines.append(f"• {name}: {round(info['score'] * 100)}%")

    lines.append("\nKey metrics:")
    for key in [
        'first-contentful-paint',
        'largest-contentful-paint',
        'total-blocking-time',
        'cumulative-layout-shift'
    ]:
        if key in audits:
            title = audits[key]['title']
            val = audits[key].get('displayValue', audits[key].get('numericValue'))
            lines.append(f"• {title}: {val}")

    return "\n".join(lines)

@interpret_bp.route('/interpret', methods=['POST'])
def interpret():
    data = request.get_json() or {}
    categories = data.get('categories', {})
    audits = data.get('audits', {})

    # build, then trim
    raw_prompt = build_prompt(categories, audits)
    prompt = trim_prompt(raw_prompt)

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7
        )
        summary = resp.choices[0].message.content.strip()
        return jsonify({"summary": summary})

    except RateLimitError as e:
        current_app.logger.error(f"OpenAI quota error: {e}")
        return jsonify({"summary": local_summary(categories, audits)}), 200

    except OpenAIError as e:
        current_app.logger.error(f"OpenAI API error: {e}")
        return jsonify({
            "summary": local_summary(categories, audits),
            "warning": "AI service unavailable; showing raw metrics."
        }), 200
