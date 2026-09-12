#!/usr/bin/env python3
"""
Generate 43 High-Resolution Transparent Physical Sticker Assets for SnapBooth.
Collections: Fabric Patch, Botanical, Denim/Y2K, Analog, Scrapbook, Cute.
Saves transparent WebP images (512x512) to public/stickers/<category>/.
"""

import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'stickers')

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def apply_drop_shadow(image, offset=(4, 6), blur_radius=8, shadow_alpha=90):
    """Adds a realistic soft physical drop shadow under an RGBA cutout."""
    w, h = image.size
    shadow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    alpha = image.split()[3]
    
    # Scale alpha to shadow_alpha
    shadow_mask = alpha.point(lambda p: int(p * (shadow_alpha / 255.0)))
    black = Image.new('RGBA', (w, h), (15, 12, 18, 255))
    shadow.paste(black, offset, mask=shadow_mask)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur_radius))
    
    # Composite original image over shadow
    final = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    final.paste(shadow, (0, 0), shadow)
    final.paste(image, (0, 0), image)
    return final

def star_points(cx, cy, r_outer, r_inner, num_points=5, rotation_deg=-18):
    points = []
    angle_step = math.pi / num_points
    start_rad = math.radians(rotation_deg)
    for i in range(num_points * 2):
        r = r_outer if i % 2 == 0 else r_inner
        ang = start_rad + i * angle_step
        points.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return points

# -------------------------------------------------------------
# COLLECTION 01: FABRIC PATCHES
# -------------------------------------------------------------
def make_fabric_star(base_color, stitch_color, name):
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    
    cx, cy = size // 2, size // 2 + 6
    outer_r, inner_r = 195, 88
    pts = star_points(cx, cy, outer_r, inner_r)
    
    # Draw star base
    draw.polygon(pts, fill=base_color)
    
    # Fabric texture overlay (interlaced canvas weave)
    tex = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    tex_draw = ImageDraw.Draw(tex)
    mask = im.split()[3]
    
    for y in range(0, size, 4):
        for x in range(0, size, 4):
            bright = (20 if (x + y) % 8 == 0 else -15) + random.randint(-8, 8)
            col = (255, 255, 255, max(0, min(60, bright + 30))) if bright > 0 else (0, 0, 0, max(0, min(50, -bright + 25)))
            tex_draw.rectangle([x, y, x + 3, y + 3], fill=col)
    
    im = Image.composite(Image.alpha_composite(im, tex), im, mask)
    draw = ImageDraw.Draw(im)
    draw.polygon(pts, outline=(0, 0, 0, 60), width=3)
    
    # Running thread stitches following inner contour
    inner_pts = star_points(cx, cy, outer_r - 26, inner_r - 12)
    for i in range(len(inner_pts)):
        p1 = inner_pts[i]
        p2 = inner_pts[(i + 1) % len(inner_pts)]
        dist = math.hypot(p2[0] - p1[0], p2[1] - p1[1])
        steps = int(dist / 14)
        if steps < 1: steps = 1
        for s in range(steps):
            t1 = s / steps
            t2 = (s + 0.6) / steps
            sx1 = p1[0] + (p2[0] - p1[0]) * t1
            sy1 = p1[1] + (p2[1] - p1[1]) * t1
            sx2 = p1[0] + (p2[0] - p1[0]) * t2
            sy2 = p1[1] + (p2[1] - p1[1]) * t2
            draw.line([(sx1 + 1, sy1 + 1), (sx2 + 1, sy2 + 1)], fill=(0, 0, 0, 70), width=4)
            draw.line([(sx1, sy1), (sx2, sy2)], fill=stitch_color, width=4)
            draw.line([(sx1, sy1), (sx2, sy2)], fill=(255, 255, 255, 120), width=1)
            
    final = apply_drop_shadow(im, offset=(4, 6), blur_radius=7, shadow_alpha=95)
    final.save(os.path.join(BASE_DIR, 'fabric', name), 'WEBP', quality=95)

def make_fabric_heart(base_color, stitch_color, name):
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    
    cx, cy = size // 2, size // 2 + 10
    path = []
    for t in [i * 0.02 for i in range(315)]:
        x = cx + 12 * (16 * math.sin(t)**3)
        y = cy - 12 * (13 * math.cos(t) - 5 * math.cos(2*t) - 2 * math.cos(3*t) - math.cos(4*t))
        path.append((x, y))
    
    draw.polygon(path, fill=base_color)
    
    tex = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    tex_draw = ImageDraw.Draw(tex)
    for y in range(0, size, 4):
        for x in range(0, size, 4):
            bright = (22 if (x + y) % 8 == 0 else -15) + random.randint(-6, 6)
            col = (255, 255, 255, max(0, min(55, bright + 25))) if bright > 0 else (0, 0, 0, max(0, min(45, -bright + 20)))
            tex_draw.rectangle([x, y, x + 3, y + 3], fill=col)
    
    mask = im.split()[3]
    im = Image.composite(Image.alpha_composite(im, tex), im, mask)
    draw = ImageDraw.Draw(im)
    draw.polygon(path, outline=(0, 0, 0, 60), width=3)
    
    inner_path = []
    for t in [i * 0.02 for i in range(315)]:
        x = cx + 10.5 * (16 * math.sin(t)**3)
        y = cy - 10.5 * (13 * math.cos(t) - 5 * math.cos(2*t) - 2 * math.cos(3*t) - math.cos(4*t))
        inner_path.append((x, y))
    
    for i in range(0, len(inner_path) - 4, 6):
        p1 = inner_path[i]
        p2 = inner_path[min(i + 3, len(inner_path) - 1)]
        draw.line([(p1[0] + 1, p1[1] + 1), (p2[0] + 1, p2[1] + 1)], fill=(0, 0, 0, 70), width=4)
        draw.line([p1, p2], fill=stitch_color, width=4)
        draw.line([p1, p2], fill=(255, 255, 255, 120), width=1)
        
    final = apply_drop_shadow(im)
    final.save(os.path.join(BASE_DIR, 'fabric', name), 'WEBP', quality=95)

