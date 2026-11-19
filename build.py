#!/usr/bin/env python3
"""Собирает index.html (идеи вшиты в один файл) + ideas.csv + IDEAS.md из ideas/*.json."""
import csv
import glob
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "ideas"
LVL = {"S": "до вечера", "M": "2–5 дней", "L": "1–3 недели"}


def main() -> None:
    files = sorted(SRC.glob("[0-9][0-9]-*.json"))
    cats = [json.loads(f.read_text(encoding="utf-8")) for f in files]

    total = sum(len(c["ideas"]) for c in cats)
    assert total == 500, f"ожидалось 500 идей, найдено {total}"
    titles = {i[0].lower() for c in cats for i in c["ideas"]}
    assert len(titles) == total, "есть повторяющиеся названия"

    # 1) одностраничный каталог
    data = json.dumps(cats, ensure_ascii=False, separators=(",", ":"))
    template = (SRC / "_template.html").read_text(encoding="utf-8")
    (ROOT / "index.html").write_text(template.replace("__DATA__", data), encoding="utf-8")

    # 2) csv
    with (ROOT / "ideas.csv").open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["#", "направление", "идея", "описание", "сложность", "оценка"])
        n = 0
        for c in cats:
            for title, desc, lvl in c["ideas"]:
                n += 1
                w.writerow([n, c["title"], title, desc, lvl, LVL[lvl]])

    # 3) markdown
    out = [
        "# 500 идей, которые можно реализовать",
        "",
        "Интерактивная версия — `index.html` (фильтры, поиск, избранное, рулетка).",
        "",
        f"Всего: **{total}** идей · **{len(cats)}** направлений · "
        f"S (до вечера) — {sum(1 for c in cats for i in c['ideas'] if i[2] == 'S')}, "
        f"M (2–5 дней) — {sum(1 for c in cats for i in c['ideas'] if i[2] == 'M')}, "
        f"L (1–3 недели) — {sum(1 for c in cats for i in c['ideas'] if i[2] == 'L')}.",
        "",
    ]
    n = 0
    for c in cats:
        out += [f"## {c['icon']} {c['title']}", ""]
        for title, desc, lvl in c["ideas"]:
            n += 1
            out.append(f"{n}. **{title}** `{lvl}` — {desc}")
        out.append("")
    (ROOT / "IDEAS.md").write_text("\n".join(out), encoding="utf-8")

    print(f"OK: {total} идей, {len(cats)} направлений")


if __name__ == "__main__":
    main()
