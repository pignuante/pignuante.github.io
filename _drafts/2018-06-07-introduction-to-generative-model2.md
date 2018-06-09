---
layout: post
title: "Introduction to generative model(2)"
description: "Generative model을 이해하기 위한 기초"
date: 2018-06-07
tags: generative linear regression statistics
comments: true
---

# 0. 들어가며

저번글에서는 간단한 **Linear Regression**에 대해서 살펴보았다. 이번에는 **[Logistic Regression](https://ko.wikipedia.org/wiki/로지스틱_회귀)**에 대해서 간단히 살펴보자.



# 1. Discriminative Model의 간단한 요약 정리

## 1.2 Logistic Regression

- > 독립 변수의 선형 결합을 이용하여 사건의 발생 가능성을 예측하는데 사용되는 통계 기법이다. 

  로지스틱 회귀분석은 선형회귀랑은 다르게 결과가 범주형일때 사용되며 결과값이 기왕이면 범주형(우선은 Binary으로)으로 나와야한다. 우리가 이전에 했던 선형회귀의 경우 **y**의 값이 $$-\infty\sim\infty$$ 인데 이진의 경우는 0과 1로 정해진다. 결국엔 문제는 우리가 **가진 값의 결과**와 기존 **선형식의 결과**의 범위가 문제가 된다.$$[0,1] \neq [-\infty, \infty]$$ 이 비를 $$[-\infty, \infty]=[-\infty, \infty]$$로 바꾸기 위해서 두가지 작업이 필요한데 첫번째가 **Odds 비**, 두번째가 **log**이다.

- odds 비는 **실패 확률에 대한 성공 확률의 비율**이다. 