def make_fabric_misc(patch_type, base_color, stitch_color, name):
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size // 2, size // 2
    
    if patch_type == 'lightning':
        pts = [(cx - 20, cy - 190), (cx + 60, cy - 190), (cx - 10, cy - 20), (cx + 80, cy - 20),
               (cx - 70, cy + 190), (cx - 10, cy + 30), (cx - 80, cy + 30)]
    elif patch_type == 'moon':
        pts = []
        for a in range(-80, 90, 10):
            rad = math.radians(a)
            pts.append((cx + 160 * math.cos(rad) - 40, cy + 170 * math.sin(rad)))
        for a in range(80, -90, -10):
            rad = math.radians(a)
            pts.append((cx + 100 * math.cos(rad) + 20, cy + 140 * math.sin(rad)))
    elif patch_type == 'clover':
        pts = []
        for leaf in range(4):
            lang = leaf * (math.pi / 2)
            lcx = cx + 80 * math.cos(lang)
            lcy = cy + 80 * math.sin(lang)
            for a in range(0, 360, 20):
                rad = math.radians(a)
                pts.append((lcx + 65 * math.cos(rad), lcy + 65 * math.sin(rad)))
    else: # flower
        pts = []
        for p in range(5):
            pang = p * (2 * math.pi / 5)
            pcx = cx + 90 * math.cos(pang)
            pcy = cy + 90 * math.sin(pang)
            for a in range(0, 360, 25):
                rad = math.radians(a)
                pts.append((pcx + 65 * math.cos(rad), pcy + 65 * math.sin(rad)))
                
    draw.polygon(pts, fill=base_color)
    
    tex = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    tex_draw = ImageDraw.Draw(tex)
    for y in range(0, size, 4):
        for x in range(0, size, 4):
            bright = (20 if (x + y) % 8 == 0 else -15) + random.randint(-6, 6)
            col = (255, 255, 255, max(0, min(50, bright + 25))) if bright > 0 else (0, 0, 0, max(0, min(40, -bright + 20)))
            tex_draw.rectangle([x, y, x + 3, y + 3], fill=col)
            
    mask = im.split()[3]
    im = Image.composite(Image.alpha_composite(im, tex), im, mask)
    draw = ImageDraw.Draw(im)
    draw.polygon(pts, outline=(0, 0, 0, 60), width=3)
    
    for i in range(0, len(pts), 3):
        p1 = pts[i]
        p2 = pts[(i + 2) % len(pts)]
        mx1 = p1[0] + (cx - p1[0]) * 0.12
        my1 = p1[1] + (cy - p1[1]) * 0.12
        mx2 = p2[0] + (cx - p2[0]) * 0.12
        my2 = p2[1] + (cy - p2[1]) * 0.12
        draw.line([(mx1 + 1, my1 + 1), (mx2 + 1, my2 + 1)], fill=(0, 0, 0, 70), width=3)
        draw.line([(mx1, my1), (mx2, my2)], fill=stitch_color, width=3)
        
    final = apply_drop_shadow(im)
    final.save(os.path.join(BASE_DIR, 'fabric', name), 'WEBP', quality=95)

# -------------------------------------------------------------
# COLLECTION 02: BOTANICAL
# -------------------------------------------------------------
def make_realistic_lily(petal_base, petal_tip, throat_color, stamen_color, name):
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    cx, cy = size // 2, size // 2 + 10
    
    petal_angles = [30, 90, 150, 210, 270, 330]
    for idx, angle in enumerate(petal_angles):
        petal_im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        p_draw = ImageDraw.Draw(petal_im)
        
        rad = math.radians(angle)
        length = 185 + (15 if idx % 2 == 0 else -10)
        width = 65
        
        tip_x = cx + length * math.cos(rad)
        tip_y = cy + length * math.sin(rad)
        
        nx = -math.sin(rad)
        ny = math.cos(rad)
        
        mid_r = length * 0.55
        mid_x = cx + mid_r * math.cos(rad)
        mid_y = cy + mid_r * math.sin(rad)
        
        ctrl_l = (mid_x + nx * width, mid_y + ny * width)
        ctrl_r = (mid_x - nx * width, mid_y - ny * width)
        
        petal_pts = [(cx, cy)]
        for t in [i * 0.1 for i in range(11)]:
            x = (1-t)**2 * cx + 2*(1-t)*t * ctrl_l[0] + t**2 * tip_x
            y = (1-t)**2 * cy + 2*(1-t)*t * ctrl_l[1] + t**2 * tip_y
            petal_pts.append((x, y))
        for t in [i * 0.1 for i in range(11)]:
            x = (1-t)**2 * tip_x + 2*(1-t)*t * ctrl_r[0] + t**2 * cx
            y = (1-t)**2 * tip_y + 2*(1-t)*t * ctrl_r[1] + t**2 * cy
            petal_pts.append((x, y))
            
        p_draw.polygon(petal_pts, fill=petal_base)
        
        for t in range(10):
            f_col = (
                int(petal_base[0] + (petal_tip[0] - petal_base[0]) * (t / 10)),
                int(petal_base[1] + (petal_tip[1] - petal_base[1]) * (t / 10)),
                int(petal_base[2] + (petal_tip[2] - petal_base[2]) * (t / 10)),
                int(160 + t * 9)
            )
            sub_pts = [(cx + (pt[0] - cx) * (0.3 + t * 0.07), cy + (pt[1] - cy) * (0.3 + t * 0.07)) for pt in petal_pts]
            p_draw.polygon(sub_pts, fill=f_col)
            
        p_draw.line([(cx, cy), (tip_x, tip_y)], fill=(petal_tip[0], petal_tip[1], petal_tip[2], 180), width=3)
        for _ in range(18):
            d_r = random.uniform(25, 80)
            d_w = random.uniform(-18, 18)
            dx = cx + d_r * math.cos(rad) + nx * d_w
            dy = cy + d_r * math.sin(rad) + ny * d_w
            p_draw.ellipse([dx - 1.5, dy - 1.5, dx + 1.5, dy + 1.5], fill=(45, 5, 10, 210))
            
        im = Image.alpha_composite(im, petal_im)
        
    draw = ImageDraw.Draw(im)
    for r in range(40, 5, -5):
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(throat_color[0], throat_color[1], throat_color[2], int(180 * (1 - r / 40))))
        
    for st_ang in [15, 75, 135, 195, 255, 315]:
        st_rad = math.radians(st_ang)
        st_len = 110
        st_x = cx + st_len * math.cos(st_rad)
        st_y = cy + st_len * math.sin(st_rad)
        draw.line([(cx, cy), (st_x, st_y)], fill=(180, 210, 140, 220), width=3)
        ax1 = st_x - 12 * math.sin(st_rad)
        ay1 = st_y + 12 * math.cos(st_rad)
        ax2 = st_x + 12 * math.sin(st_rad)
        ay2 = st_y - 12 * math.cos(st_rad)
        draw.line([(ax1, ay1), (ax2, ay2)], fill=stamen_color, width=6)
        draw.line([(ax1, ay1), (ax2, ay2)], fill=(255, 190, 40, 180), width=2)
        
    draw.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=(80, 140, 50, 255))
    draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(130, 190, 80, 255))
    
    final = apply_drop_shadow(im, offset=(4, 8), blur_radius=9, shadow_alpha=90)
    final.save(os.path.join(BASE_DIR, 'botanical', name), 'WEBP', quality=95)

