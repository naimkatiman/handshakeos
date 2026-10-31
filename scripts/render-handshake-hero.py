"""Run with Blender 4.5: blender -b --python scripts/render-handshake-hero.py -- [--preview]."""
import argparse
import math
import pathlib
import shutil
import subprocess
import sys
import tempfile

import bpy
from mathutils import Vector

args = argparse.ArgumentParser()
args.add_argument('--preview', action='store_true', help='Render the poster and save the scene, without the video.')
args.add_argument('--size', type=int, default=960)
opts = args.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
root = pathlib.Path(__file__).resolve().parent.parent
assets = root / 'assets' / 'blender'
public = root / 'public' / 'landing'
frames = pathlib.Path(tempfile.gettempdir()) / 'handshakeos-blender-hero-frames'
for folder in (assets, public, frames):
    folder.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.eevee.taa_render_samples = 16
scene.render.resolution_x = opts.size
scene.render.resolution_y = opts.size
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 144
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'AgX'
scene.world = bpy.data.worlds.new('Studio ambient')
scene.world.color = (0.16, 0.20, 0.24)


def material(name, color, metallic=0.0, roughness=0.35, emission=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    if emission:
        shader.inputs['Emission Color'].default_value = (*color, 1)
        shader.inputs['Emission Strength'].default_value = emission
    return mat


navy = material('Midnight ceramic', (0.023, 0.055, 0.078), 0.45)
edge = material('Brushed blue titanium', (0.065, 0.12, 0.16), 0.72, 0.27)
mint = material('Mint enamel', (0.15, 0.74, 0.52), 0.18, 0.27)
ivory = material('Warm paper', (0.88, 0.86, 0.77), 0.08, 0.42)
muted = material('Slate typography', (0.26, 0.39, 0.42), 0.1)
ink = material('Ink typography', (0.025, 0.07, 0.085), 0.05)
amber = material('Amber enamel', (0.96, 0.52, 0.12), 0.30)
glow = material('Signal', (0.20, 0.95, 0.65), 0.1, 0.3, 2)


def plate(name, location, size, mat, parent=None, bevel=0.12):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    modifier = obj.modifiers.new('Rounded machined edges', 'BEVEL')
    modifier.width = bevel
    modifier.segments = 5
    obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    obj.parent = parent
    return obj


def text(body, location, size, mat, parent=None):
    curve = bpy.data.curves.new(body, 'FONT')
    curve.body = body
    curve.size = size
    curve.extrude = 0.0015
    curve.space_character = 1.1
    obj = bpy.data.objects.new(body, curve)
    scene.collection.objects.link(obj)
    obj.location = location
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj


def line(name, points, mat, radius=0.018, parent=None):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radius
    curve.bevel_resolution = 4
    spline = curve.splines.new('POLY')
    spline.points.add(len(points) - 1)
    for p, position in zip(spline.points, points):
        p.co = (*position, 1)
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj


def ball(name, position, radius, mat, parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=radius, location=position)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    for face in obj.data.polygons:
        face.use_smooth = True
    obj.parent = parent
    return obj


cards = []
for index, (label, position, angle, paper, accent) in enumerate([
    ('CONVERSATION', (-1.05, 1.15, 0.45), -12, True, mint),
    ('COMMITMENT', (1.12, 0.80, 0.78), 12, False, amber),
    ('SOURCE CHECKED', (0.10, -0.94, 1.23), -7, False, mint),
]):
    card = bpy.data.objects.new(label + ' rig', None)
    scene.collection.objects.link(card)
    card.location = position
    card.rotation_euler = (0, 0, math.radians(angle))
    cards.append((card, position, angle))
    width, height = (2.40, 1.65) if index < 2 else (3.06, 1.90)
    plate(label + ' rim', (0, 0, 0), (width, height, 0.13), edge, card)
    plate(label + ' face', (0, 0, 0.08), (width - 0.08, height - 0.08, 0.075), ivory if paper else navy, card)
    left, top = -width / 2 + 0.24, height / 2 - 0.29
    text(label, (left, top, 0.125), 0.13, ink if paper else mint, card)
    if index < 2:
        ball('Identity', (left + 0.14, top - 0.47, 0.18), 0.15, accent, card)
        for row, length in enumerate((1.12, 0.88, 1.42)):
            x = left + (0.43 if row < 2 else 0)
            y = top - 0.37 - row * 0.20
            plate('Message line', (x + length / 2, y, 0.13), (length, 0.048, 0.013), muted, card, 0.018)
        plate('Status pill', (left + 0.53, -height / 2 + 0.25, 0.14), (1.12, 0.23, 0.035), accent, card, 0.10)
        text('REPLY RECEIVED' if index else 'MEETING NOTES', (left + 0.04, -height / 2 + 0.22, 0.17), 0.085, ink, card)
    else:
        text('A deal you can prove.', (left, top - 0.46, 0.13), 0.21, ivory, card)
        for row, length in enumerate((1.65, 1.23)):
            plate('Evidence line', (left + length / 2, top - 0.77 - row * 0.16, 0.13), (length, 0.035, 0.012), muted, card, 0.012)
        plate('Verified pill', (left + 0.57, -height / 2 + 0.28, 0.15), (1.22, 0.28, 0.055), mint, card, 0.12)
        text('VERIFIED', (left + 0.21, -height / 2 + 0.235, 0.19), 0.12, ink, card)
        bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.38, depth=0.14, location=(1.00, -0.39, 0.21))
        seal = bpy.context.object
        seal.name = 'Verification seal'
        seal.data.materials.append(mint)
        seal.parent = card
        bevel = seal.modifiers.new('Seal rim', 'BEVEL')
        bevel.width = 0.035
        bevel.segments = 4
        line('Confirmed check', [(0.81, -0.39, 0.30), (0.96, -0.54, 0.30), (1.21, -0.23, 0.30)], ink, 0.035, card)

