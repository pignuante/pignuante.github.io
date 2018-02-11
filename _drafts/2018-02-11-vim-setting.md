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



### 요약

2018.02 기준으로 설정해둔 것은 아래와 같다.

1. vim에서 파일트리창 보기.
2. 자동완성
3. vim 테마
4. 문법체크
5. git 호환성
6. 주석처리
7. indent 표시
8. 몇몇 문법추가(markdown, emmet, javascript, html, json)

```powershell
colorscheme default
set paste           " 계단현상 막아줌
set nocompatible    " 이것저것 편해진다
set number 		    " Line Number
set ruler 	        " cursor place
set cursorline 	    " cursor line

set smartindent
set cindent
set autoindent

set shiftwidth=4    " 들여쓰기 4칸
set tabstop=4	    " tab size
set expandtab       " tab을 \t이 아닌 space로
set hlsearch        " search highlight
set encoding=utf8	
set fileencoding=utf-8 " 파일 인코딩 우선순위들
set fileencodings=utf-8,cp949,euc-kr,korea,japan
set tenc=utf-8      " 터미널 인코딩
set history=200		" 히스토리는 200개까지
set showcmd         " (부분적인)명령어를 상태라인에 보여줌 
set showmatch		" 괄호 매칭 보여주기
set wmnu            " 매치되는 괄호의 반대쪽을 보여줌 
set nowrapscan      " 검색시 마지막에서 처음으로 ㄴㄴ
set incsearch       " 수동검색
set title           " 타이틀바에 현재 편집중인 파일을 표시 
set cursorline      " 편집 위치에 커서 라인 설정
set laststatus=2    " 상태바 표시를 항상한다
set visualbell		" 시끄러운 '땡'소리 대신에 화면 깜빡으로
"set updatetime=250
"set backspace=indent,eol,start   

" filetype indent on   " 파일 종류에 따른 구문강조
filetype plugin indent on 
highlight Comment term=bold cterm=bold ctermfg=4 " 코멘트 하이라이트
set t_Co=256 " 색 설정

" cntl + s = save
" nmap <C-S> :w<CR>
" imap <C-S> <ESC>:w<CR>

" Syntax Highlighting
if has("syntax")
    syntax enable
endif


" plug
if empty(glob('~/.vim/autoload/plug.vim'))
    silent !curl -fLo ~/.vim/autoload/plug.vim --create-dirs
    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
    autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif

call plug#begin()
    Plug 'tpope/vim-fugitive'		" git
    Plug 'scrooloose/nerdtree'		" see tree
    Plug 'scrooloose/syntastic'		" 문법체크
    Plug 'bling/vim-airline'		" vim 이쁘게!
    Plug 'vim-airline/vim-airline-themes'
    Plug 'airblade/vim-gitgutter'	" git check
    Plug 'nathanaelkane/vim-indent-guides'	" indent 
    Plug 'raimondi/delimitmate'
    Plug 'valloric/youcompleteme'   " 자동완성
    Plug 'scrooloose/nerdcommenter' " leader cc (leader == \), c space, cm
    Plug 'pangloss/vim-javascript'  " java script
    Plug 'plasticboy/vim-markdown'  " markdown
    Plug 'othree/html5.vim'         " html
    Plug 'elzr/vim-json'            " json
    Plug 'mattn/emmet-vim'          " emmet
call plug#end()






"""""""""""""""""""""""""""""""""""""""""" 
" emmet
autocmd FileType html,css EmmetInstall
let g:user_emmet_install_global = 0
" let g:user_emmet_leader_key='<C-Y>' " emmet short cut (ctrl y , )
let g:user_emmet_expandabbr_key='<Tab>'
imap <expr> <tab> emmet#expandAbbrIntelligent("\<tab>") 
" emmet-vim의 단축키 tab


""""""""""""""""""""""""""""""""""""""""""
" vim-json
augroup json_autocmd
  autocmd!
  autocmd FileType json set autoindent
  autocmd FileType json set formatoptions=tcq2l
  autocmd FileType json set textwidth=78 shiftwidth=2
  autocmd FileType json set softtabstop=2 tabstop=8
  autocmd FileType json set expandtab
  autocmd FileType json set foldmethod=syntax
augroup END


""""""""""""""""""""""""""""""""""""""""""
" nerdcommenter
let g:NERDSpaceDelims = 2       " comment 뒤에 2칸


" nerdTree
" \ + n으로 실행
nnoremap <Leader>n :NERDTreeToggle<CR>


""""""""""""""""""""""""""""""""""""""""""
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


""""""""""""""""""""""""""""""""""""""""""
" vim indent guide
let g:indent_guides_auto_colors = 0
hi IndentGuidesOdd guibg=red     ctermbg=215
hi IndentGuidesEven guibg=green  ctermbg=202
let g:indent_guides_guide_size = 1
let g:indent_guides_start_level = 1
let g:indent_guides_space_guides = 1
let g:indent_guides_tab_guides = 1
let g:indent_guides_enable_on_vim_startup = 1


""""""""""""""""""""""""""""""""""""""""""
" syntastic
set statusline+=%#warningmsg#
set statusline+=%{SyntasticStatuslineFlag()}
set statusline+=%*
let g:syntastic_always_populate_loc_list = 1
let g:syntastic_auto_loc_list = 1
let g:syntastic_check_on_open = 1
let g:syntastic_check_on_wq = 0



""""""""""""""""""""""""""""""""""""""""""
" completion_command
" let g:jedi#completions_command = "<C-N>" " ctrl N


""""""""""""""""""""""""""""""""""""""""""
" youcompleteme
let g:ycm_python_binary_path = 'python'
let g:ycm_min_num_of_chars_for_completion = 1
let g:ycm_global_ycm_extra_conf = '~/.ycm_extra_conf.py'
set splitbelow              " detail window 아래로



```