def make_other_botanicals():
    size = 512
    cx, cy = size // 2, size // 2
    
    # Daisy
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    for a in range(0, 360, 20):
        rad = math.radians(a)
        px = cx + 160 * math.cos(rad)
        py = cy + 160 * math.sin(rad)
        nx = -math.sin(rad) * 22
        ny = math.cos(rad) * 22
        pts = [(cx, cy), (cx + 80 * math.cos(rad) + nx, cy + 80 * math.sin(rad) + ny), (px, py), (cx + 80 * math.cos(rad) - nx, cy + 80 * math.sin(rad) - ny)]
        draw.polygon(pts, fill=(250, 248, 242, 245), outline=(220, 215, 200, 120))
    draw.ellipse([cx - 55, cy - 55, cx + 55, cy + 55], fill=(245, 180, 20, 255))
    for _ in range(120):
        rr = random.uniform(0, 48)
        aa = random.uniform(0, math.pi * 2)
        fx = cx + rr * math.cos(aa)
        fy = cy + rr * math.sin(aa)
        draw.point((fx, fy), fill=(180, 110, 10, 255))
    apply_drop_shadow(im).save(os.path.join(BASE_DIR, 'botanical', 'daisy-flower.webp'), 'WEBP', quality=95)
    
    # Rose
    im_rose = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_rose = ImageDraw.Draw(im_rose)
    for r in range(180, 20, -18):
        c_val = int(140 + (180 - r) * 0.5)
        d_rose.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(c_val, 25, 45, 255), outline=(90, 10, 20, 180), width=3)
    apply_drop_shadow(im_rose).save(os.path.join(BASE_DIR, 'botanical', 'vintage-rose.webp'), 'WEBP', quality=95)
    
    # Tulip
    im_tulip = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_tulip = ImageDraw.Draw(im_tulip)
    d_tulip.ellipse([cx - 110, cy - 140, cx + 110, cy + 120], fill=(225, 40, 55, 255))
    d_tulip.ellipse([cx - 80, cy - 150, cx + 10, cy + 110], fill=(180, 20, 40, 255))
    d_tulip.ellipse([cx - 10, cy - 150, cx + 80, cy + 110], fill=(245, 60, 75, 255))
    d_tulip.rectangle([cx - 8, cy + 110, cx + 8, cy + 220], fill=(70, 130, 45, 255))
    apply_drop_shadow(im_tulip).save(os.path.join(BASE_DIR, 'botanical', 'tulip-flower.webp'), 'WEBP', quality=95)
    
    # Baby's breath
    im_bb = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_bb = ImageDraw.Draw(im_bb)
    for i in range(-3, 4):
        d_bb.line([(cx, cy + 190), (cx + i * 55, cy - 120 + abs(i)*30)], fill=(110, 145, 90, 240), width=3)
        for sub in range(6):
            bx = cx + i * 55 + random.randint(-40, 40)
            by = cy - 120 + abs(i)*30 + random.randint(-50, 50)
            d_bb.ellipse([bx - 12, by - 12, bx + 12, by + 12], fill=(255, 255, 255, 250))
            d_bb.point((bx, by), fill=(210, 220, 160, 255))
    apply_drop_shadow(im_bb).save(os.path.join(BASE_DIR, 'botanical', 'babys-breath.webp'), 'WEBP', quality=95)
    
    # Botanical Leaves
    im_leaf = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_leaf = ImageDraw.Draw(im_leaf)
    d_leaf.line([(cx, cy + 200), (cx, cy - 190)], fill=(80, 120, 70, 255), width=5)
    for ly in range(cy + 150, cy - 180, -45):
        d_leaf.ellipse([cx - 110, ly - 30, cx - 10, ly + 25], fill=(95, 145, 85, 255))
        d_leaf.ellipse([cx + 10, ly - 30, cx + 110, ly + 25], fill=(110, 160, 95, 255))
    apply_drop_shadow(im_leaf).save(os.path.join(BASE_DIR, 'botanical', 'botanical-leaves.webp'), 'WEBP', quality=95)

# -------------------------------------------------------------
# COLLECTION 03: DENIM / Y2K
# -------------------------------------------------------------
def make_chrome_star():
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size // 2, size // 2
    pts = []
    outer = 190
    for a in range(0, 360, 5):
        rad = math.radians(a)
        r = outer * (abs(math.cos(rad * 2))**0.4 * 0.8 + 0.2)
        pts.append((cx + r * math.cos(rad), cy + r * math.sin(rad)))
    draw.polygon(pts, fill=(210, 215, 225, 255))
    
    for t in range(12):
        shade = 170 + int(70 * math.sin(t * 0.6))
        sub_pts = [(cx + (p[0] - cx) * (1 - t * 0.07), cy + (p[1] - cy) * (1 - t * 0.07)) for p in pts]
        draw.polygon(sub_pts, fill=(shade, shade + 5, shade + 15, 140))
        
    draw.ellipse([cx - 40, cy - 60, cx + 10, cy - 20], fill=(255, 255, 255, 240))
    apply_drop_shadow(im, offset=(6, 8), blur_radius=10, shadow_alpha=110).save(os.path.join(BASE_DIR, 'denim-y2k', 'chrome-star-3d.webp'), 'WEBP', quality=95)

