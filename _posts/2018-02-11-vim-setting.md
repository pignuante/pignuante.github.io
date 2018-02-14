---
layout: post
title: "vim setting"
description: ""
date: 2018-02-11
tags: vim
comments: true
---

# Vim setting

terminal환경에서 작업을 하다보면 필연적으로 많이 사용하게 되는 text editor인 [vi](https://namu.wiki/w/vi)(m)의 환경설정파일을 간단히 정리해보았다. vim의 사용법은 우선은 생략하고 말 그대로 나의 개인 세팅만 정리하였다.



## 요약

2018.02 기준으로 설정해둔 것은 아래와 같다.

1. vim에서 파일트리창 보기
2. 자동완성
3. vim 테마
4. 문법체크
5. git 호환성
6. 주석처리
7. indent 표시
8. 몇몇 문법추가(markdown, emmet, javascript, html, json)



### 설정 설명

자신의 `.vimrc`가 어딨는지 모르겠다면 vim을 킨 후 `edit $MYVIMRC`라고 입력하자.

#### 1. 기본 세팅 설명

```powershell
" vim 기본 세팅
set encoding=utf8   " vim의 인코딩
set fenc=utf-8		" 파일의 인코딩
set fileencodings=utf-8,cp949,euc-kr,korea,japan " 파일 인코딩 탐색순위
set tenc=utf-8      " 터미널인코딩

set nocompatible    " vi와의 호환성x
set number          " 라인넘버 표시
set numberwidth=2	" 라인넘버 크기
set ruler           " 커서 위치표시
set cursorline      " 커서에 밑줄 표시
set showcmd         " normal 모드 명령어 우하단에 표시
set showmatch       " 괄호 짝 표시
set title           " title 표시

set history=1000	" vim의 history 1000개까지 표시

set backspace=indent,eol,start " 딜리트버튼이 indent와 eol과 start를 지우도록

set expandtab   " tab을 누르면 space가 입력됨
set shiftwidth=4" 기본 인덴트 크기
set tabstop=4   " tab->space
set smarttab	" 삭제로 tab을 한번에 지우기

set hlsearch    " search highlight
set incsearch   " 한글자입력시마다 검색
set ignorecase  " 검색대소문자 무시
set smartcase   " 대문자포함시 대소문자를 맞게 검색
set nowrapscan  " 검색시 마지막에서 처음으로 ㄴㄴ

set linebreak   " 단어단위로 짤림
" 짤린줄임을 좌단에 표시
set showbreak=+++\
set nrformats=alpha,octal,hex,bin " C-a, C-x 하단에 추가 설명
set showtabline=2 " tab line을 항상보여준다
set laststatus=2  " 상태바 표시를 항상한다
set visualbell	  " 땡! 소리 대신에 화면의 깜빡임으로
" 코멘트 하이라이트
highlight Comment term=bold cterm=bold ctermfg=4 
set t_Co=256		" 색
set showcmd         " (부분적인)명령어를 상태라인에 보여줌
set showmatch		" 자신의 짝의 괄호를 보여준다.
set wildmenu        " 자동완성을 좀더 편리하게 확장

filetype off		" filetype을 끈다
filetype plugin indent on	" filetype에 맞는 플러그인, indent를 켠다.

" 이 부분은 굳이 3개가 다 필요한지는 잘 모르겠지만 일단 다 넣었다.
set autoindent		" 지금 커서의 indent를 유지
set cindent			" c문법에 맞는 indent를 제공
set smartindent		" 파일에 맞는 indent를 제공

if has("syntax")	
    syntax enable
endif				" 파일에 문법이 존재 할 시 문법설정을 온 

map <Leader>r :up<Enter>:!python %<Enter> " 하단에 추가 설명
```

- `set nrformats=alpha,octal,hex,bin " C-a, C-x` : 알파벳, 10진수, 16진수, 2진수의 숫자에 커서를 두고 `Ctrl+a`, `Ctrl+x`를 누르면 숫자가 증감한다. 기본은 10진수만!
- `map <Leader>r :up<Enter>:!python %<Enter>` : leader키(\\키)와 r을 누르면 지금 편집하던 프로그램의 변경이 있을 경우 저장을 한 다음 파이썬으로 실행을 한다.

위가 vim에서 기본으로 제공해주는 세팅이다. 옵션리스트를 더 알고 싶으면 `:help option-summary`명령어를 옵션의 설명이 보고 싶다면 `:help 옵션이름`을 입력하자. 

추가적으로 가끔 `ctrl+v`를 누르면 계단형으로 입력이 될 때가 있는데 이럴때에는 **붙여넣기 전**에 `set paste`를 입력하고 **붙여넣은 후**에 `set nopaste`를 입력하자. 물론 `set paste!`라는 토글 명령어로 해결 할 수도 있다!

아예 붙여넣기 전에 자동으로 토글을 실행하도록 매핑을 시도해보자.

------------------------

#### 2. 패키지관리자

##### 2.1. 패키지 관리자의 설치

보통 설명들 보면 `vundle`을 이용한 설치가 많이 나오는데 찾다보니 한국인이 만든 vim 패키지 관리자인 [vim-plug](https://github.com/junegunn/vim-plug)라는 것이 있어서 그걸로 설치하였다.

```powershell
if empty(glob('~/.vim/autoload/plug.vim'))
    silent !curl -fLo ~/.vim/autoload/plug.vim --create-dirs
    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
    autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif
```

위의 문장을 자신의 `.vimrc`파일에 위의 문장을 추가해준다. `.vimrc`파일의 위치를 혹시라도 잘 모르겠다! 싶으면 vim에서 `:edit $MYVIMRC`명령어를 입력한다. 그러면 `vim-plug`가 설치가 된다. 

설치되는 플러그인들은 `~/.vim`폴더안에 저장이 되므로 삭제하고 싶을때는 저 폴더 자체를 지워도 무관하다.



##### 2.2. 패키지의 설치

`vim-plug`로 설치를 하기위해선 

```powershell
call plug#begin()
    Plug 'bling/vim-airline'
    Plug 'vim-airline/vim-airline-themes'

    Plug 'scrooloose/nerdtree'
    Plug 'scrooloose/syntastic'

    Plug 'raimondi/delimitmate'
    Plug 'nathanaelkane/vim-indent-guides'  " indent guide

    Plug 'scrooloose/nerdcommenter' " leader cc (leader == \), c space, cm

    Plug 'tpope/vim-fugitive'       " git in vim
    Plug 'airblade/vim-gitgutter'   " git check 

    Plug 'valloric/youcompleteme'   " 자동완성

    Plug 'pangloss/vim-javascript'  " java script
    Plug 'plasticboy/vim-markdown'  " markdown
    Plug 'othree/html5.vim'         " html
    Plug 'elzr/vim-json'            " json
    Plug 'mattn/emmet-vim'          " emmet
call plug#end()
```

라고 입력한다. `Plug`라고 적힌 것이 설치할 플러그인들이다. 이제 vim의 normal모드에서 `:PlugInstall`이라고 적으면 위에 명시된 플러그인들을 설치한다.

##### 2.3 패키지의 설명

- `bling/vim-airline`, `vim-airline/vim-airline-themes` : vim을 보기 좋게 꾸며준다.

  ```powershell
  " airline
  let g:airline_right_sep = '⮂'
  let g:airline_left_sep = '⮀'
  "let g:airline_symbols.branch = '⎇'
  "let g:airline_symbols.paste = 'Þ'
  "let g:airline_symbols.spell = 'Ꞩ'
  if !exists('g:airline_symbols')
      let g:airline_symbols = {}
  endif

  let g:airline#extensions#tabline#enabled = 1 " turn on buffer list
  "let g:airline_theme='luna'
  set laststatus=2 " turn on bottom bar(중복)
  "let g:airline#extensions#tabline#left_sep = ' '
  "let g:airline#extensions#tabline#left_alt_sep = '|'
  "let g:airline_left_sep=''
  "let g:airline_right_sep='<'
  let g:airline_detect_crypt=1
  let g:airline#extensions#tabline#fnamemod = ':t'

  "let g:airline_mode_map = {
      "      \ '__' : '-',
      "      \ 'n'  : 'N',
      "      \ 'i'  : 'I',
      "      \ 'R'  : 'R',
      "      \ 'c'  : 'C',
      "      \ 'v'  : 'V',
      "      \ 'V'  : 'V',
      "      \ '^V' : 'V',
      "      \ 's'  : 'S',
      "      \ 'S'  : 'S',
      "      \ '^S' : 'S',
      "      \ }
  ```

  굳이 해줄 필요는 없지만 아이콘 커스터마이징을 위해서 남겨놨다.


- `scrooloose/nerdtree` : vim의 파일 탐색기이다.

  ```powershell
  " nerdTree
  nnoremap <Leader>t :NERDTreeToggle<CR>
  ```

  나는 `Leader`키를 `\`로 설정을 해놔서 `\+t`를 누르면 창이 켜졌다 꺼졋다한다.

- `scrooloose/syntastic` : 문법, 오타를 체크해서 표시해준다.

  ```powershell
  " syntastic
  set statusline+=%#warningmsg#
  set statusline+=%{SyntasticStatuslineFlag()}
  set statusline+=%*
  let g:syntastic_always_populate_loc_list = 1
  let g:syntastic_auto_loc_list = 1
  let g:syntastic_check_on_open = 1
  let g:syntastic_check_on_wq = 0
  ```

- `raimondi/delimitmate` : 괄호 자동완성

- `nathanaelkane/vim-indent-guides` : 인덴트 표시

  ```powershell
  " vim indent guide
  colorscheme default
  let g:indent_guides_auto_colors = 0
  hi IndentGuidesOdd guibg=red ctermbg=3
  hi IndentGuidesEven guibg=green ctermbg=4
  let g:indent_guides_guide_size = 1
  let g:indent_guides_start_level = 1
  let g:indent_guides_space_guides = 1
  let g:indent_guides_tab_guides = 1
  let g:indent_guides_enable_on_vim_startup = 1
  ```

  제작자 추천 세팅이다.

- `scrooloose/nerdcommenter` : 문법에 맞게 주석 처리를 해준다.

  ```powershell
  " nerdcommenter
  let g:NERDSpaceDelims = 2       
  ```

  주석표시가 앞뒤로 생길경우 뒤에 여백을 2칸으로 한다. 주석을 처리하는 여러가지 방식이 있는데 기본적으로는 `Leader + c + Space`를 비쥬얼모드로 선택한 다음 눌러주면 주석이 토글된다.

- `tpope/vim-fugitive`, `airblade/vim-gitgutter` : 각각 git명령어, git에 변동사항 표시를 해준다.

- `pangloss/vim-javascript`, `plasticboy/vim-markdown`, `othree/html5.vim`, `elzr/vim-json`, `mattn/emmet-vim` : 추가 언어를 설치하였다.

- `valloric/youcompleteme` : 자동완성 플러그인. plug로 설치하고 추가 설정을 해줘야한다.

  ```powershell
  " youcompleteme
  let g:ycm_python_binary_path = 'python'
  let g:ycm_min_num_of_chars_for_completion = 1 " 1글자만 입력되어도 완성기능이 나오도록
  let g:ycm_global_ycm_extra_conf = '~/.ycm_extra_conf.py'
  set splitbelow              " detail window 아래로
  ```

  ​

  - 위의 파일로 vim-plug를 사용 했을 경우 youcompleteme는 `~/vim/plugged/youcompleteme`에 설치되어 있는데 저 폴더 내부의 `install.py`로 설치를 추가로 해주어야한다.
  - 설치 할 때 필요한 언어를 설정해서 설치할 수 있으나 귀찮으니 다 설치해준다. `/install.py --all`
  - 혹시나 `pyenv`, `pyenv-virtualenv`를 사용하고 있을 경우 설치중에 에러메세지가 발생 할 수 있는데(특히나 지금 사용하는 터미널의 python이 가상환경이거나 pyenv로 만들었을 경우) 이럴 때에는 pyenv로 system python으로 변경한 다음 진행하면 잘 된다. 그래도 혹시 안되면 pyenv와 pyenv-virtualenv를 삭제하고 다시 `install.py`로 설치를 진행한다.
  - 근데 이 자동완성이 뭔가 좀 불완전하게 작동하는것같아서 세팅을 다시 확인해봐야겠다.



이렇게 완성된 파일은 [이곳](https://github.com/pignuante/pignuante.github.io/blob/master/data/vimrc)에서 확인 할 수 있다!









