"""Build the approved one-page CJ Cinco worksheet. Requires reportlab."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/downloads/cj-cinco-health-snapshot.pdf"
FONTS = Path("/System/Library/Fonts/Supplemental")
for name, filename in [("Display", "Georgia.ttf"), ("DisplayBold", "Georgia Bold.ttf"),
                       ("Body", "Arial.ttf"), ("BodyBold", "Arial Bold.ttf"),
                       ("BodyItalic", "Arial Italic.ttf")]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / filename)))

INK = HexColor("#222A2B")
MUTED = HexColor("#5D6461")
GOLD = HexColor("#A8894E")
RULE = HexColor("#C9CCC5")
CREAM = HexColor("#F6F2E9")
LEFT, RIGHT, HEIGHT = 36, 576, 792
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
c = canvas.Canvas(str(OUTPUT), pagesize=(612, HEIGHT), pageCompression=1)
c.setTitle("Your Health Snapshot | CJ Cinco")
c.setAuthor("CJ Cinco")
c.setSubject("A personal reflection on mind, body, soul and everyday alignment")

def text(value, x, y, size=10.5, font="Body", color=INK):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, HEIGHT-y, value)

def line(x1, y, x2=RIGHT, color=RULE, width=.5):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1, HEIGHT-y, x2, HEIGHT-y)

def heading(value, y):
    text(value, LEFT, y, 16, "DisplayBold")
    line(LEFT, y+9, LEFT+38, GOLD, 1.3)

def answer(value, y, font="Body"):
    text(value, LEFT, y, 10.5, font)
    start = LEFT + pdfmetrics.stringWidth(value, font, 10.5) + 9
    line(start, y+3)

# A restrained, ink-friendly treatment of the site's cream, charcoal and gold.
c.setFillColor(CREAM)
c.rect(0, HEIGHT-105, 612, 105, fill=1, stroke=0)
text("CJ CINCO", LEFT, 27, 9, "BodyBold", GOLD)
text("Your Health Snapshot", LEFT, 62, 29, "Display")
text("Honor where you are. Connect with possibility. Live in alignment.", LEFT, 85, 10, color=MUTED)
line(LEFT, 105, color=GOLD, width=.65)

heading("My present experience", 131)
for y, label, prompt in [
    (153, "Mind:", "What is present for me mentally and emotionally?"),
    (185, "Body:", "What sensations, energy, and needs am I noticing?"),
    (217, "Soul:", "Where do I feel connection, meaning, and a sense of the sacred?"),
]:
    text(label, LEFT, y, 10.5, "BodyBold")
    text(prompt, LEFT+pdfmetrics.stringWidth(label, "BodyBold", 10.5)+5, y)
    line(LEFT, y+15)

heading("What I’m taking in", 263)
text("Notice what you welcome into your everyday life.", LEFT, 284, 10, color=MUTED)

top, row_h, header_h = 298, 26, 25
cols = [LEFT, 213, 394, RIGHT]
c.setFillColor(CREAM)
c.rect(LEFT, HEIGHT-top-header_h, RIGHT-LEFT, header_h, fill=1, stroke=0)
for i, label in enumerate(["Area", "What nourishes me?", "What am I ready to shift?"]):
    text(label, cols[i]+10, top+16, 9.5, "BodyBold")
rows = ["Food and drink", "People and relationships", "Screens, reading, and media",
        "Music, listening, etc.", "Surroundings and daily demands"]
for i, label in enumerate(rows):
    assert pdfmetrics.stringWidth(label, "Body", 10) < cols[1]-cols[0]-20
    text(label, LEFT+10, top+header_h+i*row_h+17, 10)
for y in [top, top+header_h] + [top+header_h+(i+1)*row_h for i in range(5)]:
    line(LEFT, y)
for x in cols:
    c.setStrokeColor(RULE)
    c.line(x, HEIGHT-top, x, HEIGHT-(top+header_h+5*row_h))

heading("The possibility I’m aligning with", 482)
instruction = "Take a moment to connect with this version of yourself. Write in the present tense."
text(instruction, LEFT, 503, 9.6, "BodyItalic", MUTED)
for i, value in enumerate(["In my mind, I am…", "In my body, I feel…", "In my soul, I am connected to…",
                           "In my everyday life, I express this through…"]):
    answer(value, 527+i*22)

heading("How I embody this", 626)
for i, value in enumerate(["What I continue to nurture:", "What I’m ready to release or soften:",
                           "What I’m making room for:", "One small action I’m choosing this week:",
                           "My next moment to pause and reflect:"]):
    answer(value, 650+i*21)

line(LEFT, 755, color=GOLD, width=.65)
footer = "CJ Cinco · cjcinco.com"
fw = pdfmetrics.stringWidth(footer, "Body", 9)
text(footer, (612-fw)/2, 774, 9, color=MUTED)
c.linkURL("https://cjcinco.com/", ((612-fw)/2, 14, (612+fw)/2, 27), relative=0, thickness=0)
c.showPage()
c.save()
print(OUTPUT)
