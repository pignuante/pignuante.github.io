---
layout: post
title: "R with Jupyter Notebook at OSX"
description: ""
date: 2017-12-05
tags: jupyter,r
comments: true
---



최근에 C/C++, python이외에도 R과 SAS를 자주 활용하게 되었다. SAS는 워낙에 비싼거고 제공받은 툴이 툴인지라 어쩔수 없지만 R은 주로 R Studio를 활용하고 있었다. 하지만 이 R Studio도 사용하다 보니 아쉬운 점이 많았다. 그러던 중 Jupyter*~~(갓갓)~~*에서도 R을 돌릴수 있도록 커널이 제공된다는 것을 알고 냉큼..설치해 보았다[^1].ㅎㅎ



1. python 설치

   1. 이전 설치 참조

2. jupyter notebook 설치

   1. `brew install jupyter notebook`

3. R 설치

   1. [R홈페이지](http://healthstat.snu.ac.kr/CRAN/)에서 R을 다운받고 설치한다.

4. Rstudio설치

   1. [Rstudio홈페이지](https://www.rstudio.com/products/rstudio/download/#download)에서 다운로드 받고 설치한다.

5. 이제 jupyter와 R을 연결하기 위한 작업을 한다.

   1. development header 설치

      ```powershell
      $ brew install zmq
      $ brew update
      $ brew upgrade zmq
      ```

   2. Rstudio터미널 실행

      1. 왜인지는 모르겠지만 GUI에서 Rstudio를 실행하면 잘 되질 않고 터미널에서 Rstudio를 실행시키고 해야 작동을 한다. 이래저리 귀찮으니 *alias*명령어로 등록해두자.

         - 자신이 사용하는 셸 설정파일[^2]에 `alias rstudio="open -a /Applications/RStudio.app"`를 등록하고 터미널을 재실행하자.

           ​

   3. 필요 패키지 설치

      1. 그리고 `rstudio`를 터미널에 입력하면 Rstudio가 실행된다.

      2. ```R
         install.packages(c('crayon', 'pbdZMQ', 'devtools'))
         devtools::install_github(paste0('IRkernel/', c('repr', 'IRdisplay', 'IRkernel')))
         ```

         위의 명령어를 입력한다. 그럼 이것저것 설치가 많이 되니 커피 한 잔을 하고 오는 여유를 부려본다. 일단 jupyter로 연결하기 위한 커널 설치는 완료한 것이다.

      3. ```R
         $ IRkernel::installspec()
         $ IRkernel::installspec(user = FALSE)
         ```

         Rstudio를 킨 사용자만 사용 가능하게 하려면 1번 명령어를 모든 사용자가 가능하게 하려면 2번 명령어를 실행한다.











[^1]: R 이외에도 여러가지 언어를 제공해준다!
[^2]: .bashrc, zshrc등등