def make_chrome_heart():
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size // 2, size // 2 + 10
    path = []
    for t in [i * 0.02 for i in range(315)]:
        x = cx + 12 * (16 * math.sin(t)**3)
        y = cy - 12 * (13 * math.cos(t) - 5 * math.cos(2*t) - 2 * math.cos(3*t) - math.cos(4*t))
        path.append((x, y))
    draw.polygon(path, fill=(200, 205, 215, 255))
    for t in range(10):
        shade = 160 + int(85 * math.cos(t * 0.5))
        sub = [(cx + (p[0] - cx) * (1 - t * 0.07), cy + (p[1] - cy) * (1 - t * 0.07)) for p in path]
        draw.polygon(sub, fill=(shade, shade + 8, shade + 18, 150))
    draw.ellipse([cx - 60, cy - 70, cx - 20, cy - 35], fill=(255, 255, 255, 230))
    apply_drop_shadow(im).save(os.path.join(BASE_DIR, 'denim-y2k', 'chrome-heart-3d.webp'), 'WEBP', quality=95)

def make_chrome_sparkle():
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size // 2, size // 2
    for w in [35, 18, 6]:
        draw.line([(cx, cy - 190), (cx, cy + 190)], fill=(220, 230, 245, 220), width=w)
        draw.line([(cx - 190, cy), (cx + 190, cy)], fill=(220, 230, 245, 220), width=w)
    draw.line([(cx - 90, cy - 90), (cx + 90, cy + 90)], fill=(255, 255, 255, 200), width=10)
    draw.line([(cx - 90, cy + 90), (cx + 90, cy - 90)], fill=(255, 255, 255, 200), width=10)
    draw.ellipse([cx - 30, cy - 30, cx + 30, cy + 30], fill=(255, 255, 255, 255))
    apply_drop_shadow(im).save(os.path.join(BASE_DIR, 'denim-y2k', 'chrome-sparkle.webp'), 'WEBP', quality=95)

def make_safety_pin():
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    p1 = (120, 380)
    p2 = (380, 130)
    draw.rounded_rectangle([340, 100, 420, 170], radius=16, fill=(195, 200, 210, 255), outline=(130, 135, 145, 255), width=4)
    draw.line([(p1[0], p1[1]), (p2[0], p2[1])], fill=(215, 220, 230, 255), width=9)
    draw.line([(p1[0], p1[1] - 45), (p2[0] - 25, p2[1] + 15)], fill=(185, 190, 200, 255), width=9)
    draw.ellipse([p1[0] - 35, p1[1] - 50, p1[0] + 25, p1[1] + 10], outline=(190, 195, 205, 255), width=9)
    apply_drop_shadow(im).save(os.path.join(BASE_DIR, 'denim-y2k', 'safety-pin-metal.webp'), 'WEBP', quality=95)

def make_paper_clip():
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size // 2, size // 2
    pts = [
        (cx - 45, cy + 140), (cx - 45, cy - 140), (cx + 45, cy - 140),
        (cx + 45, cy + 100), (cx - 15, cy + 100), (cx - 15, cy - 90), (cx + 15, cy - 90)
    ]
    for i in range(len(pts) - 1):
        draw.line([pts[i], pts[i+1]], fill=(190, 195, 205, 255), width=10)
    apply_drop_shadow(im).save(os.path.join(BASE_DIR, 'denim-y2k', 'paper-clip.webp'), 'WEBP', quality=95)

def make_eight_ball():
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size // 2, size // 2
    r = 180
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(22, 22, 26, 255))
    wr = 70
    draw.ellipse([cx - wr, cy - wr, cx + wr, cy + wr], fill=(245, 245, 245, 255))
    draw.ellipse([cx - 24, cy - 42, cx + 24, cy - 2], outline=(15, 15, 18, 255), width=10)
    draw.ellipse([cx - 28, cy - 4, cx + 28, cy + 42], outline=(15, 15, 18, 255), width=11)
    draw.arc([cx - r + 20, cy - r + 20, cx + r - 20, cy + r - 20], start=210, end=300, fill=(255, 255, 255, 140), width=16)
    apply_drop_shadow(im).save(os.path.join(BASE_DIR, 'denim-y2k', 'eight-ball.webp'), 'WEBP', quality=95)

# -------------------------------------------------------------
# COLLECTION 04: ANALOG CAMERA & MUSIC
# -------------------------------------------------------------
def make_film_roll():
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size // 2, size // 2
    draw.rounded_rectangle([cx - 70, cy - 130, cx + 70, cy + 130], radius=14, fill=(35, 35, 40, 255))
    draw.rectangle([cx - 70, cy - 60, cx + 70, cy + 60], fill=(235, 180, 25, 255))
    draw.rectangle([cx - 60, cy - 45, cx + 60, cy + 45], fill=(20, 20, 20, 255))
    draw.ellipse([cx - 80, cy - 155, cx + 80, cy - 120], fill=(180, 185, 195, 255))
    draw.ellipse([cx - 80, cy + 120, cx + 80, cy + 155], fill=(180, 185, 195, 255))
    draw.rectangle([cx + 70, cy - 35, cx + 160, cy + 35], fill=(25, 24, 28, 255))
    for sx in range(cx + 85, cx + 155, 18):
        draw.rectangle([sx, cy - 25, sx + 8, cy - 15], fill=(255, 255, 255, 255))
        draw.rectangle([sx, cy + 15, sx + 8, cy + 25], fill=(255, 255, 255, 255))
    apply_drop_shadow(im).save(os.path.join(BASE_DIR, 'analog', 'film-roll-35mm.webp'), 'WEBP', quality=95)

