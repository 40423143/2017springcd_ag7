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
            data += "<br /><a href='https://github.com/"+group[i]+"/2016fallcadp_bg"+str(n)+"'>bg"+str(n)+"分組倉儲</a><br /><br />"
        data += "組員有"+ group[i]+","
    n = n + 1
	
window.open().document.write(data)