# Curved signal paths behind the cards. Bright beads carry the reply toward the evidence card.
paths = [
    [(-1.76, 0.95, 0.55), (-2.20, 0.22, 0.50), (-1.65, -0.95, 0.85), (-0.85, -1.1, 1.25)],
    [(1.84, 0.85, 0.78), (2.30, 0.10, 0.75), (1.94, -0.93, 1.03), (1.02, -1.05, 1.28)],
]


def bezier(points, t):
    return sum((Vector(points[i]) * (math.comb(3, i) * (1 - t) ** (3 - i) * t ** i) for i in range(4)), Vector())


for index, path in enumerate(paths):
    line('Evidence connection', [bezier(path, i / 80) for i in range(81)], mint, 0.018)
    for bead_index in range(2):
        bead = ball('Reply signal', path[0], 0.046, glow)
        for frame in range(1, 146):
            t = ((frame - 1) / 144 + bead_index / 2 + index / 4) % 1
            bead.location = bezier(path, t)
            # Vanish underneath each card before wrapping to the other end.
            bead.scale = (min(t * 14, (1 - t) * 14, 1),) * 3
            bead.keyframe_insert(data_path='location', frame=frame)
            bead.keyframe_insert(data_path='scale', frame=frame)

for index, (card, position, angle) in enumerate(cards):
    for frame in range(1, 146, 6):
        phase = 2 * math.pi * (frame - 1) / 144
        card.location = Vector(position) + Vector((0.025 * math.sin(phase + index), 0, 0.045 * math.sin(phase + index * 0.7)))
        card.rotation_euler = (math.radians(2 * math.sin(phase + index)), math.radians(2 * math.cos(phase + index)), math.radians(angle + 2 * math.sin(phase)))
        card.keyframe_insert(data_path='location', frame=frame)
        card.keyframe_insert(data_path='rotation_euler', frame=frame)


def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()


for name, position, energy, color, size in [
    ('Large softbox', (-3, -2, 7), 800, (0.78, 0.91, 1), 5),
    ('Mint rim', (4, 2, 4), 650, (0.35, 1, 0.75), 4),
    ('Warm edge', (-3, 4, 3), 500, (1, 0.78, 0.51), 3),
]:
    data = bpy.data.lights.new(name, 'AREA')
    data.energy, data.color, data.shape, data.size = energy, color, 'DISK', size
    light = bpy.data.objects.new(name, data)
    scene.collection.objects.link(light)
    light.location = position
    aim(light, (0, 0, 0.7))

bpy.ops.object.camera_add(location=(3.7, -5.8, 9.5))
camera = bpy.context.object
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 6.25
scene.camera = camera
for frame in range(1, 146, 6):
    phase = 2 * math.pi * (frame - 1) / 144
    camera.location = (3.7 + 0.15 * math.sin(phase), -5.8 + 0.10 * math.cos(phase), 9.5)
    aim(camera, (0, 0, 0.85))
    camera.keyframe_insert(data_path='location', frame=frame)
    camera.keyframe_insert(data_path='rotation_euler', frame=frame)

scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(assets / 'handshake-hero.blend'), compress=True)
scene.render.filepath = str(frames / 'poster.png')
bpy.ops.render.render(write_still=True)
ffmpeg = shutil.which('ffmpeg')
if not ffmpeg:
    raise RuntimeError('FFmpeg must be installed to encode the web assets.')
background = f'color=c=0x0b0f14:s={opts.size}x{opts.size}:r=24,format=rgba'
subprocess.run([ffmpeg, '-y', '-hide_banner', '-loglevel', 'error', '-i', str(frames / 'poster.png'), '-frames:v', '1', '-quality', '86', str(public / 'handshake-hero.webp')], check=True)
if not opts.preview:
    scene.render.filepath = str(frames / 'frame-')
    bpy.ops.render.render(animation=True)
    subprocess.run([ffmpeg, '-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', background, '-framerate', '24', '-i', str(frames / 'frame-%04d.png'), '-filter_complex', '[0:v][1:v]overlay=shortest=1,format=yuv420p', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-movflags', '+faststart', str(public / 'handshake-hero.mp4')], check=True)
print('Blender source and web assets saved to', root)
