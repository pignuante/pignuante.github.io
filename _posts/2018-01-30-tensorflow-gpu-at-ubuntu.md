---
layout: post
title: "Tensorflow gpu at ubuntu, updated at 2018.06"
description: "ubuntu에 Tensorflow gpu 설치하기!"
date: 2018-01-30
tags: [python, tensorflow, cuda, cudnn, gpu, ubuntu, linux]
comments: true
author-id: pignu
toc: true
---

* TOC
{:toc}
## 0. 들어가며

**Tensorflow GPU**를 사용하기위해서는 python뿐만 아니라 GPU를 통한 병렬처리를 위한 [CUDA](https://ko.wikipedia.org/wiki/CUDA)와 deep neural network를 위한 [cuDNN](https://developer.nvidia.com/cudnn)(Cuda Deep Neural Network)를 설치해야한다.

여기서 우리는 **<u>CUDA 9.0</u>**과 **<u>cuDNN 7.1</u>**을 사용 할 것이다.(별이 다섯개!)

처음에 아무것도 모르고 설치 할 때에는 무려 2박3일(...)이 걸렸었어서 설치방법을 정리, 메모겸해서 적어둔다. 젤 중요한것은 <u>호환 버젼</u>을 잘 확인하자!!!!!



> 여담으로 
>
> ~~2018년 1월 기준 tensorflow 1.5버젼은 cuda 9.0과 cuDNN 7.0.x버젼을 지원한다!~~
>
> 2018년 6월 기준 tensorflow **1.8**, cud **9.0** cuDNN **7.1.x** 버전을 설치하였다!



[CUDA](http://docs.nvidia.com/cuda/cuda-installation-guide-linux/#axzz4VZnqTJ2A), [cuDNN](https://developer.nvidia.com/cudnn), [Tensorflow 공식홈페이지](https://www.tensorflow.org/install/install_linux)

## 1. pyenv, virtualenv, python 설치

#### 1.1 우분투 update && upgrade

설치에 앞서서 우분투를 ==**update && upgrade**==해준다.

```powershell
> sudo apt-get update && sudo apt-get dist-upgrade
```



#### 1.2 패키지 미리 설치

설치에 필요한 패키지들을 미리 설치해준다.

```shell
> sudo apt-get install -y vim terminator git make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev sl libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils tk-dev gcc g++
```



#### 1.3 pyenv, virtualenv 설치

**pyenv**와 **virtualenv**를 설치한다. [링크](https://github.com/pyenv/pyenv#basic-github-checkout)

```powershell
> curl -L https://raw.githubusercontent.com/yyuu/pyenv-installer/master/bin/pyenv-installer | sh
```

pyenv를 설치 한 후 자신이 사용하는 셸의 설정파일(e.g. **.bash_profile**)에 pyenv 설정을 추가한다. (아래의 명령어는 터미널창에 입력한다.)

```powershell
> echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bash_profile
> echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bash_profile
> echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.bash_profile
> echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bash_profile

> source ~/.bash_profile
```



#### 1.4 파이썬 설치

자신이 사용 할 파이썬의 버젼을 설치한다. 
~~**2018년 1월 기준** tensorflow는 3.5.x버전의 파이썬을 지원하고 있으므로 3.5.x중 가장 최신인 3.5.4를 설치한다.~~

**2018년 6월 기준** Tensorflow는 파이썬 **3.4+**을 지원한다. 원하는 버젼을 설치하자. [참고](https://www.tensorflow.org/install/install_linux#prerequisite_python_and_pip)

```powershell
> pyenv install --list		# 설치가능한 python버전 확인
> pyenv install 3.6.5         # 3.6.5를 설치, 생각보다 오래걸린다.
> pyenv global 3.6.5          # 기본 파이썬 버젼 설정
```
이 때 원하면 가상환경을 생성하여도 무방하다.

```powershell
> pyenv virtualenv "원하는버전" "가상환경이름"
> pyenv global "가상환경이름"
```



#### 1.5 파이썬에 기타 필요한 파일 설치

```powershell
> pip3 install --upgrade numpy pandas matplotlib seaborn scipy scikit-learn jupyterlab # 오래걸린다.
```

기타 필요한 파일을 설치한다.

----------------



## 2. Nvidia driver 설치

> **주의**
>
> 여기서 부터는 자신이 사용하는 그래픽카드의 버전이나 지금 사용하려는 Tensorflow의 버전, Cuda와 cuDNN의 버전 그리고 tensorflow와의 ***호환성을 잘 확인***하고 사용해야한다!!!!!
>
> **주의**



#### 2.0 Graphic Card 확인

Cuda가 사용가능한 그래픽카드를 가지고 있는지 확인한다.

```powershell
> lspci | grep -i nvidia
```

위의 명령어를 입력했을 때

```powershell
09:00.0 VGA compatible controller: NVIDIA Corporation Device 1b80 (rev a1)
09:00.1 Audio device: NVIDIA Corporation Device 10f0 (rev a1)
```

등의 메세지가 나오면 설치 가능하다! 명령어 입력이 귀찮으면 [여기](https://developer.nvidia.com/cuda-gpus)에서 가지고 있는 그래픽카드를 찾아보자.

#### 2.1 우선 관련 설정을 한다.

[참고](https://www.makeuseof.com/tag/ubuntu-ppa-technology-explained/)

```powershell
> sudo apt-get install software-properties-common
> sudo add-apt-repository ppa:graphics-drivers/ppa

> sudo apt-get update && sudo apt-get dist-upgrade
```

그 후 자신이 사용하는 그래픽 드라이버에 맞는 버전을 [사이트](https://www.geforce.com/drivers)에서 찾아서 다운 받는다.

![nvidia](http://pignuante.github.io/assets/images/tensorflow_gpu_settings/tensorflow.png)

동그라미 친 숫자를 기억 한 다음 아래의 명령어로 설치한다.
드라이버 버젼은 눈치껏(...) 정하자.

```powershell
> sudo apt-get install nvidia-397 	# 위의 숫자를 입력
> sudo reboot now 					# 이 시점에서 한번쯤 재시작을..
```



#### 2.2 설치의 확인

터미널창에 명령어로 확인한다.

```powershell
> cat /proc/driver/nvidia/version
> nvidia-smi        
> nvidia-settings  
```



#### 2.3 (덤)설치한 Nvidia 드라이버의 삭제

```powershell
> dpkg --get-selections | grep nvidia
```

위의 명령어를 입력하면 설치된 드라이버의 리스트가 뜨는데 **sudo apt-get purge 버전명**을 입력해서 수동으로 삭제하는 방법과

```powershell
> sudo apt-get purge nvidia-*
```

위의 명령어로 모두 삭제하는 방법이 있다.

-----------



## 3. Cuda 설치

#### 3.0 Cuda 사용 가능 여부 확인

##### 3.0.1 Cuda 사용 가능 Linux version 확인

```powershell
> uname -m && cat /etc/*release
```

사용가능한 버젼의 리눅스는 [여기](https://docs.nvidia.com/cuda/cuda-toolkit-release-notes/index.html)에서 확인하자. 아니면 cuda 다운 받는 곳에서 cuda 버전과 linux 버전을 확인하자.

##### 3.0.2 Cuda 호환 gcc 확인

```powershell
> gcc --version
```

대부분은 사용가능했는데 최근에 나온 **18.04**에서 cuda 9.0을 설치할때 GCC관련 에러가 있었다. 이때 GCC버젼을 낮춰주자.

##### 3.0.3 Kernel header & development Packages

혹시나 설치하다 헤더관련 에러가 나면 아래의 명령어를 입력해보자.

```powershell
# ubuntu
> sudo apt-get install linux-headers-$(uname -r)
# RHEL/CentOS
> sudo yum install kernel-devel-$(uname -r) kernel-headers-$(uname -r)
# Fedora
> sudo dnf install kernel-devel-$(uname -r) kernel-headers-$(uname -r)
```



#### 3.1 Cuda 설치

위에서 언급한데로 우리는 cuda 9.0을 설치 할 것이다. [홈페이지](https://developer.nvidia.com/cuda-downloads)에서 자신의 버젼에 맞는 cuda를 고른 다음 ==**runfile[local]**==을 다운 받는다. (물론 다른것도 가능하지만 이 파일이 설정이 제일 편하다.)
다운받은 위치로 이동하여 위의 명령어로 다운받은 파일을 실행 후 프롬포트에 명령어를 입력한다.

```powershell
> sudo sh 다운받은CUDA파일
```

> **accept/decline/quit:**
> accept
>
> **Install NVIDIA Accelerated Graphics Driver for Linux\~\~.?**
> **(y)es/(n)o/(q)uit:** n     # 우리는 수동으로 드라이버를 설치하였다.
>
> **Install the CUDA 9.0 Toolkit?**
> **(y)es/(n)o/(q)uit:** y
>
> **Enter Toolkit Location [ default is /usr/local/cuda-9.0 ]:**
> enter키(default)
>
> **Do you want to install a symbolic link at /usr/local/cuda?(y)es/(n)o/(q)uit:** y
>
> **Install the CUDA 9.0 Samples?**
> **(y)es/(n)o/(q)uit:** y
>
> **Enter CUDA Samples Location [ default is /home/사용자 이름 ]:**
> enter키(default)

#### 3.2 Cuda 설치 확인

설치 종료 후에 나오는 summary에 아래와 같이 뜨면 성공이다.

```powershell
Driver: Not Selected
Toolkit: Installed in /usr/local/cuda-9.0
Samples: Installed in /home/사용자 이름
```

#### 3.3 Cuda 환경변수 설정

자신의 셸 설정파일에 넣어준다.

```shell
> vim ~/.bash_profile

# cuda setting
> export PATH=/usr/local/cuda-9.0/bin${PATH:+:${PATH}}  # 설치위치 확인하자
> export LD_LIBRARY_PATH=/usr/local/cuda-9.0/lib64\${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
> export CUDA_HOME=/usr/local/cuda
# symbolic link를.. 껄껄

source ~/.bash_profile
nvcc --version
```

마지막 문장을 입력하였을때 결과로

```powershell
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2017 NVIDIA Corporation
Built on Sun_Sep__4_23:04:13_CDT_2017
Cuda compilation tools, release 8.0, V8.0.44
```

이라고 뜨면 성공이다.

그리고 추가로 공식문서에서 필요로 한다니 설치해주자.

```powershell
> sudo apt-get install libcupti-dev
```



#### 3.4. (덤)Cuda 삭제

```powershell
> sudo apt-get remove --auto-remove nvidia-cuda-toolkit # 적진 않았지만 ppa설정했을 경우..
```

혹은 cuda가 설치된 path로 이동하여 수동으로 지워준다.

```powershell
> cd /usr/local
> sudo rm -fr cuda*
```



---------



## 4. cuDNN 설치

#### 4.1 cuDNN 다운로드

![cuDNN](http://pignuante.github.io/assets/images/tensorflow_gpu_settings/cuDNN.png)

[사이트](https://developer.nvidia.com/rdp/cudnn-archive)로 이동하여 로그인(+가입)을 한 다음 자신이 사용하려는 버젼을 다운 받는다(위에서도 언급한 것처럼 우리는 cuda 9.0에 cuDNN 7.1.x을 다운받는다.) **최신버전**으로 <u>받고 싶다면</u> tensorflow의 홈페이지에서 **<u>지원 여부</u>**를 확인하자.



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
> sudo cp /usr/local/cuda/lib64/libcudnn* /usr/lib/x86_64-linux-gnu
```





-------

## 5. Tensorflow-gpu 설치

#### 5.1 Tensorflow-gpu 설치

위의 장황했던 작업에 비해서 tensorflow gpu설치는 매우 간단하다.

```powershell
> pip install --upgrade tensorflow-gpu
```



#### 5.2 확인

```python
import tensorflow as tf

with tf.Session() as sess:
    matrix1 = tf.constant([[3., 3.], [4., 4.]])
    matrix2 = tf.constant([[2., 3.],[2., 4.]])

    product = tf.matmul(matrix1, matrix2)

    result = sess.run(product)
    print(result)

# result is
# [[ 12.  21.]
#  [ 16.  28.]]
```













-----------

## 6. (덤)zsh 설치

##### 6.1.0 vim을 기본에디터로

자신의 기본환경설정파일에서 

```powershell
export EDITOR=/usr/bin/vim
```

라는 문장을 추가한다.

##### 6.1.1 zsh 설치

덤으로 zsh을 혹시나 설치하지 않았으면 설치한다.

```powershell
> sudo apt-get install zsh
> curl -L https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh | sh
```

##### 6.1.2. chsh: PAM: Authentication failure 에러

혹시나 **chsh: PAM: Authentication failure**라는 에러가 날 경우에는 

```powershell
> sudo vim /etc/pam.d/chsh
```

위의 파일에서 **auth required pam_shells.so**을  **auth sufficient pam_shells.so**로 변경한다.

##### 6.1.3 [fast-syntax-highlighting](https://github.com/zdharma/fast-syntax-highlighting#installation)

```powershell
git clone https://github.com/zdharma/fast-syntax-highlighting.git \
  ~/.oh-my-zsh/custom/plugins/fast-syntax-highlighting
```

- 원래는 zsh-syntax-highlighting을 사용했지만 fast-syntax-highlighting이 조금 더 이쁘게 해줘서 이걸로 바꾸었다.
- 위의 git을 clone받은 다음 **.zshrc**에서 **plugins**에 <u>fast-syntax-highlighting</u>를 추가한다!



~~zsh-syntax-highlighting~~

```powershell
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

~~zsh의 문법 하이라이팅을 지원하는 패키지이다. 위의 명령어로 설치를 한 다음 **.zshrc**로 이동하여 **plugins**에 **zsh-syntax-highlighting**를 추가한다.~~



##### 6.1.4 zsh-autosuggestions

```powershell
git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions
```

역시 **zsh-syntax-highlighting**과 마찬가지로 **.zshrc**의 **plugin**에 **zsh-autosuggestions**을 추가한다.

##### 6.1.5 폰트

폰트가 깨지는 경우에는 [여기](https://github.com/powerline/fonts)에서 다운받는다.

```powershell
> cd ~
> git clone https://github.com/powerline/fonts.git --depth=1
> cd ~/fonts/install.sh
> rm -rf fonts
```

덤으로 내가 코딩용으로 자주 사용하는 **naver D2coding**도 설치해보자. 저장소는 [여기](https://github.com/naver/d2codingfont)이다. (영어도 영어지만 한국어 구분도 잘 되어서 애용한다.)

```powershell
> wget https://github.com/naver/d2codingfont/releases/download/VER1.3.2/D2Coding-Ver1.3.2-20180524.zip
> sudo mkdir /usr/share/fonts/truetype/D2Coding
> sudo unzip D2Coding-Ver1.3.2-20180524.zip -d /usr/share/fonts/truetype/D2Coding
> rm -rf /usr/share/fonts/truetype/D2Coding/__MACOSX
> fc-cache -f -v
```

최근 D2Coding이 1.3으로 버젼업이 되면서 파워라인폰트도 지원이 된당! 설치를 했는데도 폰트가 깨지면 터미널을 재시작해보자!

