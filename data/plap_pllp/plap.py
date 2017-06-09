#PLAP
from sympy import symbols, sqrt, solve, cos, sin, Abs

# inputs
ax, ay, bx, by, bac, ac = symbols('ax ay bx by bac ac')
# intermediate variables
ab, dab = symbols('ab dab')
ad, bd = symbols('ad bd')
# outputs
cx, cy = symbols('cx cy')
# 從 a, b 點座標求 ab, ad 與 bd
ab = sqrt((ax-bx)**2+(ay-by)**2)
ad = Abs(bx-ax)
bd = Abs(by-ay)
data = solve(-bd**2+ad**2+ab**2-2*ad*ab*cos(dab), dab)
# 第1組解
dab = data[0]
cx = ax+ac*cos(dab+bac)
cy = ay+ac*sin(dab+bac)
print("cx=", cx, "cy=", cy)
# 第二組解
dab = data[1]
cx = ax+ac*cos(dab+bac)
cy = ay+ac*sin(dab+bac)
print("cx=", cx, "cy=", cy)
