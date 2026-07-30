import zlib
import struct
import math

def draw_app_icon_hd(x, y, w, h):
    # Normalize coordinates to -1.0 .. +1.0
    nx = (x - w/2) / (w/2)
    ny = (y - h/2) / (h/2)
    
    dist = math.sqrt(nx*nx + ny*ny)
    
    # Background: Dark Slate #0f172a (15, 23, 42)
    r, g, b, a = 15, 23, 42, 255

    # Outer Glowing Ring (Emerald #10b981)
    if 0.52 <= dist <= 0.72:
        r, g, b = 16, 185, 129

    # Inner Ring Accent (Cyan #38bdf8)
    if 0.46 <= dist < 0.52:
        r, g, b = 56, 189, 248

    # Clock Hands (White)
    # Hour hand pointing UP
    if abs(nx) <= 0.08 and -0.45 <= ny <= 0:
        r, g, b = 248, 250, 252

    # Minute hand pointing RIGHT
    if abs(ny) <= 0.08 and 0 <= nx <= 0.40:
        r, g, b = 56, 189, 248

    # Center Knob
    if dist <= 0.12:
        r, g, b = 16, 185, 129

    # Top-Right Euro Badge Circle
    # Center at nx=0.45, ny=-0.45, radius 0.35
    bx = nx - 0.45
    by = ny - (-0.45)
    bdist = math.sqrt(bx*bx + by*by)
    if bdist <= 0.30:
        r, g, b = 16, 185, 129

    return (r, g, b, a)

def create_png(width, height, draw_func, filename):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type 0
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
            
    compressed = zlib.compress(raw_data, 9)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(struct.pack('>I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff))
    
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff))
    
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff))
    
    with open(filename, 'wb') as f:
        f.write(png)

create_png(180, 180, draw_app_icon_hd, 'public/apple-touch-icon.png')
create_png(192, 192, draw_app_icon_hd, 'public/pwa-192x192.png')
create_png(512, 512, draw_app_icon_hd, 'public/pwa-512x512.png')
create_png(64, 64, draw_app_icon_hd, 'public/favicon.ico')
create_png(64, 64, draw_app_icon_hd, 'public/favicon.png')
print("HD PNG & ICO Icons generated successfully!")

