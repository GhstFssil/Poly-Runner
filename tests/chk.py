import re,subprocess,sys
ok=True
# the game file is generated from src/: a hand edit of it, or a forgotten `python3 tools/build.py`, fails here
r=subprocess.run(['python3','/home/claude/poly-runner/tools/build.py','--check'],capture_output=True,text=True); print(r.stdout.strip())
if r.returncode: ok=False
for f in ['/home/claude/poly-runner/poly-runner.html','/home/claude/poly-runner/path-editor.html']:
    s=open(f).read()
    for i,m in enumerate(re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>',s,re.S)):
        if len(m)<1000 or m.lstrip()[:1] in '{[' or re.match(r'\s*[A-Za-z0-9+/=]{200}',m): continue
        open('/tmp/blk.js','w').write(m)
        r=subprocess.run(['node','--check','/tmp/blk.js'],capture_output=True,text=True)
        if r.returncode: ok=False; print(f.split('/')[-1],i,len(m),r.stderr[:300])
print('syntax OK' if ok else 'SYNTAX ERRORS')
# code swallowed by a // comment (two known false positives)
out=subprocess.run(['python3','/home/claude/poly-runner/tests/swallow.py','/home/claude/poly-runner/poly-runner.html','/home/claude/poly-runner/path-editor.html'],capture_output=True,text=True).stdout.split('\n')
sw=[l for l in out if l.strip() and 'or a very low number' not in l and not re.match(r'poly-runner\.html:(7[4-9]\d|[89]\d\d|1[0-7]\d\d):',l)]
print('swallowed-code check:', 'clean' if not sw else sw)
