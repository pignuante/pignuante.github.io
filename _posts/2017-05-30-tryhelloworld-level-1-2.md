---
layout: post
title: "tryhelloworld level 1 (2)"
description: ""
date: 2017-05-31
tags: algorithm,python
comments: true
---

#### 11. 삼각형 출력하기

> printTriangle 메소드는 양의 정수 num을 매개변수로 입력받습니다.
> 다음을 참고해 `*`(별)로 높이가 num인 삼각형을 문자열로 리턴하는 printTriangle 메소드를 완성하세요
> printTriangle이 return하는 String은 개행문자('\n')로 끝나야 합니다.

```python
def printTriangle(num):
    return "".join(["*"*i+"\n" for i in range(1,num+1)])
```

- 고전적인 문제이다. 사실은 처음에 단순 2중 반복문으로 돌렸었으나, 리스트 컴프리헨션을 이용하여 정리하였다.
  <br><br>



#### 12. 문자열 다루기 기본

> alpha_string46함수는 문자열 s를 매개변수로 입력받습니다.
> s의 길이가 4혹은 6이고, 숫자로만 구성되있는지 확인해주는 함수를 완성하세요.
> 예를들어 s가 "a234"이면 False를 리턴하고 "1234"라면 True를 리턴하면 됩니다

```python
def alpha_string46(s):
    try:
        if (len(s) == 4 or len(s) == 6) and int(s):
            return True
    except:
        pass
    return False
```

- 최초의 방식. 의식의 흐름대로 진행을 한 결과이다. 아무래도 단순히 반복문을 돌리는 것보다는 괜찮지 않을까 싶어서 `try`문을 사용했지만 썩 맘에 들지는 않는다.

  ```python
  def alpha_string46(s):
      return s.isdigit() and len(s) in [4,6]
  ```

- 라는 방식으로 깔끔히 한줄로 끝낼 수 있었다.
  <br><br>

#### 13. 문자열 내 p와 y의 개수

> numPY함수는 대문자와 소문자가 섞여있는 문자열 s를 매개변수로 입력받습니다.
> s에 'p'의 개수와 'y'의 개수를 비교해 같으면 True, 다르면 False를 리턴하도록 함수를 완성하세요. 'p', 'y' 모두 하나도 없는 경우는 항상 True를 리턴합니다.
> 예를들어 s가 "pPoooyY"면 True를 리턴하고 "Pyy"라면 False를 리턴합니다.

```python
def numPY(s):
    s = s.lower()
    return True if s.count("p") == s.count("y") else False
```

- 역시나 파이썬의 강력함을 알 수 있는 문제이다. 
- 전부 소문자*(혹은 대문자)*로 바꿔준 다음, 개수만 count해주고 비교하면 끝.
  <br><br>

#### 14. 문자열 내 마음대로 정렬하기

> strange_sort함수는 strings와 n이라는 매개변수를 받아들입니다.
> strings는 문자열로 구성된 리스트인데, 각 문자열을 인덱스 n인 글자를 기준으로 정렬하면 됩니다.
>
> 예를들어 strings가 ["sun", "bed", "car"]이고 n이 1이면 각 단어의 인덱스 1인 문자 u, e ,a를 기준으로 정렬해야 하므로 결과는 ["car", "bed", "sun"]이 됩니다.
> strange_sort함수를 완성해 보세요.

```python
def strange_sort(strings, n):
    return sorted(strings,key=lambda x:x[n])
```

- 파이썬의 내장함수인 `sorted()`를 활용하면 아주 쉬운 문제지만 그것을 활용하지 않을 시에는 꽤나 귀찮은 문제로 탈바꿈된다.

- `sorted()`에 key를 인자로 주면 key로 들어간 *함수*의 처리 결과로 나온 것들을 순차적으로 정렬시킨다.<br><br>

  ​

#### 15. 딕셔너리 정렬

> 딕셔너리는 들어있는 값에 순서가 없지만, 키를 기준으로 정렬하고 싶습니다. 그래서 키와 값을 튜플로 구성하고, 이를 순서대로 리스트에 넣으려고 합니다.
> 예를들어 {"김철수":78, "이하나":97, "정진원":88}이 있다면 각각의 키와 값을
>
> - ("김철수", 78)
> - ("이하나", 97)
> - ("정진원", 88)
>
> 과 같이 튜플로 분리하고 키를 기준으로 정렬해서 다음과 같은 리스트를 만들면 됩니다.
> [ ("김철수", 78), ("이하나", 97), ("정진원", 88) ]
>
> 다음 sort_dictionary 함수를 완성해 보세요

```python
def sort_dictionary(dic):
    return sorted(list(dic.items()), key=lambda x: x[0])
```

- 위의 13번 문제랑 크게 다르지 않다.
- dict의 `key`, `value`를 뽑아주는 함수인 `items()`이용하여 리스트를 만든 다음, 정렬을 해주면 된다.<br><br>

#### 16. 같은 숫자는 싫어

>no_continuous함수는 스트링 s를 매개변수로 입력받습니다.
>
>s의 글자들의 순서를 유지하면서, 글자들 중 연속적으로 나타나는 아이템은 제거된 배열(파이썬은 list)을 리턴하도록 함수를 완성하세요.
>예를들어 다음과 같이 동작하면 됩니다.
>
>- s가 '133303'이라면 ['1', '3', '0', '3']를 리턴
>- s가 '47330'이라면 [4, 7, 3, 0]을 리턴

```python
def no_continuous(s):
    r = []
    if len(s):
        r = [s[0]]
        for x in s:
            if r[-1] != x:
                r.append(x)
    return r
```

- 아무 생각없이 `set`을 이용했었는데, 이 문제의 경우는 모든 중복을 제거하는 것이 아닌 연속적인 숫자만 제거하는 것이라 오답이 되었다.
- 이럴 경우엔 그냥 전체를 한번 훑어주는 수 밖에 없을 것 같아서 `for`문을 이용해서 전체를 탐색하였다.<br><br>