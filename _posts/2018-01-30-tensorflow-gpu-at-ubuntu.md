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

여기서 우리는 <u>**CUDA 8.0**</u>과 <u>**cuDNN 6.0**</u>을 사용 할 것이다.(별이 다섯개!)

처음에 아무것도 모르고 설치 할 때에는 무려 2박3일(...)이 걸렸었어서 설치방법을 정리, 메모겸해서 적어둔다.



## 1. pyenv, virtualenv, python 설치

#### 1.1 우분투 update &7 upgrade

설치에 앞서서 우분투를 `update && upgrade`해준다.

```powershell
> sudo apt-get update && sudo apt-get dist-upgrade
```



#### 1.2 패키지 미리 설치

설치에 필요한 패키지들을 미리 설치해준다.

```shell
> sudo apt-get install -y vim terminator git make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils tk-dev 
```

​

#### 1.3 (덤)zsh 설치

덤으로 zsh을 혹시나 설치하지 않았으면 설치한다.

```powershell
> sudo apt-get install zsh 
> curl -L https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh | sh
```

**기타 theme변경이나 font설정추가, zsh-autosuggestions, zsh-syntax-highlighting**

​

#### 1.4 pyenv, virtualenv 설치

이제야(…) pyenv와 virtualenv를 설치한다. [링크](https://github.com/pyenv/pyenv#basic-github-checkout)

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

#### 1.5 파이썬 설치

자신이 사용 할 파이썬의 버젼을 설치한다. **2018년 1월 기준** tensorflow는 3.5.x버전의 파이썬을 지원하고 있으므로 3.5.x중 가장 최신인 3.5.4를 설치한다.

```powershell
> pyenv install --list		# 설치가능한 python버전 확인
> pyenv install 3.5.4
> pyenv global 3.5.4
```
이 때 원하면 가상환경을 생성하여도 무방하다.

```powershell
> pyenv virtualenv "원하는버전" "가상환경이름"
```



#### 1.6 파이썬에 기타 필요한 파일 설치

```powershell
> pip3 install --upgrade numpy pandas matplotlib seaborn scipy scikit-learn 
```

기타 필요한 파일을 설치한다.

----------------



## 2. Nvidia driver 설치

> **주의**
>
> 여기서 부터는 자신이 사용하는 그래픽카드의 버전이나 지금 사용하려는 Tensorflow의 버전, Cuda와 cuDNN의 버전의 ***호환성을 잘 확인***하고 사용해야한다!!!!!
>
> **주의**



#### 2.1 우선 관련 설정을 한다. [참고](https://www.makeuseof.com/tag/ubuntu-ppa-technology-explained/)

```powershell
> sudo apt-get install software-properties-common
> sudo add-apt-repository ppa:graphics-drivers/ppa
> sudo apt-get update && sudo apt-get dist-upgrade
```

그 후 자신이 사용하는 그래픽 드라이버에 맞는 버전을 [사이트](https://www.geforce.com/drivers)에서 찾아서 다운 받는다.

![gpu_search_](http://pignuante.github.io/images/tensorflow01.png)

위의 이미지 처럼 찾은 다음 

![gpu_version_](http://pignuante.github.io/images/tensorflow02.png)

동그라미 친 숫자를 기억 한 다음 아래의 명령어로 설치한다.

```powershell
> sudo apt-get install nvidia-384 	# 위의 숫자를 입력
> sudo reboot now 					# 이 시점에서 한번쯤 재시작을..
```



#### 2.2 설치의 확인

- 터미널창에 명령어로 확인한다.

  ```powershell
  > cat /proc/driver/nvidia/version
  > nvidia-smi
  > nvidia-settings
  ```



#### 2.3 설치한 Nvidia 드라이버의 삭제

```powershell
> dpkg --get-selections | grep nvidia
```

위의 명령어를 입력하면 설치된 드라이버의 리스트가 뜨는데 `sudo apt-get remove 버전명`일 입력해서 수동으로 삭제하는 방법과

```powershell
> sudo apt-get purge nvidia-*
```

위의 명령어로 모두 삭제하는 방법이 있다.

-----------



## 3. Cuda 설치

위에서 언급한데로 우리는 cuda 8.0을 설치 할 것이다. [홈페이지](https://developer.nvidia.com/cuda-downloads)에서 자신의 버젼에 맞는 cuda를 고른 다음 `runfile[local]`을 다운 받는다. (물론 다른것도 가능하지만 이 파일이 설정이 제일 편하다.)

#### 3.1 Cuda8.0 설치

다운받은 위치로 이동하여 위의 명령어로 다운받은 파일을 실행 후 프롬포트에 명령어를 입력한다.

```shell
> sudo sh 다운받은CUDA파일
```

> **accept/decline/quit:** 
> accept
>
> **Install NVIDIA Accelerated Graphics Driver for Linux\~\~.?**
> **(y)es/(n)o/(q)uit:** n
>
> **Install the CUDA 8.0 Toolkit?** 
> **(y)es/(n)o/(q)uit:** y
>
> **Enter Toolkit Location [ default is /usr/local/cuda-8.0 ]:**
> enter키(default)
>
> **Do you want to install a symbolic link at /usr/local/cuda?(y)es/(n)o/(q)uit: y**
> **Install the CUDA 8.0 Samples?(y)es/(n)o/(q)uit:** y
>
> **Enter CUDA Samples Location [ default is /home/사용자 이름 ]:**
> enter키(default)

#### 3.2 Cuda8.0 설치 확인

설치 종료 후에 나오는 summary에 아래와 같이 뜨면 성공이다.

```powershell
Driver: Not Selected
Toolkit: Installed in /usr/local/cuda-8.0
Samples: Installed in /home/사용자 이름
```

#### 3.3 Cuda8.0 환경변수 설정

자신의 셸 설정파일에 넣어준다.

```shell
> vim ~/.zshenv

# cuda setting
export PATH=/usr/local/cuda-8.0/bin${PATH:+:${PATH}}
export LD_LIBRARY_PATH=/usr/local/cuda-8.0/lib64\${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
export CUDA_HOME=/usr/local/cuda

> source ~/.zshenv
> nvcc --version
```

마지막 문장을 입력하였을때 결과로 

```powershell
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2017 NVIDIA Corporation
Built on Sun_Sep__4_23:04:13_CDT_2017
Cuda compilation tools, release 8.0, V8.0.44
```

이라고 뜨면 성공이다.



#### 3.4. Cuda 삭제

```powershell
> sudo apt-get remove --auto-remove nvidia-cuda-toolkit
```



---------



## 4. cuDNN 설치

#### 4.1 cuDNN 다운로드

![cuDNN](http://pignuante.github.io/images/tensorflow03.png)

[사이트](https://developer.nvidia.com/rdp/cudnn-download)로 이동하여 로그인(+가입)을 한 다음 자신이 사용하려는 버젼을 다운 받는다(위에서도 언급한 것처럼 우리는 cuda 8.0에 cuDNN 6.0을 다운받는다.) **최신버전**으로 <u>받고 싶다면</u> tensorflow의 홈페이지에서 **<u>지원 여부</u>**를 확인하자.



#### 4.2 cuDNN 설정

```powershell
> cd <다운받은곳>
> sudo tar -xvzf <다운받은 파일명>

> cd cuda
> sudo cp include/cudnn.h /usr/local/cuda/include
> sudo cp lib64/libcudnn* /usr/local/cuda/lib64

> sudo chmod a+r /usr/local/cuda/include/cudnn.h 
> sudo chmod a+r /usr/local/cuda/lib64/libcudnn*

```



#### 4.3 cuDNN 설치 확인

```powershell
> cat /usr/local/cuda/include/cudnn.h | grep CUDNN_MAJOR -A 2
```

출력화면에 **CUDNN_MAJOR**이 포함되어 있기를 빈다!



#### 4.4 (번외) tensorflow for R을 사용하기 위한 준비

cuDNN 라이브러리 파일을 R에서도 사용하기 위해 설정하는 김에 미리 설정한다.

```powershell
> sudo cp cuda/lib64/libcudnn* /usr/lib/x86_64-linux-gnu
```





-------

## 5. Tensorflow-gpu 설치

위의 장황했던 작업에 비해서 tensorflow gpu설치는 매우 간단하다.

```powershell
> pip install --upgrade tensorflow-gpu
```

























