#PLPP
from sympy import symbols, sqrt, solve

# inputs
bx, by, be, cx, cy, dx, dy = symbols('bx by be cx cy dx dy')
# intermediate variables
cd, m= symbols('cd m')
# outputs
ex, ey = symbols('ex ey')
# e on line cd
cd = sqrt((cx-dx)**2+(cy-dy)**2)
m = (dx-cx)/(dy-cy)
data = solve([be-sqrt((bx-ex)**2+(by-ey)**2), ex-cx-m*(ey-cy)] ,  [ex, ey])
print(data)
'''
[(((cx - dx)*(bx*cx*cy - bx*cx*dy - bx*cy*dx + bx*dx*dy + by*cy**2 - 2*by*cy*dy + by*dy**2 + cx**2*dy - cx*cy*dx - cx*dx*dy + cy*dx**2 + (-cy + dy)*sqrt(be**2*cx**2 - 2*be**2*cx*dx + be**2*cy**2 - 2*be**2*cy*dy + be**2*dx**2 + be**2*dy**2 - bx**2*cy**2 + 2*bx**2*cy*dy - bx**2*dy**2 + 2*bx*by*cx*cy - 2*bx*by*cx*dy - 2*bx*by*cy*dx + 2*bx*by*dx*dy - 2*bx*cx*cy*dy + 2*bx*cx*dy**2 + 2*bx*cy**2*dx - 2*bx*cy*dx*dy - by**2*cx**2 + 2*by**2*cx*dx - by**2*dx**2 + 2*by*cx**2*dy - 2*by*cx*cy*dx - 2*by*cx*dx*dy + 2*by*cy*dx**2 - cx**2*dy**2 + 2*cx*cy*dx*dy - cy**2*dx**2)) - (cx*dy - cy*dx)*(cx**2 - 2*cx*dx + cy**2 - 2*cy*dy + dx**2 + dy**2))/((cy - dy)*(cx**2 - 2*cx*dx + cy**2 - 2*cy*dy + dx**2 + dy**2)), (bx*cx*cy - bx*cx*dy - bx*cy*dx + bx*dx*dy + by*cy**2 - 2*by*cy*dy + by*dy**2 + cx**2*dy - cx*cy*dx - cx*dx*dy + cy*dx**2 + (-cy + dy)*sqrt(be**2*cx**2 - 2*be**2*cx*dx + be**2*cy**2 - 2*be**2*cy*dy + be**2*dx**2 + be**2*dy**2 - bx**2*cy**2 + 2*bx**2*cy*dy - bx**2*dy**2 + 2*bx*by*cx*cy - 2*bx*by*cx*dy - 2*bx*by*cy*dx + 2*bx*by*dx*dy - 2*bx*cx*cy*dy + 2*bx*cx*dy**2 + 2*bx*cy**2*dx - 2*bx*cy*dx*dy - by**2*cx**2 + 2*by**2*cx*dx - by**2*dx**2 + 2*by*cx**2*dy - 2*by*cx*cy*dx - 2*by*cx*dx*dy + 2*by*cy*dx**2 - cx**2*dy**2 + 2*cx*cy*dx*dy - cy**2*dx**2))/(cx**2 - 2*cx*dx + cy**2 - 2*cy*dy + dx**2 + dy**2)), (((cx - dx)*(bx*cx*cy - bx*cx*dy - bx*cy*dx + bx*dx*dy + by*cy**2 - 2*by*cy*dy + by*dy**2 + cx**2*dy - cx*cy*dx - cx*dx*dy + cy*dx**2 + (cy - dy)*sqrt(be**2*cx**2 - 2*be**2*cx*dx + be**2*cy**2 - 2*be**2*cy*dy + be**2*dx**2 + be**2*dy**2 - bx**2*cy**2 + 2*bx**2*cy*dy - bx**2*dy**2 + 2*bx*by*cx*cy - 2*bx*by*cx*dy - 2*bx*by*cy*dx + 2*bx*by*dx*dy - 2*bx*cx*cy*dy + 2*bx*cx*dy**2 + 2*bx*cy**2*dx - 2*bx*cy*dx*dy - by**2*cx**2 + 2*by**2*cx*dx - by**2*dx**2 + 2*by*cx**2*dy - 2*by*cx*cy*dx - 2*by*cx*dx*dy + 2*by*cy*dx**2 - cx**2*dy**2 + 2*cx*cy*dx*dy - cy**2*dx**2)) - (cx*dy - cy*dx)*(cx**2 - 2*cx*dx + cy**2 - 2*cy*dy + dx**2 + dy**2))/((cy - dy)*(cx**2 - 2*cx*dx + cy**2 - 2*cy*dy + dx**2 + dy**2)), (bx*cx*cy - bx*cx*dy - bx*cy*dx + bx*dx*dy + by*cy**2 - 2*by*cy*dy + by*dy**2 + cx**2*dy - cx*cy*dx - cx*dx*dy + cy*dx**2 + (cy - dy)*sqrt(be**2*cx**2 - 2*be**2*cx*dx + be**2*cy**2 - 2*be**2*cy*dy + be**2*dx**2 + be**2*dy**2 - bx**2*cy**2 + 2*bx**2*cy*dy - bx**2*dy**2 + 2*bx*by*cx*cy - 2*bx*by*cx*dy - 2*bx*by*cy*dx + 2*bx*by*dx*dy - 2*bx*cx*cy*dy + 2*bx*cx*dy**2 + 2*bx*cy**2*dx - 2*bx*cy*dx*dy - by**2*cx**2 + 2*by**2*cx*dx - by**2*dx**2 + 2*by*cx**2*dy - 2*by*cx*cy*dx - 2*by*cx*dx*dy + 2*by*cy*dx**2 - cx**2*dy**2 + 2*cx*cy*dx*dy - cy**2*dx**2))/(cx**2 - 2*cx*dx + cy**2 - 2*cy*dy + dx**2 + dy**2))]
'''


