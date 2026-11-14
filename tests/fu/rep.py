# tiny exact-replace helper: rep(path, [(old, new), ...]) with every old required to occur exactly once
import sys
def rep(path, pairs, count=1):
    s = open(path, encoding='utf-8').read()
    for i, (old, new) in enumerate(pairs):
        n = s.count(old)
        if n != count:
            raise SystemExit('pair %d: found %d times (want %d): %r' % (i, n, count, old[:120]))
        s = s.replace(old, new)
    open(path, 'w', encoding='utf-8').write(s)
    print('ok', len(pairs), 'replacements in', path)
