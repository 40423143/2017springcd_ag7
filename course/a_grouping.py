content = open("2016fall_cadp_a_groups.txt").read()
#print(content)
result = content.splitlines()
#print(result)
gno = 1
for i in range(len(result)):
    #print(result[i])
    group = result[i].split(":")
    #列出組序
    print("<a href='../g"+str(gno)+"'>第"+str(gno)+"組</a>:<br />")
    #print("第"+str(gno)+"組:<br />")
    #取 group 第2成員, 用逗點隔開納入數列後, 利用[:-1]去掉最後空白
    #print(group[1].split(",")[:-1])
    gmember = group[1].split(",")[:-1]
    for j in range(len(gmember)):
        #print(gmember[j])
        print("<a href='../g"+str(gno)+"/"+str(gmember[j])+"'>"+ \
        str(gmember[j])+"</a> ")
    print("<br />")
    gno = gno + 1
