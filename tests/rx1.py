from righ import *
g=Rig(); g.open()
print('initial mesh',g.mesh(), 'game molly', g.ev("JSON.stringify(__molly())"))
def save(label):
    g.click('#exportGlb', 2500)
    print(label,'| status:',g.status(),'|',g.ev("JSON.stringify(__molly())"))
save('run mode')
g.click('#modes2 [data-m="barrier"]', 600); save('barrier mode')
g.click('#modes [data-m="rest"]', 400); save('rest mode')
g.click('#wire'); g.click('#modes2 [data-m="jump"]', 400); save('jump+wire')
print('errs',g.errs)
g.close()
