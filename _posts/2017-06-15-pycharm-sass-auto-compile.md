---
layout: post
title: "Pycharm에서 SASS auto compile"
description: "sass auto compile"
date: 2017-06-15
tags: [css,sass,scss]
author-id: pignu
comments: true
---



#### PyCharm

최근에 `python`을 많이 사용하다보니 자연스레 [jetBrains](https://www.jetbrains.com)사에서 개발한 [PyCharm](https://www.jetbrains.com/pycharm/)을 주로 사용하게 되었다. 아직 많이 사용해보지는 않았으나 python을 이용하는데에 있어서는 전체적인 기능에선 매우 만족하고 있다.[^1] 

그런데 css를 할 때 SASS를 [atom](https://atom.io)에서 많이 사용하였었는데[^2] 아뿔사 PyCharm에서는 얼핏보았을때 Plugins에 [sass support](https://www.jetbrains.com/help/pycharm/2017.1/compiling-sass-less-and-scss-to-css.html)는 보여도 auto compile이 보이질 않는 것이었다. 

잡설이 길었는데, PyCharm에서 sass auto compile을 설정하고 컴파일되는 위치를 변경해보자.



#### File Watchers

- [File Watchers](https://www.jetbrains.com/help/pycharm/2017.1/file-watchers.html)란 무엇일까? 

  PyCharm은 기본적으로 내장된 컴파일러를 가지고 있지 않는다. 대신에 우리가 파이참의 외부에서 설치한 컴파일러들을 통합관리하도록 도와주는 것이 **File Watcher**이다.
   <br>

- 간단한 사용법
  ![fileWatcher001](https://github.com/pignuante/pignuante.github.io/blob/master/images/fileWatcher001.png?raw=true)

  ![fileWatcher002](https://github.com/pignuante/pignuante.github.io/blob/master/images/fileWatcher002.png?raw=true)
  기본적으로 `scss`파일을 만들면 자동으로 `file watcher`에서 설정하겠냐는 메세지가 뜬다.<br>
  ​

  1. PyCharm 설정창에서 Tools -> File Watcher 탭으로 진입.

  2. 스샷에는 가려져서 보이지 않지만 `+`버튼을 누르고 SCSS[^3]를 선택한다.

  3. 2번에서 선택한 file tempate인 SCSS가 선택되어져 있고 그 밑에 컴파일러를 선택해준다.
     지금 같은 경우는 기본적으로 macOS에 설치되어 있는 scss컴파일러가 선택되었다.

  4. Compile Argument를 설정해준다. 기본 환경변수가 무엇이 있는지 잘 모를때에는 우측의 `insert macro`

  5. ```shell
     --no-cache
     --update
     $FileName$:$FileNameWithoutExtension$.css
     ```

     1,2번 라인은 커맨드 라인에서 `scss` 명령어를 실행할때의 옵션을 설정해주는 것이다. `scss  --no-cache --update`

     그리고 3번째인자의 `$FileName$`은 미리 설정되어있는 환경변수로 지금 실행하는 파일의 이름을 뜻하고 `$FileNameWithoutExtension$`는 확장자를 제외한 파일 이름[^4]을 출력한다음 `.css`를 뒤에 붙여서 css파일로 만들어준다.

     결국엔 저 명령어는 `scss --no-cache base.scss base.css`라는 명령어를 커맨드라인에서 실행한 것과 같은 결과가 나온다.

  6. 여기서 나는 컴파일을 지금 폴더가 아닌 지금 파일의 형제폴더인 `css`폴더로 컴파일이 되게 하기 위해서 명령어를 살짝 바꿧다.

     ![fileWatcher003](https://github.com/pignuante/pignuante.github.io/blob/master/images/fileWatcher003.png?raw=true)

     위에서 언급된 명령어가 같은 폴더에 컴파일이 되고 있으므로 컴파일될 위치만 재설정하면 되는 간단한 명령어이다.

     ```powershell
     --no-cache
     --update
     $FileName$:$FileParentDir$/css/$FileNameWithoutExtension$.css
     ```

     `$FileParentDir$/css/$FileNameWithoutExtension$.css`라는 것만 추가 되었는데 `$FileParentDir$`는 지금 파일의 부모폴더의 주소이고 `css`는 그 부모폴더내의 css폴더를 의미한다. 물론 `../css`라고 해도 같은 것을 의미한다.

     이미 설정되어 있는 환경변수를 보고 싶거나 환경변수를 추가하고 싶을때에는 4번째 스텝에서의 `Insert macro...`을 누르면 확인이 가능하다.











[^1]: 근데 이전에는 vim에서 설정을 해서 썼어서 그런듯도 하다..
[^2]: 처음에는 간단한 셸스크립트를 만들어서 쓰다가 atom에서 sass 자동 컴파일을 해주는데 너무 편해서 애용하였다.
[^3]: 다른 파일을 컴파일한다쳐도 거의 비슷한 순서일듯하다.
[^4]: ex) `a.css`이면 그냥 `a`가 출력된다.