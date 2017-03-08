# 國立虎尾科大機械設計工程系大二電腦輔助設計實習課程規劃
# 二十一世紀的機械設計產品開發, 必須能夠直接在網路上進行協同設計, 系統與產品都必須納入產品生命週期管理外, 所有工具都應該能夠隨著需求變更而持續改進.
# syllabus.py
'''
2a(四,678) 9/15(中秋節), 9/22(9-11節補2b9/16課程), 9/29, 10/6, 10/13, 10/20, 10/27, 11/3, 11/10(期中考週), 11/17, 11/24, 12/1, 12/8, 12/15, 12/22, 12/29, 1/5, 1/12
2b(五,234) 9/16(中秋補假), 9/23, 9/30, 10/7, 10/14, 10/21, 10/28, 11/4, 11/11(期中考週), 11/18, 11/25(校慶), 12/2, 12/9, 12/16, 12/23, 12/30, 1/6, 1/13
'''
# 各學員利用學校所發的 Gmail 帳號, 以學號作為帳號申請 github 帳號
# 期中考週前, 主要實習項目為 task1.py, 目標為組裝一台 Kossel Delta 3D printer, 並利用 Solvespace, OnShape, Creo Parametric, Solidworks 建立零組件
# 期中考週之後, 則以開發一套能讓所有課程組員進行網際協同設計的系統, 以能夠完成本課程之協同課程評量任務為例, 設為本課程之 task2.py
# 系統將採 github 帳號登入，且登入後可進行協同設計程式開發 (Flask+redis+GitHub api), 協同網誌編寫，自評及組內互評等工作 (Flask+SQLite+MySQL+GitHub api).
# 各組可自選組員每組 4-7 人, 所有學員在電腦輔助設計室中的座位採電腦程式編排座位, 且該程式的開發設為計算機程式課程範例 task1.py
'''
電腦輔助設計實習課程宣言:
你們完全不用擔心課程成績，能讓你不及格的，只有你們自己。
來不來上課，
想不想浪費父母的錢，
想不想學東西，
想不想以後有個好學歷、好工作、好家庭，
完全操之在你們自己，
'''
# 上課方式: 課堂講解, 課堂提問與討論, 各成員 github 與 bitbucket (僅作為同步備份用) 倉儲的協同與維護 (採基本的提交推送與拉回請求等模式)
# 課程評量: 學員自評 (30%), 組內學員互評 (30%), 各組員 github 倉儲與靜態網誌內容評量 (40%) (此一網際課程評量程式設為本課程 task2.py)
'''
reference books:
學校已經購買的電子書 (必須在電腦教室中下載)
http://link.springer.com/book/10.1007/978-1-4842-0076-6 (Pro Git)
http://link.springer.com/book/10.1007/978-1-4842-1085-7 (Beginning Windows 10)
http://link.springer.com/book/10.1007/978-1-4842-1173-1 (3D Printing with Delta Printers)
http://link.springer.com/book/10.1007/978-1-4302-6808-6 (Maintaining and Troubleshooting Your 3D Printer)
http://link.springer.com/book/10.1007/978-3-662-46221-8 (Handbook of Mathematics)
http://link.springer.com/referencework/10.1007/0-387-21632-4 (Handbook of Physics)
http://link.springer.com/book/10.1007/978-1-4419-7719-9 (Handbook of Open Source Tools)
http://link.springer.com/book/10.1007/978-3-319-19303-8 (Handbook of Modern Sensors)
http://link.springer.com/book/10.1007/978-3-319-32552-1 (Springer Handbook of Robotics)
http://link.springer.com/book/10.1007/978-3-662-45373-5 (Project Management Handbook)
http://link.springer.com/book/10.1007/978-3-642-24458-2 (Handbook of Manufacturing Control)
http://link.springer.com/book/10.1007/978-3-662-46391-8 (Handbook Factory Planning and Design)
http://link.springer.com/book/10.1007/978-3-8348-9789-3 (Chassis Handbook)
http://link.springer.com/book/10.1007/978-1-4614-7450-0 (Handbook of Food Factory Design)
http://link.springer.com/book/10.1007/978-1-4939-0755-7 (Springer Handbook of Acoustics)
----
http://link.springer.com/book/10.1007/978-3-319-27131-6 (Computational Design of Rolling Bearings)
http://link.springer.com/book/10.1007/978-3-319-29841-2 (Heat Pipe Design and Technology)
http://link.springer.com/book/10.1007/978-3-319-29155-0 (Collaboration in Creative Design)
http://link.springer.com/book/10.1007/978-3-319-35155-1 (The Philosophy of Science and Engineering Design)
'''
