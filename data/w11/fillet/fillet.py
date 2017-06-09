'''
A, F, E 點座標已知

CBD Arc 半徑已知

EDG Arc 半徑已知

求 B, C, D 點座標
'''
#fillet
from sympy import symbols, sqrt, solve, cos, sin, Abs
 
# inputs
ax, ay, fx, fy, ex, ey, cr, er = symbols('ax, ay, fx, fy, ex, ey, cr, er')
# intermediate variables
cd, de, cb, ab, ac, fb, fc, ce, af  = symbols('cd, de, cb, ab, ac, fb, fc, ce, af')
# outputs
bx, by, cx, cy, dx, dy = symbols('bx, by, cx, cy, dx, dy')
# 求各線段長度
cd = sqrt((cx-dx)**2+(cy-dy)**2)
ce = sqrt((cx-ex)**2+(cy-ey)**2)
de = sqrt((dx-ex)**2+(dy-ey)**2)
cb = sqrt((cx-bx)**2+(cy-by)**2)
ab = sqrt((ax-bx)**2+(ay-by)**2)
ac = sqrt((ax-cx)**2+(ay-cy)**2)
af = sqrt((ax-fx)**2+(ay-fy)**2)
fb = sqrt((fx-bx)**2+(fy-by)**2)
fc = sqrt((fx-cx)**2+(fy-cy)**2)
data = solve([sqrt((cx-dx)**2+(cy-dy)**2)-cd, sqrt((cx-ex)**2+(cy-ey)**2)-ce, \
sqrt((dx-ex)**2+(dy-ey)**2)-de, \
sqrt((cx-bx)**2+(cy-by)**2)-cb, \
sqrt((ax-bx)**2+(ay-by)**2)-ab, \
sqrt((ax-cx)**2+(ay-cy)**2)-ac, \
sqrt((fx-bx)**2+(fy-by)**2)-fb, \
sqrt((fx-cx)**2+(fy-cy)**2)-fc, \
ab**2+cb**2-ac**2, \
cb**2+fb**2-fc**2, cd+de-ce, \
ab+fb-af], [bx, by, cx, cy, dx, dy])
print(data)
#print("bx=", bx, "by=", by, "cx=", cx, "cy=", cy, "dx=", dx, "dy=", dy)
 
 