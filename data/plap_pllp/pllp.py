#PLLP
from sympy import symbols, sqrt, solve, cos, sin, Abs

# inputs
ax, ay, bx, by, ac, cb = symbols('ax ay bx by ac cb')
# intermediate variables
ab, dab, bac, degree= symbols('ab dab bac degree')
ad, bd = symbols('ad bd')
# outputs
cx, cy = symbols('cx cy')
# 從 a, b 點座標求 ab, ad 與 bd

ab = sqrt((ax-bx)**2+(ay-by)**2)
'''
ac = sqrt((ax-cx)**2+(ay-cy)**2)
cb = sqrt((cx-bx)**2+(cy-by)**2)
#ac = sqrt((ax-cx)**2+(ay-cy)**2)
'''
# 從兩組解中擇一
data = solve([ac**2-((ax-cx)**2+(ay-cy)**2), cb**2-((cx-bx)**2+(cy-by)**2)], [cx, cy])
# 第1組解
print("cx = ", data[0][0])
print("cy = ", data[1][0])
# 第2組解
print("cx = ", data[0][1])
print("cy = ", data[1][1])
