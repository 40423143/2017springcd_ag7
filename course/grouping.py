# 這個分組程式由 Flask 網際程式修改而來
import math
# 從 browser 導入 document 與 window
# 主要是將特定字串送到新開的 window 內容中
from browser import document, window

def optionaction():
    # 最後傳回的字串為 out_string
    out_string = '''<!doctype html>
<html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<title>分組程式</title>
</head>
<body>
'''
    # 程式內需要暫時使用的 tmp_string
    tmp_string = ""
    # 傳回字串中, 用來說明排序原則的 desc_string
    desc_string = ""
    result = []
    group_sorted = []
    num_of_stud = 0
    # 每組至多 7 人
    max_num_in_one_group = 7
    # 電腦教室配置, 共有 9 排
    total_column = 9
    # 上面為相關變數的初始值設定, 以下開始取出 data_a 或 data_b 進行處理, 由 option3 傳回值決定
    # 2016spring2a.txt 為 2a 當時的分組資料, 位於同一列的學號屬於同一自選組
    content = open("2016fallcadpa.txt").read()
    #result = content.splitlines()
    for line in content.splitlines():
        result.append(list(line.split(",")))
    # i 為行序
    for i in range(len(result)):
        # j 為組員序
        for j in range(len(result[i])):
            tmp_string += result[i][j] + ", "
        out_string += "第" + str(i+1) + "排資料:"+ tmp_string + "<br />"
        tmp_string = ""
    for i in range(len(result)):
        # 開始進入組內排序, 根據 request.form["option1"]  的值決定遞增或遞減
        group_list = sorted(list(filter(None, result[i])))
        #group_list = sorted(list(filter(None, result[i])), reverse=True)
        group_sorted.append(group_list)
    # 遞增
    desc_string += "組內學號最小者為組長."
    #desc_string += "組內學號最大者為組長."
    # 開始進入組間組長學號排序, 根據 request.form["option2"] 的值決定遞增或遞減
    desc_string += "各組長中學號最小者為第1組."
    final_result = sorted(group_sorted)
    #desc_string += "各組長中學號最大者為第1組."
    #final_result = sorted(group_sorted, reverse=True)
    out_string += "<br />" + desc_string + "<br />"
    # i 為行序
    for i in range(len(final_result)):
        # j 為組員序
        for j in range(len(final_result[i])):
            num_of_stud += 1
            tmp_string += final_result[i][j] + ","
        out_string += "第" + str(i+1) + "組:"+ tmp_string + "<br />"
        tmp_string = ""
    #return "總共有" + str(i+) + "組"
    # group_num 為總組數
    group_num = i + 1
    # 截至這裡, 已經完成選組長, 以及定組序的工作 ,接下來要排座位, 並且印出座位表
    # 先算每班的總人數
    #return "總共有"+ str(num_of_stud) + "人"
    seat_by_column = []
    for row in range(max_num_in_one_group):
    # 每組最多 7 人
    #for row in range(7):
        # 這裡的 11 為總組數
        #for column in range(11):
        for column in range(group_num):
            # 因為各分組數列的長度並不相同, 但是最長的有 7 位組員, 因此若無法取得的資料 (因為索引超值), 就補上空字串
            try:
                seat_by_column.append(final_result[column][row])
            except:
                seat_by_column.append("")
    # seat_by_column 為去除空白字串前的座位數列
    # 然後利用 filter(None, seat_by_column) 去除空白字串, 就可以得到以 column 為主的座位排序
    seat_by_column = list(filter(None, seat_by_column))
    # 然後每 N 個取為 1 排, 即可得到以排為主的座位序列, 而 N 則視全班人數除以 9, 也就是 total_column 進位決定, 因為共有 9 排
    N = math.ceil(num_of_stud/total_column)
    # for debug
    #return str(num_of_stud) + ":" + str(total_column) + ":" + str(N)
    column_list = [seat_by_column[n:n+N] for n in range(0, len(seat_by_column), N)]
    # 列出每 N 個組員一排的數列 column_list
    # 接下來要納入以排為主的座位
    # 根據 column_list, 建立一個 dictionary, 其中學號為 index, 座位號為對應值
    seat_dict = {}
    for column in range(len(column_list)):
        for i in range(N):
            try:
                seat_dict.update({column_list[column][i]: (column, i)})
            except:
                seat_dict.update({"": ""})
                
    # 開始準備用順序列出學員座號
    # 根據學號, 排序 dictionary 的方法
    import operator
    seat_dict_sort = sorted(seat_dict.items(), key = operator.itemgetter(0), reverse = False)
    # 依照學號順序, 列出座位表
    out_string += "<br />按照學號次序列出座位表:<br /><br />"
    for i in range(0, len(seat_dict_sort)):
        out_string +=  str(i) + ":"+ str(seat_dict_sort[i]) + "<br />"
    # 結束準備用順序列出學員座號
    # dont know why .reverse() did not work, 只有 [::-1] 可以 reverse list elements
    #g.es(column_list[::-1])

    # 因為經由 zip 逐一重新 transpose 的列資料, 必須配合最大 (也就是總共有 7 列, 也就是 N 的值) 列數補上空白字串 (也就是空位)
    # 所以不能使用 zip, 而必須導入 zip_longest 模組方法
    from itertools import zip_longest
    final_seat = list(zip_longest(*column_list[::-1], fillvalue=""))
    # 列出最後的座位表
    #g.es(final_seat)
    # 最後轉成 html table 標註格式
    out_string += "<br /> <br />"
    out_string += "<table border='1' width='100%'>"
    out_string += "<tr><td colspan='9' style='text-align:center'>講台</td></tr>"
    for row in range(len(final_seat)):
        out_string += "<tr>"
        # 因為每一 row 有 9, 也就是 total_column 個位子
        for i in range(total_column):
            try:
                if i%2 != 0:
                    out_string += "<td style='text-align:center'  bgcolor='#FFD78C' height='30'>" + str(final_seat[row][i]) + "</td>"
                else:
                    out_string += "<td style='text-align:center' height='30'>" + str(final_seat[row][i]) + "</td>"
            except:
                out_string += "<td>&nbsp;</td>"
        out_string += "</tr>"
    out_string += "</table><br /><br /><br />"
    out_string += "</body></html>"
    return out_string
    # 等運算或資料處理結束後, 再將相關值送到對應的 template 進行資料的展示
    #return render_template('optionaction.html', option_list1=option_list1, option_list2=option_list2)
# 開啟新視窗, 並將 openaction() 執行後傳回的字串, 
# 寫到新的視窗中
window.open().document.write(optionaction())
#print(optionaction())
