#!/usr/bin/env python3
"""Prepare silent, seekable hero assets from an approved local render; never overwrite."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('--output', type=Path, default=Path('public/visuals'))
parser.add_argument('--receipt', type=Path, default=Path('scripts/hero-video-provenance.json'))
args = parser.parse_args()
source = args.source.resolve(strict=True)
info = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,r_frame_rate,nb_frames:format=duration', '-of', 'json', str(source)
], text=True))
stream = info['streams'][0]
width, height = stream['width'], stream['height']
if width < 512 or height < 320:
    raise SystemExit('Source is below the tested minimum resolution.')
args.output.mkdir(parents=True, exist_ok=True)
outputs = {
    'desktop': args.output / 'cj-cinco-music-desktop.mp4',
    'mobile': args.output / 'cj-cinco-music-mobile.mp4',
    'poster': args.output / 'cj-cinco-music-poster.jpg',
    'receipt': args.receipt,
}
if any(path.exists() for path in outputs.values()):
    raise SystemExit('An output already exists. Use a new output directory to preserve its custody.')
commands = []

def run(command):
    commands.append(command)
    subprocess.run(command, check=True)

common = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-n', '-i', str(source)]
encode = ['-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p',
          '-g', '1', '-keyint_min', '1', '-sc_threshold', '0', '-movflags', '+faststart',
          '-map_metadata', '-1']
run(common + ['-vf', "scale='min(1280,iw)':-2,setsar=1"] + encode + [str(outputs['desktop'])])
# Keep the brighter central/right sculpture visible in the portrait crop.
run(common + ['-vf', "crop=trunc(ih*3/4/2)*2:ih:trunc((iw-ow)*0.62/2)*2:0,scale=-2:'min(640,ih)',setsar=1"] + encode + [str(outputs['mobile'])])
run(common + ['-frames:v', '1', '-q:v', '2', str(outputs['poster'])])

def digest(path):
    sha = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            sha.update(chunk)
    return sha.hexdigest()

receipt = {
    'source_name': source.name, 'source_sha256': digest(source),
    'source_probe': info, 'purpose': 'Scroll-controlled decorative hero; no audio track',
    'encoding': 'H.264, CRF 24, every frame a keyframe, yuv420p, faststart',
    'files': {name: {'name': path.name, 'bytes': path.stat().st_size, 'sha256': digest(path)}
              for name, path in outputs.items() if name != 'receipt'},
    'commands': [[arg if arg != str(source) else '<source>' for arg in command] for command in commands],
}
outputs['receipt'].parent.mkdir(parents=True, exist_ok=True)
outputs['receipt'].write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt, indent=2))
