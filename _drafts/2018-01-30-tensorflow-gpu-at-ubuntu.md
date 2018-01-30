---
layout: post
title: "Tensorflow gpu at ubuntu"
description: ""
date: 2018-01-30
tags: python,tensorflow,cuda,cudnn,gpu,ubuntu,linux
comments: true
---



## 0. 들어가며

**Tensorflow GPU**를 사용하기위해서는 python뿐만 아니라 GPU를 통한 병렬처리를 위한 [CUDA](https://ko.wikipedia.org/wiki/CUDA)와 deep neural network를 위한 [cuDNN](https://developer.nvidia.com/cudnn)(Cuda Deep Neural Network)를 설치해야한다.

처음에 아무것도 모르고 설치 할 때에는 무려 2박3일(...)이 걸렸었어서 설치방법을 정리, 메모겸해서 적어둔다.



## 1. pyenv, virtualenv, python 설치

1. 설치에 앞서서 우분투를 `update && upgrade`해준다.

   ```powershell
   > sudo apt-get update && sudo apt-get dist-upgrade
   ```

   ​

2. 설치에 필요한 패키지들을 미리 설치해준다.

   ```powershell
   > sudo apt-get install -y vim terminator git make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils tk-dev 
   ```

   ​

3. 덤으로 zsh을 혹시나 설치하지 않았으면 설치한다.

   ```powershell
   > sudo apt-get install zsh 
   > curl -L https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh | sh
   ```

   **기타 theme변경이나 font설정추가, zsh-autosuggestions, zsh-syntax-highlighting**

   ​

4. 이제야(…) pyenv와 virtualenv를 설치한다. [링크](https://github.com/pyenv/pyenv#basic-github-checkout) 

   ```powershell
   > curl -L https://raw.githubusercontent.com/yyuu/pyenv-installer/master/bin/pyenv-installer | sh
   ```

   pyenv를 설치 한 후 자신이 사용하는 셸의 설정파일(e.g. .zshenv, .bash_profile)에 pyenv 설정을 추가한다. (아래의 명령어는 터미널창에 입력한다.)

   ```powershell
   > echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshenv
   > echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshenv
   > echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.zshenv
   > source ~/.zshenv
   ```

   ​

5. 자신이 사용 할 파이썬의 버젼을 설치한다. **2018년 1월 기준** tensorflow는 3.5.x버전의 파이썬을 지원하고 있으므로 3.5.x중 가장 최신인 3.5.4를 설치한다.

   ```powershell
   > pyenv install --list		# 설치가능한 python버전 확인
   > pyenv install 3.5.4		
   ```



## 2. Nvidia driver 설치

> 여기서 부터는 자신이 사용하는 그래픽카드의 버전이나 지금 사용하려는 Tensorflow의 버전, Cuda와 cuDNN의 버전의 호환성을 잘 확인하고 사용해야한다!!!!!



## 3. Cuda 설치

## 4. cuDNN 설치

## 5. Tensorflow-gpu 설치





