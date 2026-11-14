#!/usr/bin/env python3
"""Cut the code into 20 slices of about 5% each and write the table into SWEEP.md (between the SLICES markers).
Counted: every line of path-editor.html and of checker-run.html, except the generated Path Editor embed (between PE-BEGIN and PE-END, which is path-editor.html again) Molly's saved settings and model (the molly-settings and molly-glb data blocks) and the text of the change log.
Cuts are made at section comments, <script>/<template>/<style> tags and top-level statements (a line indented exactly two spaces inside the page's main script), never inside a function, and the sizes are balanced as it goes.
Usage: python3 tools/reslice.py            (rewrites the table, prints a summary)
       python3 tools/reslice.py --check    (prints the summary only)"""
import re, sys, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N_SLICES=20
FILES=['path-editor.html','checker-run.html']
def load():
    units=[]   # (file, lineno, weight, is_boundary, section_name)
    for f in FILES:
        L=open(os.path.join(ROOT,f),encoding='utf-8').read().split('\n')
        skip=False; data=False
        for i,l in enumerate(L,1):
            if f=='checker-run.html':
                if '<!--PE-BEGIN-->' in l: skip=True; continue
                if '<!--PE-END-->' in l: skip=False; continue
                if skip: continue
                if re.match(r'^<script id="molly-(settings|glb)"',l): data=True      # Molly\'s saved settings and model: data, not code
                if re.match(r'^var CHANGELOG = \[',l): data=True                        # the change log's text entries: words, not code
                if data and re.match(r'^\];',l): data=False; continue
                if data:
                    if '</script>' in l: data=False
                    continue
            w=1
            sec=None
            m=re.match(r'^\s{0,2}(?://|/\*)\s*-{3,}\s*(.*)$',l)
            if m: sec=m.group(1).strip()[:70]
            bnd = bool(sec) or bool(re.match(r'^\s*<(script|template|style)\b|^\s*</(script|template|style)>',l)) or bool(re.match(r'^  function \w+\(',l)) or bool(re.match(r'^function \w+\(',l)) or bool(re.match(r'^(var|const|let) [A-Z_]+ =',l)) or bool(re.match(r'^  [A-Za-z_$]',l))
            units.append((f,i,w,bnd,sec))
    return units
def slices(units):
    # a skipped embed marker is a forced cut
    total=sum(u[2] for u in units); out=[]; cur=[]; w=0; remaining=total
    for k,u in enumerate(units):
        slices_left=N_SLICES-len(out)
        target=remaining/max(1,slices_left)
        forced=False
        if cur and len(out)<N_SLICES-1 and (forced or (w>=target*0.85 and u[3]) or w>=target*1.6 and u[3]):
            out.append(cur); remaining-=w; cur=[]; w=0
        if forced: continue
        cur.append(u); w+=u[2]
    if cur: out.append(cur)
    return out,total
def describe(s):
    f=s[0][0]; a=s[0][1]; b=s[-1][1]
    secs=[u[4] for u in s if u[4]]
    names='; '.join(secs[:4])+(' …' if len(secs)>4 else '') if secs else '(code inside one section)'
    return f,a,b,len(s),names
def main():
    units=load(); sl,total=slices(units)
    rows=[]
    for i,s in enumerate(sl,1):
        # a slice may span the end of path-editor.html into checker-run.html: show each part
        parts=[]; cur=None
        for u in s:
            if cur and cur[0]==u[0] and u[1]==cur[2]+1: cur[2]=u[1]
            elif cur and cur[0]==u[0] and u[1]-cur[2]<=1: cur[2]=u[1]
            else:
                if cur: parts.append(cur)
                cur=[u[0],u[1],u[1]]
        parts.append(cur)
        byf={}
        for p_ in parts: byf.setdefault(p_[0],[]).append('%d-%d'%(p_[1],p_[2]))
        rng='; '.join('%s %s'%(f_,', '.join(r_)) for f_,r_ in byf.items())
        f,a,b,n,names=describe(s)
        rows.append('| %d | %s | %d lines (%.1f%%) | %s |'%(i,rng,n,100.0*n/total,names))
    table='| # | Where | Size | Sections inside |\n|---|-------|------|-----------------|\n'+'\n'.join(rows)
    print('counted lines:',total,'slices:',len(sl))
    if '--check' in sys.argv: print(table); return
    p=os.path.join(ROOT,'SWEEP.md'); s=open(p,encoding='utf-8').read()
    a='<!--SLICES-BEGIN-->'; b='<!--SLICES-END-->'
    i=s.index(a)+len(a); j=s.index(b)
    s=s[:i]+'\n'+table+'\n'+s[j:]
    open(p,'w',encoding='utf-8').write(s); print('table written to SWEEP.md')
main()
