# Builds the shipped game file from the source parts listed in src/manifest.json (joined in that order, byte for byte).
#   python3 tools/build.py            write the output file
#   python3 tools/build.py --check    fail if the output file differs from what src/ builds (a hand edit, or a forgotten build)
#   python3 tools/build.py --out F    write somewhere else, e.g. to compare with the committed file
# The output file is committed (tests, the release workflow and the desktop app read it), but it is generated: edit src/, then build.
# A part is either a path (a source file, joined as it is) or a data file to wrap:
#   {"file": "data/x.json", "before": "<text in front>", "after": "<text behind>", "as": "text" | "base64" | "changelog"}
#   text: the file as it is; base64: a binary file (the models), encoded; changelog: changelog.json written out as `var CHANGELOG = [...]`.
import base64, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')

def manifest():
    with open(os.path.join(SRC, 'manifest.json'), encoding='utf-8') as f:
        return json.load(f)

def output_path():
    return os.path.join(ROOT, manifest()['output'])

def part_name(part):
    return part if isinstance(part, str) else part['file']

def part_paths():
    """Paths of the source parts (not the wrapped data files): the parts tools may edit as text."""
    return [os.path.join(SRC, p) for p in manifest()['parts'] if isinstance(p, str)]

def _q(s): return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"

def changelog_js(entries):
    L = ['var CHANGELOG = [']
    for i, e in enumerate(entries):
        L.append('  { v: %s, d: %s, t: %s, g: [' % (_q(e['v']), _q(e['d']), _q(e['t'])))
        for j, (head, items) in enumerate(e['g']):
            L.append('    [%s, [' % _q(head))
            for k, it in enumerate(items): L.append('      ' + _q(it) + (',' if k < len(items) - 1 else ''))
            L.append('    ]]' + (',' if j < len(e['g']) - 1 else ''))
        L.append('  ] }' + (',' if i < len(entries) - 1 else ''))
    return '\n'.join(L + ['];']) + '\n'

def render(part):
    """The bytes a part adds to the game file."""
    with open(os.path.join(SRC, part_name(part)), 'rb') as f: b = f.read()
    if isinstance(part, str): return b
    how = part.get('as', 'text')
    if how == 'base64': body = base64.b64encode(b)
    elif how == 'changelog': body = changelog_js(json.loads(b.decode('utf-8'))).encode('utf-8')
    elif how == 'text': body = b
    else: raise SystemExit('part %s: unknown "as": %r' % (part['file'], how))
    return part.get('before', '').encode('utf-8') + body + part.get('after', '').encode('utf-8')

def assemble():
    parts = manifest()['parts']; chunks = []
    for i, p in enumerate(parts):
        b = render(p)
        if i < len(parts) - 1 and not b.endswith(b'\n'):
            raise SystemExit('part %s must end with a newline (it is joined to the next part as it is)' % part_name(p))
        chunks.append(b)
    return b''.join(chunks)

def part_with(marker):
    """The (path, text) of the one part that contains marker, for tools that edit a generated region of the source."""
    hits = []
    for p in part_paths():
        with open(p, encoding='utf-8', newline='') as f: t = f.read()
        if marker in t: hits.append((p, t))
    if len(hits) != 1: raise SystemExit('%d parts contain %r (expected exactly 1)' % (len(hits), marker))
    return hits[0]

def write_part(path, text):
    with open(path, 'w', encoding='utf-8', newline='') as f: f.write(text)

def write(out=None):
    data = assemble(); out = out or output_path()
    with open(out, 'wb') as f: f.write(data)
    return out, len(data)

def check():
    data = assemble(); out = output_path()
    try:
        with open(out, 'rb') as f: cur = f.read()
    except OSError: cur = None
    return cur == data

if __name__ == '__main__':
    a = sys.argv[1:]
    if a == ['--check']:
        if check(): print('build in sync: %s matches src/' % os.path.basename(output_path()))
        else:
            print('OUT OF SYNC: %s differs from what src/ builds. Edit the files in src/, then run: python3 tools/build.py' % os.path.basename(output_path())); sys.exit(1)
    elif len(a) == 2 and a[0] == '--out': print('wrote %s (%d bytes)' % write(a[1]))
    elif not a: print('wrote %s (%d bytes)' % write())
    else: sys.exit(__doc__)
