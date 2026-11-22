# Shows which source areas use names defined in other areas. Warning only: always exits 0.
#   python3 tools/check_deps.py            summary: for each area, the areas it reaches into
#   python3 tools/check_deps.py -v         also list the names
# The game is one script (one closure), so the split is plain files joined in order and any part may use any name.
# This only reports the coupling so a carve-out can be judged. It reads top-level `function`, `var`, `let` and `const`
# declarations (two-space indent) of 4+ letters from each part and looks for those names as whole words in the other parts.
# Comments and strings count too, so a hit can be a false alarm. An area is the part's folder (data/, mobs/, unsorted/).
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
DECL = re.compile(r'^  (?:function\s+|var\s+|let\s+|const\s+)([A-Za-z_$][\w$]{3,})', re.M)

def main():
    verbose = '-v' in sys.argv[1:]
    with open(os.path.join(SRC, 'manifest.json'), encoding='utf-8') as f:
        parts = json.load(f)['parts']
    text = {}
    for p in parts:
        with open(os.path.join(SRC, p), encoding='utf-8') as f: text[p] = f.read()
    area = lambda p: p.split('/')[0]
    defs = {}                                   # name -> part that declares it
    for p in parts:
        for n in DECL.findall(text[p]): defs.setdefault(n, p)
    uses = {}                                   # (area, other area) -> set of names
    for p in parts:
        words = set(re.findall(r'[A-Za-z_$][\w$]{3,}', text[p]))
        for n in words:
            q = defs.get(n)
            if q and area(q) != area(p): uses.setdefault((area(p), area(q)), set()).add(n)
    if not uses: print('no cross-area uses found'); return
    for (a, b), names in sorted(uses.items()):
        print('%-9s uses %-9s %4d names' % (a, b, len(names)) + ('  ' + ', '.join(sorted(names)) if verbose else ''))
    print('warning only: the game is one closure, so these uses work; the list shows what a carve-out has to keep reachable.')

if __name__ == '__main__':
    main()
    sys.exit(0)
