#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

# This file is only used if you use `make publish` or
# explicitly specify it as your config file.

import os
import sys
sys.path.append(os.curdir)
from pelicanconf import *

# 因為 publishconf.py 在 pelicanconf.py 之後, 因此若兩處有相同變數的設定, 將以較後讀入的 publishconf.py 中的設定為主.

# 將所有靜態 html 檔案移到 blog 子目錄
SITEURL = 'blog'
# 此設定用於將資料送到 gh-pages, 因此使用絕對 URL 設定 (嘗試用 相對目錄設定)
RELATIVE_URLS = True
# 為了要讓 local 與 gh-pages 上都能夠使用 Tipue search, 可能要採用不同的 theme
THEME = 'theme/pelican-bootstrap3'
#BOOTSTRAP_THEME = 'readable'
#BOOTSTRAP_THEME = 'readable-old'
BOOTSTRAP_THEME = 'united'
#PYGMENTS_STYLE = 'paraiso-drak'
#PYGMENTS_STYLE = 'fruity'
# 為了同時兼容 render_math, 必須放棄 fruity
PYGMENTS_STYLE = 'monokai'

FEED_ALL_ATOM = 'feeds/all.atom.xml'
CATEGORY_FEED_ATOM = 'feeds/%s.atom.xml'

DELETE_OUTPUT_DIRECTORY = True

# Following items are often useful when publishing
# 必須使用各網誌用戶各自 disqus 討論版設定
#DISQUS_SITENAME = ""
#GOOGLE_ANALYTICS = ""

# 設定網誌以 md 檔案建立的 file system date 為準, 無需自行設定
DEFAULT_DATE = 'fs'

# 遠端的 code hightlight
MD_EXTENSIONS = ['fenced_code', 'extra', 'codehilite(linenums=True)']

# 若要依照日期存檔呼叫
#ARTICLE_URL = 'posts/{date:%Y}/{date:%m}/{date:%d}/{slug}/'
#ARTICLE_SAVE_AS = 'posts/{date:%Y}/{date:%m}/{date:%d}/{slug}/index.html'
PAGE_URL = 'pages/{slug}/'
PAGE_SAVE_AS = 'pages/{slug}/index.html'
SHOW_ARTICLE_AUTHOR = True
