import struct, zlib, os

# Simple PNG generator for a solid indigo square with a white circle + diagonal line
def create_png(size, filename):
    # Build pixel data: indigo background (#6366f1), white circle, white diagonal line
    pixels = []
    cx, cy = size / 2, size / 2
    r = size * 0.30  # circle radius
    lw = max(2, size // 21)  # line width

    for y in range(size):
        row = bytearray([0])  # filter byte
        for x in range(size):
            # Background color: indigo #6366f1
            bg = (0x63, 0x66, 0xf1, 0xff)
            # Check if inside circle
            dx, dy = x - cx, y - cy
            dist = (dx*dx + dy*dy) ** 0.5
            # Check diagonal line (top-left to bottom-right)
            # Line from (cx - r*0.85, cy - r*0.85) to (cx + r*0.85, cy + r*0.85)
            # Distance from point to line
            lx1, ly1 = cx - r*0.85, cy - r*0.85
            lx2, ly2 = cx + r*0.85, cy + r*0.85
            line_len = ((lx2-lx1)**2 + (ly2-ly1)**2) ** 0.5
            if line_len > 0:
                t = max(0, min(1, ((x-lx1)*(lx2-lx1) + (y-ly1)*(ly2-ly1)) / (line_len*line_len)))
                px, py = lx1 + t*(lx2-lx1), ly1 + t*(ly2-ly1)
                pdist = ((x-px)**2 + (y-py)**2) ** 0.5
            else:
                pdist = 999

            if dist < r and dist > r - lw:
                # Circle outline
                row.extend([0xff, 0xff, 0xff, 0xff])
            elif dist < r and pdist < lw / 2:
                # Diagonal line inside circle
                row.extend([0xff, 0xff, 0xff, 0xff])
            else:
                row.extend(bg)
        pixels.append(bytes(row))

    raw = b''.join(pixels)

    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    png = b'\x89PNG\r\n\x1a\n'
    # IHDR
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    png += chunk(b'IHDR', ihdr)
    # IDAT
    png += chunk(b'IDAT', zlib.compress(raw))
    # IEND
    png += chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Created {filename} ({len(png)} bytes)")

os.makedirs('.', exist_ok=True)
for s in [16, 48, 128]:
    create_png(s, f'icon{s}.png')