def make_retro_camera():
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size // 2, size // 2
    draw.rounded_rectangle([cx - 150, cy - 110, cx + 150, cy + 110], radius=24, fill=(245, 243, 238, 255), outline=(210, 205, 195, 255), width=4)
    colors = [(225, 45, 45), (240, 140, 30), (245, 210, 40), (65, 175, 75), (45, 125, 215)]
    sw = 12
    for i, col in enumerate(colors):
        draw.rectangle([cx - 30 + i * sw, cy + 40, cx - 30 + (i+1) * sw, cy + 110], fill=col)
    draw.ellipse([cx - 65, cy - 65, cx + 65, cy + 65], fill=(30, 30, 35, 255))
    draw.ellipse([cx - 45, cy - 45, cx + 45, cy + 45], fill=(15, 30, 45, 255))
    draw.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], fill=(25, 70, 95, 255))
    draw.ellipse([cx - 120, cy - 70, cx - 80, cy - 30], fill=(225, 45, 45, 255))
    draw.rounded_rectangle([cx + 75, cy - 80, cx + 125, cy - 40], radius=6, fill=(35, 75, 100, 255), outline=(150, 150, 150, 255), width=2)
    apply_drop_shadow(im).save(os.path.join(BASE_DIR, 'analog', 'retro-instant-camera.webp'), 'WEBP', quality=95)

def make_cd_star_disc():
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size // 2, size // 2
    r = 185
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(240, 245, 255, 120), outline=(255, 255, 255, 200), width=3)
    for gr in range(90, 180, 6):
        draw.ellipse([cx - gr, cy - gr, cx + gr, cy + gr], outline=(255, 255, 255, 30), width=1)
    draw.ellipse([cx - 45, cy - 45, cx + 45, cy + 45], fill=(0, 0, 0, 0), outline=(255, 255, 255, 220), width=4)
    for _ in range(8):
        s_rad = random.uniform(0, math.pi * 2)
        s_dist = random.uniform(80, 160)
        sx = cx + s_dist * math.cos(s_rad)
        sy = cy + s_dist * math.sin(s_rad)
        pts = star_points(sx, sy, 16, 7, rotation_deg=random.randint(0, 360))
        draw.polygon(pts, fill=(255, 235, 150, 220))
    apply_drop_shadow(im).save(os.path.join(BASE_DIR, 'analog', 'cd-star-disc.webp'), 'WEBP', quality=95)

