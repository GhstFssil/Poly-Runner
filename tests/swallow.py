# find code that a // comment has swallowed: a line whose comment part looks like statements
import re,sys
for f in sys.argv[1:]:
    for n,l in enumerate(open(f).read().split('\n'),1):
        if len(l)>4000: continue
        # find first // not inside a string (rough): skip http:// and '//' in quotes
        i=0; instr=None; pos=-1
        while i<len(l)-1:
            ch=l[i]
            if instr:
                if ch=='\\': i+=2; continue
                if ch==instr: instr=None
            else:
                if ch in '\'"`': instr=ch
                elif ch=='/' and l[i+1]=='/' and (i==0 or l[i-1]!=':'): pos=i; break
                elif ch=='/' and l[i+1]=='*':
                    j=l.find('*/',i+2)
                    if j<0: break
                    i=j+2; continue
            i+=1
        if pos<0: continue
        c=l[pos+2:]
        # code-like: an assignment or call followed by a semicolon, then more
        if re.search(r'[A-Za-z_$][\w$.\[\]]*\s*(=|\+=|-=)\s*[^=;]{1,120};', c) or re.search(r'\b(if|for|while|return)\s*\(.*\)\s*[{;]', c) or re.search(r'\bvar\s+\w+\s*=', c):
            print('%s:%d: ...%s'%(f.split('/')[-1],n,c[:230]))
