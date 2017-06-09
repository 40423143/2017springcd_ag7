#import os
adata = open("w2b_cadlab.txt", encoding="utf-8").read()
rdata = open("w2b_registered.txt", encoding="utf-8").read().splitlines()
#print(adata)
alist = adata.splitlines()
#print(alist[2])
n = 0
row = 0
final_list = []
w2_list = []
for stud_num in alist[2:]:
    row = row + 1
    blist = stud_num.split("\t")
    #print(blist)
    column = 0
    for i in range(len(blist)):
        column = column + 1
        if blist[i] != "":
            #print(blist[i])
            clist = blist[i].split("_")
            stud_data = clist[0]+"_"+clist[1]+"_"+str(row)+"_"+str(column)
            final_list.append(stud_data)
            w2_list.append(clist[1])
            n = n +1
# 根據數列前導字串排序, 目的在建立分組數列
group_list = sorted(final_list)
print("分組名單:")
for i in range(len(group_list)):
    print(group_list[i])
print("座位列表:")
for i in range(len(final_list)):
    print(final_list[i])
for i in range(len(rdata)):
    if rdata[i] not in w2_list:
        print("缺席學生:", rdata[i])
print("學生總數:", n)
#print(os.environ)
