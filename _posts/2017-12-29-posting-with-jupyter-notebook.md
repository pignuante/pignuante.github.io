
### jupyter notebook Posting Test

오늘은 jupyter notebook으로 생성된 파일인 `ipynb`로 포스팅하는 것을 정리해볼까한다.
jupyter notebook파일을 바로 올리는 것으로 코드와 실행결과를 정리하기가 더욱 편해지지 않을까 싶다!




##### 1. 예제파일

우선 지금 글을 쓰고 있는 이 파일도 jupyter notebook파일로 실험하고 있다ㅎㅎ
간단한 파이썬 예제코드를 하나 작성해보자.



```python
# 필요 패키지 import
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn
```


```python
y = np.random.randint(1,3,10)
x = np.random.randint(1,3,10)
print(y)
print(x)
print(y*x)
```

    [2 2 1 1 1 2 1 1 2 2]
    [2 1 2 2 1 1 1 2 1 2]
    [4 2 2 2 1 2 1 2 2 4]

