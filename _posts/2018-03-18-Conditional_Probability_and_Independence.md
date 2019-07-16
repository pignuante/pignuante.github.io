---
layout: post
title: "1.4 Conditional Probability and Independence"
description: "Conditional Probability and Independence"
date: 2018-03-18
tags: [statistic, mathematical statistics, study]
author-id: pignu
comments: true
---



## 1.4 Conditional Probability and Independence

Conditional probability of $$C_2$$ given $$C_1$$ is
$$
\begin{aligned}
	P\left(C_2\vert C_1\right) = \frac{P\left(C_2\cap C_1\right)}{P\left(C_1\right)}, \quad C_1\lt C_2 \lt \mathscr{C}
\end{aligned}
$$

1. $$P\left(C_2\vert C_2\right)\ge0$$ (Non-negative)
2. $$P\left(C_1\vert C_1\right)=0$$ (Normality)
3. $$P\left(\cup_{i=2}^{\infty}C_i\vert C_1\right)=\sum_{i=2}^{\infty} P\left(C_i\vert C_1\right), \quad C_2, C_3,\cdots \text{are mutually exclusive}$$. (Countable Additivity)

> **ex 1.4.3)** Consider drawing cards successively at random and without replacement. Find the probability that the *3rd* spade appears on the *6th* draw.
>
> **sol)** 
>
> Spade, Diamond, Heart, Clover x 4, (A,1,…) = 52.
> $$
> \begin{aligned}
> 	P\left(\text{3rd spade on the 6th draw}\right) =&\ P\left(C_1\cap C_2\right) \\
> 	C_1 = &\ \text{Two spade in the first 5 draw} \\
> 	C_2 = &\ \text{A Spade in the 6th}\\
> 	P\left(C_1\cap C_2\right) = &\ P\left(C_2\vert C_2\right)P\left(C_1\right)\\
> \end{aligned}
> $$
>
> $$
> \begin{aligned}
> 	P\left(C_1\right) =&\ \frac{\binom{13}{2}\cdot\binom{39}{3}}{\binom{52}{5}}\\
> 	P\left(C_2\vert C_2\right) = &\ \frac{13\cdot2}{52\cdot5}\\
> 	\text{Recall } P\left(C_2\vert C_1\right) =&\ \frac{P\left(C_1\cap C_2\right)}{P\left(C_1\right)}\\
> 	 \Rightarrow P\left(C_1\cap C_2\right) =&\ P\left(C_2\vert C_1\right)\cdot P\left(C_1\right)
> \end{aligned}
> $$
>



For 3 events $$C_1, C_2, C_3$$,


$$
\begin{aligned}
	P\left(C_2\vert C_1\cap C_2\right) =&\ \frac{P\left(C_1\cap C_2 \cap C_3\right)}{P\left(C_1\cap C_2\right)}\\
	\therefore P\left(C_1\cap C_2 \cap C_3\right) = &\ P\left(C_3\vert C_1\cap C_2\right)\cdot\left(C_1\cap C_2\right)\\
	= &\ P\left(C_3\vert C_1\cap C_2\right)\cdot\left(C_2|C_1\right)\cdot\left(C_1\right)\\
	\text{in general,}\\
	P\left(C_1\cap C_2\cap\cdots\right) = &\\ P\left(C_1\right)P\left(C_2\vert C_1\right)P\left(C_3\vert C_1\cap C_2\right)&P\left(C_4\vert C_1\cap C_2 \cap C_3 \cap C_4\right)\cdots
\end{aligned}
$$

-----------



#### Bayes Theorem.

$$C_1, C_2,\cdots, C_k$$ is mutually exclusive[^1] and exhaustsive s.t. $$P\left(C_i\right)\gt0, \quad \forall i$$
$$
\begin{aligned}
	P\left(C_j\vert C\right) &=\ \frac{P\left(C_j\right)P\left(C\vert C_j\right)}{\sum_{i=1}^{k}P\left(C_i\right)P\left(C\vert C_i\right)},\quad j=1,2,\cdots k \\ \\
	P\left(C_1\right)&\ \cdots P\left(C_k\right): \text{Know} \\
	P\left(Cvert C_1\right)&\ \cdots P\left(C\vert C_k\right) : \text{Know} \\ \\
	&\ P\left(C_1\vert C\right) = ?
\end{aligned}
$$

- $$P\left(C_j\vert C\right) = $$ posterior probability
- $$P\left(C_j\right) = $$ prior probability
- $$ P\left(C\vert C_j\right) = $$ likelihood


##### proof.
$$
\begin{aligned}
	C=&\ \ \ \ \left(C\cap C_1\right)\cup\cdots\cup\ \ \ \left(C\cap C_k\right)\\
	P\left(C\right)=&\ P\left(C\cap C_1\right)\cup\cdots\cup P\left(C\cap C_k\right)\\
	=&\  P\left(C_1\right)P\left(C\vert C_1\right)+P\left(C_2\right)P\left(C\vert C_2\right) +\cdots + P\left(C_k\right)P\left(C|C_k\right)\\
	=&\ \sum_{i=1}^{k}P\left(C_i\right)P\left(C\vert C_i\right) : \text{Law of Total Probability} \\
	P\left(C_j\vert C\right) =&\ \frac{P\left(C\cap C_j\right)}{P\left(C\right)} = \frac{P\left(C_j\right)P\left(C\vert C_j\right)}{\sum_{i=1}^{k}P\left(C\vert C_i\right)}
\end{aligned}
$$



#### Definition 1.4.1

Two events $$C_1 \text{ and } C_2$$ are **independent**. $$P\left(C_1\vert C_2\right) = P\left(C_1\right)$$[^2] 
$$
\begin{aligned}
	P\left(C_1vert C_2\right) =&\ \frac{P\left(C_1\cap C_2\right)}{P\left(C_2\right)} = \frac{P\left(C_1\right)\enclose{downdiagonalstrike}{P\left(C_2\right)}}{\enclose{downdiagonalstrike}{P\left(C_2\right)}} = P\left(C_1\right) \\
	\Rightarrow&\ P\left(C_1\cap C_2\right) = P\left(C_1\right)P\left(C_2\right) \\ \\
	\text{and} &\\
	P\left(C_1\cap C_2 \cap \cdots \cap C_k\right) = &\ P\left(C_1\right)P\left(C_2\right)\cdots P\left(C_k\right)
\end{aligned}
$$














[^1]: Partition
[^2]: Unrelated



