def make_music_player_bar():
    size = 512
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = size // 2, size // 2
    w, h = 380, 110
    draw.rounded_rectangle([cx - w//2, cy - h//2, cx + w//2, cy + h//2], radius=18, fill=(18, 18, 22, 255), outline=(60, 60, 70, 255), width=2)
    draw.rounded_rectangle([cx - w//2 + 15, cy - 35, cx - w//2 + 85, cy + 35], radius=8, fill=(180, 45, 65, 255))
    px = cx + 20
    draw.polygon([(px - 35, cy), (px - 20, cy - 14), (px - 20, cy + 14)], fill=(255, 255, 255, 230))
    draw.polygon([(px - 20, cy), (px - 5, cy - 14), (px - 5, cy + 14)], fill=(255, 255, 255, 230))
    draw.polygon([(px + 15, cy - 16), (px + 45, cy), (px + 15, cy + 16)], fill=(255, 255, 255, 255))
    draw.polygon([(px + 65, cy - 14), (px + 80, cy), (px + 65, cy + 14)], fill=(255, 255, 255, 230))
    draw.polygon([(px + 80, cy - 14), (px + 95, cy), (px + 80, cy + 14)], fill=(255, 255, 255, 230))
    draw.line([(cx - 10, cy + 35), (cx + w//2 - 25, cy + 35)], fill=(120, 120, 130, 255), width=3)
    draw.line([(cx - 10, cy + 35), (cx + 50, cy + 35)], fill=(255, 255, 255, 255), width=3)
    apply_drop_shadow(im).save(os.path.join(BASE_DIR, 'analog', 'music-player-bar.webp'), 'WEBP', quality=95)

def make_other_analogs():
    size = 512
    cx, cy = size // 2, size // 2
    
    im_v = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_v = ImageDraw.Draw(im_v)
    r = 185
    d_v.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(20, 20, 24, 255))
    for gr in range(95, 180, 5):
        d_v.ellipse([cx - gr, cy - gr, cx + gr, cy + gr], outline=(40, 40, 46, 255), width=1)
    d_v.ellipse([cx - 65, cy - 65, cx + 65, cy + 65], fill=(215, 45, 45, 255))
    d_v.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], fill=(245, 245, 245, 255))
    apply_drop_shadow(im_v).save(os.path.join(BASE_DIR, 'analog', 'vinyl-record-ep.webp'), 'WEBP', quality=95)
    
    im_c = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_c = ImageDraw.Draw(im_c)
    w, h = 340, 210
    d_c.rounded_rectangle([cx - w//2, cy - h//2, cx + w//2, cy + h//2], radius=16, fill=(40, 40, 45, 255), outline=(90, 90, 100, 255), width=3)
    d_c.rounded_rectangle([cx - 120, cy - 60, cx + 120, cy + 60], radius=10, fill=(240, 238, 230, 255))
    d_c.ellipse([cx - 75, cy - 25, cx - 25, cy + 25], outline=(30, 30, 35, 255), width=6)
    d_c.ellipse([cx + 25, cy - 25, cx + 75, cy + 25], outline=(30, 30, 35, 255), width=6)
    apply_drop_shadow(im_c).save(os.path.join(BASE_DIR, 'analog', 'audio-cassette.webp'), 'WEBP', quality=95)
    
    im_p = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_p = ImageDraw.Draw(im_p)
    d_p.ellipse([cx - 150, cy - 130, cx - 50, cy - 30], fill=(25, 25, 30, 255))
    d_p.ellipse([cx + 50, cy + 30, cx + 150, cy + 130], fill=(25, 25, 30, 255))
    d_p.line([(cx - 100, cy - 80), (cx + 100, cy + 80)], fill=(35, 35, 42, 255), width=38)
    apply_drop_shadow(im_p).save(os.path.join(BASE_DIR, 'analog', 'retro-phone-handset.webp'), 'WEBP', quality=95)
    
    im_pol = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_pol = ImageDraw.Draw(im_pol)
    d_pol.rounded_rectangle([cx - 110, cy - 140, cx + 110, cy + 150], radius=6, fill=(252, 250, 246, 255), outline=(220, 215, 205, 255), width=2)
    d_pol.rectangle([cx - 90, cy - 120, cx + 90, cy + 60], fill=(30, 28, 35, 255))
    apply_drop_shadow(im_pol).save(os.path.join(BASE_DIR, 'analog', 'mini-polaroid-frame.webp'), 'WEBP', quality=95)
    
    im_fns = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_fns = ImageDraw.Draw(im_fns)
    d_fns.rectangle([cx - 90, cy - 180, cx + 90, cy + 180], fill=(20, 20, 24, 255))
    for sy in range(cy - 165, cy + 170, 22):
        d_fns.rectangle([cx - 82, sy, cx - 72, sy + 14], fill=(255, 255, 255, 255))
        d_fns.rectangle([cx + 72, sy, cx + 82, sy + 14], fill=(255, 255, 255, 255))
    d_fns.rectangle([cx - 60, cy - 140, cx + 60, cy - 10], fill=(60, 45, 40, 255))
    d_fns.rectangle([cx - 60, cy + 10, cx + 60, cy + 140], fill=(60, 45, 40, 255))
    apply_drop_shadow(im_fns).save(os.path.join(BASE_DIR, 'analog', 'film-negative-strip.webp'), 'WEBP', quality=95)

# -------------------------------------------------------------
# COLLECTION 05: PAPER SCRAPBOOK
# -------------------------------------------------------------
def make_paper_ephemera():
    size = 512
    cx, cy = size // 2, size // 2
    
    im_w = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_w = ImageDraw.Draw(im_w)
    d_w.rectangle([cx - 160, cy - 40, cx + 160, cy + 40], fill=(250, 210, 160, 210))
    for x in range(cx - 150, cx + 160, 30):
        d_w.line([(x, cy - 40), (x + 20, cy + 40)], fill=(255, 255, 255, 90), width=4)
    apply_drop_shadow(im_w).save(os.path.join(BASE_DIR, 'scrapbook', 'washi-masking-tape.webp'), 'WEBP', quality=95)
    
    im_r = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_r = ImageDraw.Draw(im_r)
    d_r.rectangle([cx - 110, cy - 160, cx + 110, cy + 160], fill=(250, 248, 240, 255), outline=(215, 210, 200, 255), width=2)
    for ly in range(cy - 130, cy + 70, 20):
        lw = random.randint(70, 170)
        d_r.line([(cx - 85, ly), (cx - 85 + lw, ly)], fill=(50, 50, 55, 220), width=4)
    for bx in range(cx - 85, cx + 85, 5):
        if random.random() > 0.3:
            d_r.line([(bx, cy + 90), (bx, cy + 135)], fill=(30, 30, 30, 255), width=random.choice([2, 3, 4]))
    apply_drop_shadow(im_r).save(os.path.join(BASE_DIR, 'scrapbook', 'store-receipt-stub.webp'), 'WEBP', quality=95)
    
    im_t = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_t = ImageDraw.Draw(im_t)
    d_t.rounded_rectangle([cx - 140, cy - 75, cx + 140, cy + 75], radius=10, fill=(235, 215, 180, 255), outline=(180, 150, 110, 255), width=3)
    d_t.ellipse([cx - 150, cy - 20, cx - 130, cy + 20], fill=(0, 0, 0, 0))
    d_t.ellipse([cx + 130, cy - 20, cx + 150, cy + 20], fill=(0, 0, 0, 0))
    d_t.line([(cx - 100, cy), (cx + 100, cy)], fill=(120, 80, 40, 255), width=6)
    apply_drop_shadow(im_t).save(os.path.join(BASE_DIR, 'scrapbook', 'vintage-ticket-stub.webp'), 'WEBP', quality=95)
    
    im_st = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_st = ImageDraw.Draw(im_st)
    d_st.rectangle([cx - 100, cy - 130, cx + 100, cy + 130], fill=(245, 242, 235, 255))
    for py in range(cy - 125, cy + 130, 18):
        d_st.ellipse([cx - 106, py - 5, cx - 94, py + 5], fill=(0, 0, 0, 0))
        d_st.ellipse([cx + 94, py - 5, cx + 106, py + 5], fill=(0, 0, 0, 0))
    for px in range(cx - 95, cy + 100, 18):
        d_st.ellipse([px - 5, cy - 136, px + 5, cy - 124], fill=(0, 0, 0, 0))
        d_st.ellipse([px - 5, cy + 124, px + 5, cy + 136], fill=(0, 0, 0, 0))
    d_st.rectangle([cx - 80, cy - 105, cx + 80, cy + 105], fill=(45, 85, 145, 255))
    d_st.ellipse([cx - 45, cy - 45, cx + 45, cy + 45], fill=(225, 55, 55, 255))
    apply_drop_shadow(im_st).save(os.path.join(BASE_DIR, 'scrapbook', 'postal-stamp-airmail.webp'), 'WEBP', quality=95)
    
    im_bl = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_bl = ImageDraw.Draw(im_bl)
    d_bl.rounded_rectangle([cx - 130, cy - 65, cx + 130, cy + 65], radius=8, fill=(255, 255, 255, 255), outline=(210, 210, 210, 255), width=2)
    for bx in range(cx - 105, cx + 105, 6):
        if random.random() > 0.25:
            d_bl.line([(bx, cy - 40), (bx, cy + 40)], fill=(20, 20, 20, 255), width=random.choice([2, 4]))
    apply_drop_shadow(im_bl).save(os.path.join(BASE_DIR, 'scrapbook', 'barcode-label.webp'), 'WEBP', quality=95)
    
    im_tp = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_tp = ImageDraw.Draw(im_tp)
    pts = [(cx - 160, cy - 60)]
    for x in range(cx - 160, cx + 165, 10):
        pts.append((x, cy - 60 + random.randint(-6, 6)))
    pts.append((cx + 160, cy + 60))
    for x in range(cx + 160, cx - 165, -10):
        pts.append((x, cy + 60 + random.randint(-6, 6)))
    d_tp.polygon(pts, fill=(248, 245, 235, 255), outline=(225, 220, 205, 255), width=2)
    apply_drop_shadow(im_tp).save(os.path.join(BASE_DIR, 'scrapbook', 'torn-paper-edge.webp'), 'WEBP', quality=95)
    
    im_nc = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_nc = ImageDraw.Draw(im_nc)
    d_nc.rectangle([cx - 130, cy - 90, cx + 130, cy + 90], fill=(240, 237, 228, 255), outline=(190, 185, 175, 255), width=2)
    d_nc.line([(cx - 110, cy - 65), (cx + 110, cy - 65)], fill=(20, 20, 20, 255), width=10)
    d_nc.line([(cx - 110, cy - 45), (cx + 60, cy - 45)], fill=(30, 30, 30, 255), width=8)
    for ly in range(cy - 20, cy + 75, 14):
        d_nc.line([(cx - 110, ly), (cx - 10, ly)], fill=(70, 70, 75, 255), width=3)
        d_nc.line([(cx + 10, ly), (cx + 110, ly)], fill=(70, 70, 75, 255), width=3)
    apply_drop_shadow(im_nc).save(os.path.join(BASE_DIR, 'scrapbook', 'newspaper-clipping.webp'), 'WEBP', quality=95)

# -------------------------------------------------------------
# COLLECTION 06: CUTE OBJECTS
# -------------------------------------------------------------
def make_cute_patches():
    size = 512
    cx, cy = size // 2, size // 2
    
    im_bow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_bow = ImageDraw.Draw(im_bow)
    d_bow.polygon([(cx, cy), (cx - 140, cy - 70), (cx - 130, cy + 60), (cx, cy + 15)], fill=(245, 160, 185, 255))
    d_bow.polygon([(cx, cy), (cx + 140, cy - 70), (cx + 130, cy + 60), (cx, cy + 15)], fill=(245, 160, 185, 255))
    d_bow.polygon([(cx - 20, cy + 10), (cx - 90, cy + 150), (cx - 40, cy + 130), (cx, cy + 20)], fill=(230, 130, 160, 255))
    d_bow.polygon([(cx + 20, cy + 10), (cx + 90, cy + 150), (cx + 40, cy + 130), (cx, cy + 20)], fill=(230, 130, 160, 255))
    d_bow.ellipse([cx - 28, cy - 20, cx + 28, cy + 30], fill=(230, 120, 150, 255), outline=(255, 255, 255, 180), width=3)
    apply_drop_shadow(im_bow).save(os.path.join(BASE_DIR, 'cute', 'fabric-bow-pink.webp'), 'WEBP', quality=95)
    
    im_red_bow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_rb = ImageDraw.Draw(im_red_bow)
    d_rb.polygon([(cx, cy), (cx - 140, cy - 70), (cx - 130, cy + 60), (cx, cy + 15)], fill=(215, 30, 45, 255))
    d_rb.polygon([(cx, cy), (cx + 140, cy - 70), (cx + 130, cy + 60), (cx, cy + 15)], fill=(215, 30, 45, 255))
    d_rb.polygon([(cx - 20, cy + 10), (cx - 90, cy + 150), (cx - 40, cy + 130), (cx, cy + 20)], fill=(175, 15, 30, 255))
    d_rb.polygon([(cx + 20, cy + 10), (cx + 90, cy + 150), (cx + 40, cy + 130), (cx, cy + 20)], fill=(175, 15, 30, 255))
    d_rb.ellipse([cx - 28, cy - 20, cx + 28, cy + 30], fill=(185, 20, 35, 255), outline=(255, 200, 200, 160), width=3)
    apply_drop_shadow(im_red_bow).save(os.path.join(BASE_DIR, 'cute', 'satin-ribbon-red.webp'), 'WEBP', quality=95)
    
    im_ch = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_ch = ImageDraw.Draw(im_ch)
    d_ch.line([(cx, cy - 140), (cx - 65, cy + 30)], fill=(65, 125, 55, 255), width=7)
    d_ch.line([(cx, cy - 140), (cx + 65, cy + 45)], fill=(65, 125, 55, 255), width=7)
    d_ch.ellipse([cx - 110, cy + 10, cx - 20, cy + 100], fill=(215, 25, 40, 255))
    d_ch.ellipse([cx + 20, cy + 25, cx + 110, cy + 115], fill=(215, 25, 40, 255))
    d_ch.ellipse([cx - 85, cy + 25, cx - 60, cy + 50], fill=(255, 255, 255, 170))
    d_ch.ellipse([cx + 45, cy + 40, cx + 70, cy + 65], fill=(255, 255, 255, 170))
    apply_drop_shadow(im_ch).save(os.path.join(BASE_DIR, 'cute', 'embroidered-cherry.webp'), 'WEBP', quality=95)
    
    im_sb = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_sb = ImageDraw.Draw(im_sb)
    pts = [(cx, cy + 160), (cx - 120, cy + 20), (cx - 100, cy - 90), (cx, cy - 60), (cx + 100, cy - 90), (cx + 120, cy + 20)]
    d_sb.polygon(pts, fill=(225, 35, 45, 255))
    for sx, sy in [(-50, -20), (0, -10), (50, -20), (-25, 40), (25, 40), (0, 90)]:
        d_sb.ellipse([cx + sx - 5, cy + sy - 8, cx + sx + 5, cy + sy + 8], fill=(255, 235, 120, 255))
    d_sb.polygon([(cx, cy - 60), (cx - 80, cy - 110), (cx - 20, cy - 90), (cx, cy - 140), (cx + 20, cy - 90), (cx + 80, cy - 110)], fill=(65, 155, 60, 255))
    apply_drop_shadow(im_sb).save(os.path.join(BASE_DIR, 'cute', 'embroidered-strawberry.webp'), 'WEBP', quality=95)
    
    im_cld = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_cld = ImageDraw.Draw(im_cld)
    for bx, by, br in [(-70, 20, 60), (0, -30, 75), (70, 10, 65)]:
        d_cld.ellipse([cx + bx - br, cy + by - br, cx + bx + br, cy + by + br], fill=(250, 252, 255, 255))
    d_cld.rounded_rectangle([cx - 120, cy - 10, cx + 120, cy + 80], radius=30, fill=(250, 252, 255, 255), outline=(190, 215, 245, 255), width=4)
    apply_drop_shadow(im_cld).save(os.path.join(BASE_DIR, 'cute', 'cloud-patch.webp'), 'WEBP', quality=95)
    
    im_bun = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_bun = ImageDraw.Draw(im_bun)
    d_bun.ellipse([cx - 95, cy - 40, cx + 95, cy + 120], fill=(252, 250, 248, 255), outline=(210, 200, 195, 255), width=3)
    d_bun.ellipse([cx - 75, cy - 170, cx - 25, cy - 10], fill=(252, 250, 248, 255), outline=(210, 200, 195, 255), width=3)
    d_bun.ellipse([cx + 25, cy - 170, cx + 75, cy - 10], fill=(252, 250, 248, 255), outline=(210, 200, 195, 255), width=3)
    d_bun.ellipse([cx - 65, cy - 145, cx - 35, cy - 35], fill=(255, 185, 195, 255))
    d_bun.ellipse([cx + 35, cy - 145, cx + 65, cy - 35], fill=(255, 185, 195, 255))
    d_bun.ellipse([cx - 40, cy + 20, cx - 26, cy + 34], fill=(30, 30, 30, 255))
    d_bun.ellipse([cx + 26, cy + 20, cx + 40, cy + 34], fill=(30, 30, 30, 255))
    d_bun.polygon([(cx - 8, cy + 42), (cx + 8, cy + 42), (cx, cy + 52)], fill=(255, 150, 170, 255))
    apply_drop_shadow(im_bun).save(os.path.join(BASE_DIR, 'cute', 'bunny-patch.webp'), 'WEBP', quality=95)
    
    im_bear = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d_bear = ImageDraw.Draw(im_bear)
    d_bear.ellipse([cx - 105, cy - 60, cx + 105, cy + 110], fill=(165, 115, 75, 255), outline=(120, 80, 50, 255), width=3)
    d_bear.ellipse([cx - 110, cy - 90, cx - 50, cy - 30], fill=(165, 115, 75, 255), outline=(120, 80, 50, 255), width=3)
    d_bear.ellipse([cx + 50, cy - 90, cx + 110, cy - 30], fill=(165, 115, 75, 255), outline=(120, 80, 50, 255), width=3)
    d_bear.ellipse([cx - 40, cy + 20, cx + 40, cy + 85], fill=(225, 190, 155, 255))
    d_bear.ellipse([cx - 16, cy + 32, cx + 16, cy + 54], fill=(40, 30, 20, 255))
    d_bear.ellipse([cx - 45, cy - 5, cx - 30, cy + 10], fill=(30, 20, 15, 255))
    d_bear.ellipse([cx + 30, cy - 5, cx + 45, cy + 10], fill=(30, 20, 15, 255))
    apply_drop_shadow(im_bear).save(os.path.join(BASE_DIR, 'cute', 'bear-patch.webp'), 'WEBP', quality=95)

def main():
    for sub in ['fabric', 'botanical', 'denim-y2k', 'analog', 'scrapbook', 'cute']:
        ensure_dir(os.path.join(BASE_DIR, sub))
        
    print("Generating Collection 01 — Fabric Patches...")
    make_fabric_star(base_color=(175, 35, 38), stitch_color=(252, 248, 235), name='red-stitched-star.webp')
    make_fabric_star(base_color=(35, 65, 120), stitch_color=(255, 255, 255), name='blue-stitched-star.webp')
    make_fabric_star(base_color=(235, 225, 205), stitch_color=(140, 110, 80), name='cream-stitched-star.webp')
    make_fabric_star(base_color=(32, 32, 36), stitch_color=(240, 240, 240), name='black-stitched-star.webp')
    make_fabric_heart(base_color=(185, 35, 45), stitch_color=(255, 250, 240), name='fabric-heart.webp')
    make_fabric_heart(base_color=(35, 65, 115), stitch_color=(225, 185, 65), name='denim-heart.webp')
    make_fabric_misc('lightning', (235, 195, 35), (40, 40, 40), 'fabric-lightning.webp')
    make_fabric_misc('clover', (45, 135, 55), (180, 240, 170), 'fabric-clover.webp')
    make_fabric_misc('moon', (235, 205, 105), (255, 255, 255), 'fabric-moon.webp')
    make_fabric_misc('flower', (205, 80, 105), (255, 245, 245), 'fabric-flower.webp')
    
    print("Generating Collection 02 — Botanical...")
    make_realistic_lily(petal_base=(105, 18, 28), petal_tip=(165, 32, 48), throat_color=(85, 110, 45), stamen_color=(80, 15, 22), name='burgundy-lily.webp')
    make_realistic_lily(petal_base=(245, 245, 240), petal_tip=(230, 230, 220), throat_color=(120, 160, 60), stamen_color=(220, 130, 30), name='white-lily.webp')
    make_realistic_lily(petal_base=(235, 150, 175), petal_tip=(215, 95, 135), throat_color=(140, 180, 70), stamen_color=(180, 50, 70), name='pink-lily.webp')
    make_other_botanicals()
    
    print("Generating Collection 03 — Denim / Y2K...")
    make_fabric_star(base_color=(38, 70, 125), stitch_color=(235, 190, 70), name='denim-star.webp')
    make_fabric_misc('flower', (42, 75, 130), (255, 255, 255), 'denim-butterfly.webp')
    make_chrome_star()
    make_chrome_heart()
    make_chrome_sparkle()
    make_safety_pin()
    make_paper_clip()
    make_eight_ball()
    
    print("Generating Collection 04 — Analog Camera & Music...")
    make_film_roll()
    make_retro_camera()
    make_cd_star_disc()
    make_music_player_bar()
    make_other_analogs()
    
    print("Generating Collection 05 — Paper Scrapbook & Ephemera...")
    make_paper_ephemera()
    
    print("Generating Collection 06 — Cute Objects...")
    make_cute_patches()
    
    print("All 43 sticker assets generated successfully!")

if __name__ == '__main__':
    main()