### 플러그인 간단한 설명

##### 1. 패키지관리자

보통 설명들 보면 `vundle`을 이용한 설치가 많이 나오는데 찾다보니 한국인이 만든 vim 패키지 관리자인 [vim-plug](https://github.com/junegunn/vim-plug)라는 것이 있어서 그걸로 설치하였다.

```powershell
if empty(glob('~/.vim/autoload/plug.vim'))
    silent !curl -fLo ~/.vim/autoload/plug.vim --create-dirs
    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
    autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif
```

위의 문장을 자신의 `.vimrc`파일에 위의 문장을 추가해준다. `.vimrc`파일의 위치를 혹시라도 잘 모르겠다! 싶으면 vim에서 `:edit $MYVIMRC`명령어를 입력한다. 그러면 `vim-plug`가 설치가 된다.

`vim-plug`로 설치를 하기위해선 

```powershell
call plug#begin()
    Plug 'tpope/vim-fugitive'		" git
    Plug 'scrooloose/nerdtree'		" see tree
    Plug 'scrooloose/syntastic'		" 문법체크
    Plug 'bling/vim-airline'		" vim 이쁘게!
    Plug 'vim-airline/vim-airline-themes'
    Plug 'airblade/vim-gitgutter'	" git check
    Plug 'nathanaelkane/vim-indent-guides'	" indent 
    Plug 'raimondi/delimitmate'		" 괄호 매칭
    Plug 'valloric/youcompleteme'   " 자동완성
    Plug 'scrooloose/nerdcommenter' " leader cc (leader == \), c space, cm
    Plug 'pangloss/vim-javascript'  " java script
    Plug 'plasticboy/vim-markdown'  " markdown
    Plug 'othree/html5.vim'         " html
    Plug 'elzr/vim-json'            " json
    Plug 'mattn/emmet-vim'          " emmet
call plug#end()
```

라고 입력한다. `Plug`라고 적힌 것이 설치할 플러그인들이다.













