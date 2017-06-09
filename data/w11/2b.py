data = open("./2b0503.txt", encoding="utf-8").read()
count = 0
# 去掉前面兩列
student = data.split("\n")[2:]
for i in range(len(student)):
    each = student[i].split("\t")
    if each[1] != "出席":
        count = count + 1
print(len(student), count)

		