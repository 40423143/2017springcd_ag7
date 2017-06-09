from math import pi, cos, sin, sqrt, acos

radian = 180/pi
degree = pi/180

#PLAP
def plap(ax, ay, ac, bac, bx, by, pos):
    if pos == 0:
        cx= ac*cos(bac - acos((ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 + abs(ax - bx)**2 - abs(ay - by)**2)/(2*sqrt(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2)*abs(ax - bx)))) + ax 
        cy= ac*sin(bac - acos((ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 + abs(ax - bx)**2 - abs(ay - by)**2)/(2*sqrt(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2)*abs(ax - bx)))) + ay
    else:
        cx= ac*cos(bac + acos((ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 + abs(ax - bx)**2 - abs(ay - by)**2)/(2*sqrt(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2)*abs(ax - bx)))) + ax 
        cy= ac*sin(bac + acos((ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 + abs(ax - bx)**2 - abs(ay - by)**2)/(2*sqrt(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2)*abs(ax - bx)))) + ay
    return cx, cy

#PLLP
def pllp(ax, ay, ac, cb, bx, by, pos):
    if pos == 0:
        cx =  -((ay - by)*(-ac**2*ay + ac**2*by + ax**2*ay + ax**2*by - 2*ax*ay*bx - 2*ax*bx*by + ay**3 - ay**2*by + ay*bx**2 - ay*by**2 + ay*cb**2 + bx**2*by + by**3 - by*cb**2 - sqrt((-ac**2 + 2*ac*cb + ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 - cb**2)*(ac**2 + 2*ac*cb - ax**2 + 2*ax*bx - ay**2 + 2*ay*by - bx**2 - by**2 + cb**2))*(ax - bx)) + (ac**2 - ax**2 - ay**2 + bx**2 + by**2 - cb**2)*(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2))/(2*(ax - bx)*(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2))
        cy =  (-ac**2*ay + ac**2*by + ax**2*ay + ax**2*by - 2*ax*ay*bx - 2*ax*bx*by + ay**3 - ay**2*by + ay*bx**2 - ay*by**2 + ay*cb**2 + bx**2*by + by**3 - by*cb**2 + sqrt((-ac**2 + 2*ac*cb + ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 - cb**2)*(ac**2 + 2*ac*cb - ax**2 + 2*ax*bx - ay**2 + 2*ay*by - bx**2 - by**2 + cb**2))*(-ax + bx))/(2*(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2))
    else:
        cx =  -((ay - by)*(-ac**2*ay + ac**2*by + ax**2*ay + ax**2*by - 2*ax*ay*bx - 2*ax*bx*by + ay**3 - ay**2*by + ay*bx**2 - ay*by**2 + ay*cb**2 + bx**2*by + by**3 - by*cb**2 + sqrt((-ac**2 + 2*ac*cb + ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 - cb**2)*(ac**2 + 2*ac*cb - ax**2 + 2*ax*bx - ay**2 + 2*ay*by - bx**2 - by**2 + cb**2))*(ax - bx)) + (ac**2 - ax**2 - ay**2 + bx**2 + by**2 - cb**2)*(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2))/(2*(ax - bx)*(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2))
        cy =  (-ac**2*ay + ac**2*by + ax**2*ay + ax**2*by - 2*ax*ay*bx - 2*ax*bx*by + ay**3 - ay**2*by + ay*bx**2 - ay*by**2 + ay*cb**2 + bx**2*by + by**3 - by*cb**2 + sqrt((-ac**2 + 2*ac*cb + ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 - cb**2)*(ac**2 + 2*ac*cb - ax**2 + 2*ax*bx - ay**2 + 2*ay*by - bx**2 - by**2 + cb**2))*(ax - bx))/(2*(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2))
    return cx, cy

ax = -60
ay = 0
bx = 0
by = 0
bac = 50*degree
ac = 30
cd = 50
db = 60
ce = 50
ed = 50
cx, cy = plap(ax, ay, ac, bac, bx, by, 0)
print("cx=", cx, "cy=", cy)
dx, dy = pllp(cx, cy, cd, db, bx, by, 0)
print("dx=", dx, "dy=", dy)
ex, ey = pllp(cx, cy, ce, ed, dx, dy, 0)
print("ex=", ex, "ey=", ey)
