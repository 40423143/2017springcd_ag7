from browser import window
content = open("2016fallcadpb_groups.txt").read()
#print(content)
result = content.splitlines()
data = ""
n = 1
for line in result:
    group = line.split(":")[1][:-1].split(",")
    #print(group)
    for i in range(len(group)):
        if i == 0:
            data +="第"+str(n)+"組組長為"+group[i]
            data += "<br /><a href='https://"+group[i]+".github.io/2016fallcadp_bg"+str(n)+"'>bg"+str(n)+"分組網頁</a><br /><br />"
        data += "組員作業網頁:<a href='https://"+ group[i]+".github.io/2016fallcadp_hw'>"+group[i]+"</a><br /><br />"
    n = n + 1
	
window.open().document.write(data)
