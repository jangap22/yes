window.quizData = window.quizData || {};

window.quizData["advanced_ai"] = [
  {
    "chapter": "01. Statistics",
    "type": "ox",
    "q": "결정 이론(Decision theory)은 가용한 모든 정보를 바탕으로 최적의 예측을 할 수 있게 해준다.",
    "a": "O",
    "k": ["결정 이론", "최적의 예측"]
  },
  {
    "chapter": "01. Statistics",
    "type": "ox",
    "q": "확률의 합산 규칙(Sum rule)은 p(X, Y) = p(Y|X)p(X)로 정의된다.",
    "a": "X",
    "k": ["곱셈 규칙", "합산 규칙"]
  },
  {
    "chapter": "01. Statistics",
    "type": "ox",
    "q": "연속 균등 분포(Continuous uniform distribution)에서 모든 이벤트의 확률 합(적분 값)은 1이다.",
    "a": "O",
    "k": ["확률의 합", "1"]
  },
  {
    "chapter": "01. Statistics",
    "type": "ox",
    "q": "엔트로피(Entropy)는 무작위성(Randomness)이 높을수록 그 값이 낮아진다.",
    "a": "X",
    "k": ["엔트로피", "무작위성", "비례"]
  },
  {
    "chapter": "01. Statistics",
    "type": "ox",
    "q": "KL 발산(Kullback-Leibler divergence)은 대칭적인 성질을 가져서 KL(p||q)와 KL(q||p)의 값은 항상 같다.",
    "a": "X",
    "k": ["비대칭", "Symmetrical"]
  },
  {
    "chapter": "01. Statistics",
    "type": "ox",
    "q": "베르누이 분포는 결과값이 1일 확률이 p일 때, 0일 확률은 1-p가 되는 이산 확률 분포이다.",
    "a": "O",
    "k": ["베르누이 분포", "1-p"]
  },
  {
    "chapter": "01. Statistics",
    "type": "short",
    "q": "확률 이론에서 불확실성을 수치화하고 조작하기 위한 틀을 제공하는 핵심 개념은 무엇인가?",
    "a": "확률 이론 (Probability Theory)",
    "k": ["확률 이론", "불확실성"]
  },
  {
    "chapter": "01. Statistics",
    "type": "short",
    "q": "스토캐스틱 프로세스의 결과를 수치로 표현한 것을 무엇이라 하는가?",
    "a": "확률 변수 (Random variable)",
    "k": ["확률 변수", "Random variable"]
  },
  {
    "chapter": "01. Statistics",
    "type": "short",
    "q": "데이터 샘플을 크기순으로 나열했을 때 상위 절반과 하위 절반을 나누는 값은?",
    "a": "중앙값 (Median)",
    "k": ["중앙값", "Median"]
  },
  {
    "chapter": "01. Statistics",
    "type": "short",
    "q": "데이터 세트에서 가장 빈번하게 나타나는 값을 무엇이라 하는가?",
    "a": "최빈값 (Mode)",
    "k": ["최빈값", "Mode"]
  },
  {
    "chapter": "01. Statistics",
    "type": "short",
    "q": "두 확률 변수 사이의 독립성 정도를 측정하기 위해 KL 발산을 사용하여 계산하는 정보량의 명칭은?",
    "a": "상호 정보량 (Mutual information)",
    "k": ["상호 정보량", "Mutual information"]
  },
  {
    "chapter": "01. Statistics",
    "type": "short",
    "q": "정보 이론에서 이진 변수 x에 대한 정보 획득량을 나타내는 척도로, p(x)의 로그에 음수를 취한 값의 기대치는?",
    "a": "엔트로피 (Entropy)",
    "k": ["엔트로피", "Entropy"]
  },
  {
    "chapter": "01. Statistics",
    "type": "multiple",
    "q": "다음 중 베이즈 정리(Bayes' theorem)를 올바르게 표현한 공식은?\na) p(Y|X) = p(X|Y)p(Y) / p(X)\nb) p(Y|X) = p(X, Y)p(X)\nc) p(X) = p(X|Y) + p(Y)\nd) p(X, Y) = p(X) + p(Y)",
    "a": "a",
    "k": ["베이즈 정리", "사후 확률"]
  },
  {
    "chapter": "01. Statistics",
    "type": "multiple",
    "q": "엔트로피(Entropy)에 대한 설명으로 틀린 것은?\na) 균등 분포일 때 엔트로피가 가장 높다.\nb) 정보의 무작위성을 측정하는 척도이다.\nc) 비균등 분포는 균등 분포보다 엔트로피가 높다.\nd) 허프만 코딩은 발생 빈도가 높은 정보에 짧은 비트를 할당한다.",
    "a": "c",
    "k": ["엔트로피", "균등 분포", "낮은 엔트로피"]
  },
  {
    "chapter": "01. Statistics",
    "type": "multiple",
    "q": "공분산 행렬(Covariance matrix)에서 변수 간에 의존성(dependency)이 존재할 경우 어떤 특징이 나타나는가?\na) 모든 원소가 0이 된다.\nb) 대각 원소(Diagonal elements)만 0이 된다.\ c) 비대각 원소(Non-diagonal elements)가 0이 아니게 된다.\nd) 행렬의 합이 1이 된다.",
    "a": "c",
    "k": ["공분산", "의존성", "비대각 원소"]
  },
  {
    "chapter": "01. Statistics",
    "type": "multiple",
    "q": "다음 중 평균(Average)에 대한 설명으로 옳은 것은?\na) 관측된 데이터의 단순한 중심 경향성을 나타낸다.\nb) 확률 분포의 가중 평균과는 항상 동일한 개념이다.\nc) 데이터의 분산 정도를 나타내는 척도이다.\nd) 확률 변수가 취할 수 있는 모든 값의 확률적 기대치만을 의미한다.",
    "a": "a",
    "k": ["평균", "중심 경향성"]
  },
  {
    "chapter": "01. Statistics",
    "type": "multiple",
    "q": "KL 발산(Relative Entropy)의 특징이 아닌 것은?\na) 항상 0보다 크거나 같다.\nb) 두 분포 p(x)와 q(x)가 동일할 때 최소값 0을 갖는다.\nc) 거리 개념으로 사용되지만 대칭적이지 않다.\nd) p(x)를 q(x)로 모델링했을 때 발생하는 정보 이득을 의미한다.",
    "a": "d",
    "k": ["정보 손실", "KL 발산"]
  },
  {
    "chapter": "01. Statistics",
    "type": "multiple",
    "q": "연속 확률 변수 x에 대해 p(x)가 확률 밀도 함수일 때, 누적 분포 함수(Cumulative distribution function) P(z)를 구하는 식은?\na) p(x)의 미분\nb) -infinity부터 z까지 p(x)의 적분\nc) p(x)의 제곱\nd) p(x)와 p(y)의 곱",
    "a": "b",
    "k": ["누적 분포 함수", "적분"]
  },
  {
    "chapter": "01. Statistics",
    "type": "essay",
    "q": "평균(Average)과 기대값(Expectation)의 차이점을 중심 경향성의 관점에서 설명하시오.",
    "a": "평균은 실제로 관측된 데이터 샘플들의 단순한 산술적 중심 경향을 나타내지만, 기대값은 확률 분포를 기반으로 각 샘플이 가질 수 있는 확률을 가중치로 적용한 확률적 중심 경향을 의미한다.",
    "k": ["관측 데이터", "확률 분포", "가중 평균", "중심 경향성"]
  },
  {
    "chapter": "01. Statistics",
    "type": "essay",
    "q": "확률의 합산 규칙(Sum rule)과 곱셈 규칙(Product rule)을 수식과 함께 간략히 서술하시오.",
    "a": "합산 규칙은 주변 확률을 구하는 식으로 p(X) = Σ_Y p(X, Y)이며, 곱셈 규칙은 결합 확률을 조건부 확률로 표현하는 식으로 p(X, Y) = p(Y|X)p(X)이다.",
    "k": ["p(X) = Σ p(X, Y)", "p(X, Y) = p(Y|X)p(X)"]
  },
  {
    "chapter": "01. Statistics",
    "type": "essay",
    "q": "분산(Variance)의 정의와 공식(E[X]를 활용한 변형식)을 쓰고, 그것이 데이터에 대해 무엇을 의미하는지 설명하시오.",
    "a": "분산은 데이터가 평균으로부터 얼마나 떨어져 있는지를 나타내는 척도이다. 공식은 Var[X] = E[X^2] - (E[X])^2 로 계산할 수 있다.",
    "k": ["평균으로부터의 발산", "E[X^2] - (E[X])^2"]
  },
  {
    "chapter": "01. Statistics",
    "type": "essay",
    "q": "상대 엔트로피(KL 발산)가 기계 학습에서 어떤 의미를 갖는지 설명하시오.",
    "a": "실제 데이터의 분포 p(x)를 근사 분포 q(x)로 모델링했을 때 발생하는 추가적인 정보량(정보 손실)을 의미하며, 두 분포가 얼마나 다른지를 측정하는 척도로 사용된다.",
    "k": ["정보 손실", "분포 간 차이", "근사 분포"]
  },
  {
    "chapter": "01. Statistics",
    "type": "essay",
    "q": "균등 분포(Uniform distribution)의 특징을 이산형과 연속형의 관점에서 설명하시오.",
    "a": "균등 분포는 모든 가능한 결과가 일정한 확률을 갖는 분포이다. 이산형은 p(x)=1/N이며, 연속형은 구간 [a, b] 내에서 p(x)=1/(b-a)의 값을 갖고 그 외에는 0이다.",
    "k": ["동일한 확률", "1/N", "1/(b-a)"]
  },
  {
    "chapter": "01. Statistics",
    "type": "essay",
    "q": "공분산(Covariance)과 독립성(Independence)의 관계를 공분산 행렬의 관점에서 설명하시오.",
    "a": "두 변수가 독립적이면 공분산은 0이 되며, 공분산 행렬에서 비대각 원소들이 모두 0인 대각 행렬의 형태를 띠게 된다. 반대로 의존성이 있으면 비대각 원소에 0이 아닌 값이 존재하게 된다.",
    "k": ["독립", "0", "비대각 원소", "의존성"]
  },
  {
    "chapter": "01. Statistics",
    "type": "essay",
    "q": "엔트로피 예제에서 발생 확률이 불균등할 때(예: 1/2, 1/4 등)가 균등할 때보다 엔트로피가 낮은 이유를 설명하시오.",
    "a": "특정 값이 발생할 확률이 높다는 것은 그만큼 결과에 대한 예측 가능성이 높아지고 무작위성(불확실성)이 줄어들기 때문에, 평균 정보량인 엔트로피 수치는 낮아지게 된다.",
    "k": ["예측 가능성", "무작위성 감소", "불확실성"]
  },
  {
    "chapter": "01. Statistics",
    "type": "essay",
    "q": "조건부 기대값(Expectation for a conditional distribution)의 개념을 수식으로 표현하시오.",
    "a": "특정 조건 y가 주어졌을 때 x의 기대치를 의미하며, E[X|y] = Σ_x p(x|y)x 로 표현한다.",
    "k": ["E[X|y]", "p(x|y)"]
  },
  {
    "chapter": "01. Statistics",
    "type": "essay",
    "q": "정보 이론에서 정보 획득량 h(x)를 -log2 p(x)로 정의하는 이유를 정보의 결합 관점에서 설명하시오.",
    "a": "두 독립적인 이벤트 x, y가 동시에 일어날 확률은 p(x,y)=p(x)p(y)이지만, 정보량은 두 정보를 합친 h(x)+h(y)가 되어야 하므로 곱셉을 덧셈으로 변환해주는 로그(log) 함수를 사용한다.",
    "k": ["독립 이벤트", "곱셈을 덧셈으로", "로그 함수"]
  },
  {
    "chapter": "01. Statistics",
    "type": "essay",
    "q": "베이즈 정리가 머신러닝에서 중요한 역할을 하는 이유를 '사전 지식'이라는 키워드를 포함하여 설명하시오.",
    "a": "베이즈 정리는 새로운 데이터가 관측되었을 때, 기존의 사전 지식(Prior)을 바탕으로 사후 확률(Posterior)을 업데이트할 수 있는 프레임워크를 제공하여 모델의 불확실성을 관리할 수 있게 해주기 때문이다.",
    "k": ["사전 지식", "사후 확률", "업데이트"]
  },
  {
    "chapter": "01. Statistics",
    "type": "essay",
    "q": "몬테카를로 적분(Monte Carlo integration)이 기대값 계산에서 활용되는 상황을 설명하시오.",
    "a": "모든 확률 이벤트를 직접 관측하거나 계산하기 어려운 복잡한 경우, 샘플링된 데이터의 평균을 통해 기대값을 근사적으로 계산하기 위해 활용된다.",
    "k": ["샘플링", "근사적 계산", "복잡한 분포"]
  },
  {
    "chapter": "01. Statistics",
    "type": "essay",
    "q": "상호 정보량(Mutual Information)이 0이라는 것이 의미하는 바를 두 변수의 관계를 통해 설명하시오.",
    "a": "상호 정보량이 0이라는 것은 KL(p(x,y)||p(x)p(y)) 가 0임을 의미하며, 이는 두 변수 x와 y가 서로 완벽하게 독립적이라서 한 변수를 아는 것이 다른 변수에 대한 어떠한 정보도 제공하지 않음을 뜻한다.",
    "k": ["독립", "0", "정보 제공 없음"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "ox",
    "q": "스칼라(Scalar)는 크기만을 가지며 방향을 가지지 않는 물리량이다.",
    "a": "O",
    "k": ["스칼라", "크기", "방향 없음"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "ox",
    "q": "두 벡터의 내적(Inner Product) 결과값은 항상 벡터로 나타난다.",
    "a": "X",
    "k": ["스칼라", "내적 결과"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "ox",
    "q": "단위 행렬(Identity Matrix)은 주대각선 성분이 모두 1이고 나머지는 0인 정사각 행렬이다.",
    "a": "O",
    "k": ["단위 행렬", "주대각선 1"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "ox",
    "q": "행렬 A의 역행렬이 존재하기 위한 필요충분조건은 행렬식(Determinant)이 0이 되는 것이다.",
    "a": "X",
    "k": ["행렬식 0 아님", "역행렬 존재 조건"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "ox",
    "q": "전치 행렬(Transpose Matrix)은 원본 행렬의 행과 열을 맞바꾼 행렬이다.",
    "a": "O",
    "k": ["전치 행렬", "행열 전환"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "ox",
    "q": "직교 행렬(Orthogonal Matrix)의 역행렬은 해당 행렬의 전치 행렬과 같다.",
    "a": "O",
    "k": ["직교 행렬", "역행렬", "전치 행렬"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "short",
    "q": "행렬 A에서 행과 열의 개수가 같은 행렬을 무엇이라 하는가?",
    "a": "정사각 행렬 (Square Matrix)",
    "k": ["정사각 행렬", "Square Matrix"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "short",
    "q": "벡터의 크기(길이)를 측정하는 함수로, 원점에서 해당 점까지의 거리를 나타내는 개념은?",
    "a": "노름 (Norm)",
    "k": ["노름", "Norm"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "short",
    "q": "행렬 A와 벡터 x에 대해 Ax = λx를 만족할 때, 상수 λ를 무엇이라 하는가?",
    "a": "고유값 (Eigenvalue)",
    "k": ["고유값", "Eigenvalue"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "short",
    "q": "주대각 성분을 제외한 모든 성분이 0인 행렬을 무엇이라 하는가?",
    "a": "대각 행렬 (Diagonal Matrix)",
    "k": ["대각 행렬", "Diagonal Matrix"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "short",
    "q": "두 벡터 사이의 각도가 90도일 때, 두 벡터의 관계를 일컫는 용어는?",
    "a": "직교 (Orthogonal)",
    "k": ["직교", "Orthogonal"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "short",
    "q": "행렬의 모든 주대각 성분의 합을 의미하는 용어는?",
    "a": "트레이스 (Trace)",
    "k": ["트레이스", "Trace"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "multiple",
    "q": "다음 중 행렬의 곱셈 성질에 대한 설명으로 옳은 것은?\na) AB = BA (교환법칙 성립)\nb) (AB)C = A(BC) (결합법칙 성립)\nc) A + B = B + A (교환법칙 불성립)\nd) 역행렬은 항상 존재한다.",
    "a": "b",
    "k": ["결합법칙", "행렬 곱셈 성질"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "multiple",
    "q": "대각 행렬(Diagonal Matrix)의 역행렬을 구하는 방법으로 옳은 것은?\na) 모든 성분에 -1을 곱한다.\nb) 행과 열을 바꾼다.\nc) 주대각 성분의 역수를 취한다.\nd) 모든 성분을 0으로 만든다.",
    "a": "c",
    "k": ["대각 행렬", "역수", "역행렬"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "multiple",
    "q": "다음 중 벡터 공간의 기저(Basis)가 되기 위한 조건으로 올바른 것은?\na) 벡터들이 서로 종속적이어야 한다.\nb) 벡터들이 서로 선형 독립이며 공간을 생성해야 한다.\ c) 벡터의 합이 항상 0이어야 한다.\nd) 모든 벡터의 크기가 1이어야만 한다.",
    "a": "b",
    "k": ["선형 독립", "생성(Span)", "기저"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "multiple",
    "q": "행렬 A가 (n x m) 크기이고 행렬 B가 (m x p) 크기일 때, 곱셈 결과 행렬 C의 크기는?\na) n x m\nb) m x p\nc) n x p\nd) m x m",
    "a": "c",
    "k": ["행렬 크기", "곱셈"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "multiple",
    "q": "랭크(Rank)에 대한 설명으로 가장 적절한 것은?\na) 행렬의 행과 열의 총 합이다.\nb) 행렬에서 선형 독립인 행 또는 열의 최대 개수이다.\nc) 행렬의 모든 원소 중 최대값이다.\nd) 역행렬의 존재 유무와 상관없는 수치이다.",
    "a": "b",
    "k": ["선형 독립", "최대 개수", "랭크"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "multiple",
    "q": "특이값 분해(SVD)를 통해 행렬 A를 분해했을 때 포함되지 않는 행렬 형태는?\na) 직교 행렬\nb) 대각 행렬\nc) 상삼각 행렬\nd) 전치된 직교 행렬",
    "a": "c",
    "k": ["SVD", "분해 구조"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "essay",
    "q": "선형 독립(Linear Independence)과 선형 종속(Linear Dependence)의 차이점을 정의를 통해 설명하시오.",
    "a": "벡터들의 선형 조합이 0벡터가 될 때 모든 계수가 0인 경우만 존재하면 선형 독립이며, 하나 이상의 계수가 0이 아님에도 0벡터를 만들 수 있다면 선형 종속이다.",
    "k": ["선형 조합", "계수 0", "0벡터"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "essay",
    "q": "고유값 분해(Eigenvalue Decomposition)의 기본 개념과 목적을 서술하시오.",
    "a": "정사각 행렬을 고유벡터와 고유값의 곱으로 분해하는 것으로, 행렬이 나타내는 선형 변환의 주된 방향과 그 크기를 파악하기 위해 사용된다.",
    "k": ["고유벡터", "고유값", "선형 변환 분석"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "essay",
    "q": "벡터의 내적(Inner Product)이 기하학적으로 의미하는 바를 투영(Projection)의 관점에서 설명하시오.",
    "a": "한 벡터를 다른 벡터 위로 수직 투영시킨 길이와 그 대상 벡터의 길이를 곱한 값으로, 두 벡터의 유사도나 사이 각도를 측정하는 지표가 된다.",
    "k": ["투영", "유사도", "사이 각도"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "essay",
    "q": "L1 노름과 L2 노름의 수식적 차이와 특징을 비교하여 설명하시오.",
    "a": "L1 노름은 각 성분의 절대값의 합이며(Manhattan distance), L2 노름은 각 성분의 제곱 합의 제곱근(Euclidean distance)으로 표현된다. L2는 최단 거리를 측정하는 데 주로 쓰인다.",
    "k": ["절대값 합", "제곱 합의 제곱근", "거리 측정"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "essay",
    "q": "행렬식(Determinant)이 기하학적으로 어떤 의미를 갖는지 2차원 또는 3차원 공간을 예로 들어 설명하시오.",
    "a": "행렬식은 선형 변환 시 공간의 부피(2차원에서는 넓이)가 확장되거나 축소되는 비율을 의미하며, 0일 경우 공간이 압착되어 차원이 손실됨을 뜻한다.",
    "k": ["부피 변화율", "차원 손실", "면적"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "essay",
    "q": "전치 행렬(Transpose)의 성질 중 (AB)^T 에 대해 기술하시오.",
    "a": "(AB)^T = B^T A^T 로 정의되며, 두 행렬의 곱을 전치하면 각 행렬을 전치하여 곱하되 순서가 반대가 된다.",
    "k": ["순서 반대", "B^T A^T"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "essay",
    "q": "희소 행렬(Sparse Matrix)이란 무엇이며, 보안 데이터 처리에서 왜 중요한지 서술하시오.",
    "a": "대부분의 원소가 0인 행렬을 말하며, 대규모 보안 로그나 네트워크 트래픽 데이터 분석 시 메모리 효율성과 계산 속도를 높이기 위해 필수적으로 다루어진다.",
    "k": ["0의 비중", "메모리 효율", "데이터 분석"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "essay",
    "q": "행렬의 랭크(Rank)와 역행렬 존재 유무의 관계를 설명하시오.",
    "a": "n x n 정사각 행렬에서 랭크가 n(Full Rank)이면 선형 독립인 행들이 최대이므로 역행렬이 존재하며, 랭크가 n보다 작으면 역행렬이 존재하지 않는다.",
    "k": ["Full Rank", "선형 독립", "역행렬 존재"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "essay",
    "q": "특이값 분해(SVD)가 데이터 차원 축소에 어떻게 활용되는지 간략히 설명하시오.",
    "a": "데이터 행렬을 분해하여 얻은 특이값 중 크기가 작은 것들을 제외함으로써 중요한 정보(분산이 큰 방향) 위주로 데이터를 재구성하여 차원을 축소한다.",
    "k": ["특이값", "정보 유지", "차원 축소"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "essay",
    "q": "대칭 행렬(Symmetric Matrix)의 정의와 특징 한 가지를 서술하시오.",
    "a": "A = A^T 를 만족하는 행렬로, 항상 고유값 분해가 가능하며 서로 다른 고유값에 대응하는 고유벡터들이 직교한다는 특징이 있다.",
    "k": ["A = A^T", "고유벡터 직교"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "essay",
    "q": "벡터 공간(Vector Space)의 닫힘 성질(Closure property)에 대해 설명하시오.",
    "a": "공간 내의 임의의 벡터들에 대해 덧셈 연산이나 스칼라 곱 연산을 수행했을 때, 그 결과가 여전히 동일한 공간 내에 포함되어야 함을 의미한다.",
    "k": ["덧셈", "스칼라 곱", "공간 내 포함"]
  },
  {
    "chapter": "02. Linear Algebra",
    "type": "essay",
    "q": "행렬 곱셈 Ax = b에서 x를 구하는 과정이 시스템의 해를 찾는 것과 어떤 연관이 있는지 서술하시오.",
    "a": "A를 계수 행렬, x를 미지수 벡터, b를 결과값 벡터로 보면, 이는 여러 선형 방정식들의 해를 한꺼번에 찾는 선형 시스템의 풀이 과정과 동일하다.",
    "k": ["계수 행렬", "미지수", "선형 시스템 해"]
  }, 
  {
    "chapter": "03. Regression",
    "type": "ox",
    "q": "선형 회귀(Linear Regression)의 목표는 목표 변수 t와 입력 변수 x 사이의 선형 관계를 모델링하는 것이다.",
    "a": "O",
    "k": ["선형 회귀", "목표 변수", "입력 변수"]
  },
  {
    "chapter": "03. Regression",
    "type": "ox",
    "q": "최대 우도 추정치(Maximum Likelihood Solution)를 구할 때 노이즈 분포를 가우시안으로 가정하면 오차 제곱합(Sum-of-squares) 최소화와 동일한 결과를 얻는다.",
    "a": "O",
    "k": ["최대 우도", "가우시안", "오차 제곱합"]
  },
  {
    "chapter": "03. Regression",
    "type": "ox",
    "q": "규제화(Regularization)는 모델의 복잡도를 증가시켜 과적합(Overfitting)을 유도하기 위해 사용된다.",
    "a": "X",
    "k": ["규제화", "과적합 억제", "복잡도 제어"]
  },
  {
    "chapter": "03. Regression",
    "type": "ox",
    "q": "베이지안 선형 회귀에서 사후 분포(Posterior)는 사전 분포(Prior)와 우도(Likelihood)의 곱에 비례한다.",
    "a": "O",
    "k": ["사후 분포", "사전 분포", "우도"]
  },
  {
    "chapter": "03. Regression",
    "type": "ox",
    "q": "데이터의 수가 매개변수의 수보다 훨씬 많을 때 과적합 현상이 더 심하게 발생한다.",
    "a": "X",
    "k": ["데이터 수", "매개변수", "과적합"]
  },
  {
    "chapter": "03. Regression",
    "type": "ox",
    "q": "기저 함수(Basis function)를 사용하면 입력 변수의 비선형 함수를 매개변수 w에 대한 선형 모델로 표현할 수 있다.",
    "a": "O",
    "k": ["기저 함수", "매개변수 선형성"]
  },
  {
    "chapter": "03. Regression",
    "type": "short",
    "q": "선형 회귀 모델에서 예측 성능을 평가하기 위해 실제값과 예측값의 차이를 제곱하여 모두 더한 값을 무엇이라 하는가?",
    "a": "오차 제곱합 (Sum-of-squares error)",
    "k": ["오차 제곱합", "Sum-of-squares"]
  },
  {
    "chapter": "03. Regression",
    "type": "short",
    "q": "과적합을 방지하기 위해 가중치(w)의 크기를 비용 함수에 추가하여 제약하는 기법은?",
    "a": "규제화 (Regularization)",
    "k": ["규제화", "Regularization"]
  },
  {
    "chapter": "03. Regression",
    "type": "short",
    "q": "매개변수 w에 대한 점 추정이 아닌 확률 분포 전체를 구하는 회귀 방식은?",
    "a": "베이지안 회귀 (Bayesian Regression)",
    "k": ["베이지안 회귀", "Bayesian"]
  },
  {
    "chapter": "03. Regression",
    "type": "short",
    "q": "가중치 벡터 w의 L2 노름을 규제항으로 사용하는 선형 회귀 모델의 명칭은?",
    "a": "릿지 회귀 (Ridge Regression)",
    "k": ["릿지 회귀", "Ridge"]
  },
  {
    "chapter": "03. Regression",
    "type": "short",
    "q": "데이터가 주어지기 전 매개변수에 대해 알고 있는 지식을 확률 분포로 나타낸 것은?",
    "a": "사전 분포 (Prior distribution)",
    "k": ["사전 분포", "Prior"]
  },
  {
    "chapter": "03. Regression",
    "type": "short",
    "q": "편향(Bias)과 분산(Variance) 사이의 균형을 맞추는 문제를 무엇이라 하는가?",
    "a": "Bias-Variance Trade-off",
    "k": ["Bias-Variance", "Trade-off"]
  },
  {
    "chapter": "03. Regression",
    "type": "multiple",
    "q": "다음 중 기저 함수(Basis function)의 예로 적절하지 않은 것은?\na) Polynomial basis\nb) Gaussian basis\nc) Sigmoidal basis\nd) Linear likelihood",
    "a": "d",
    "k": ["기저 함수", "Basis function"]
  },
  {
    "chapter": "03. Regression",
    "type": "multiple",
    "q": "과적합(Overfitting)이 발생했을 때 나타나는 현상으로 옳은 것은?\na) 가중치(w)의 크기가 급격히 커진다.\nb) 훈련 데이터에 대한 오차가 커진다.\nc) 모델이 너무 단순해진다.\nd) 새로운 데이터(Test data)에 대한 예측력이 좋아진다.",
    "a": "a",
    "k": ["과적합", "가중치 크기 증가"]
  },
  {
    "chapter": "03. Regression",
    "type": "multiple",
    "q": "가장 간단한 선형 모델인 y(x, w) = w0 + w1x1 + ... + wDxD에서 w0가 의미하는 것은?\na) 가중치 계수\nb) 입력 변수\nc) 편향 파라미터(Bias parameter)\nd) 오차율",
    "a": "c",
    "k": ["Bias parameter", "편향"]
  },
  {
    "chapter": "03. Regression",
    "type": "multiple",
    "q": "데이터셋의 크기가 커질수록 과적합 문제는 어떻게 변화하는가?\na) 더 심해진다.\nb) 완화되거나 사라진다.\nc) 변화가 없다.\nd) 데이터 종류에 따라 다르다.",
    "a": "b",
    "k": ["데이터셋 크기", "과적합 완화"]
  },
  {
    "chapter": "03. Regression",
    "type": "multiple",
    "q": "회귀 분석에서 노이즈의 정밀도를 나타내는 파라미터는?\na) w\nb) Φ\nc) β\nd) λ",
    "a": "c",
    "k": ["정밀도", "Precision", "β"]
  },
  {
    "chapter": "03. Regression",
    "type": "multiple",
    "q": "다음 중 베이지안 선형 회귀의 장점이 아닌 것은?\na) 매개변수의 불확실성을 고려할 수 있다.\nb) 과적합 문제를 자연스럽게 해결할 수 있다.\nc) 점 추정(Point estimation)보다 계산 속도가 매우 빠르다.\nd) 사전 지식을 모델에 통합할 수 있다.",
    "a": "c",
    "k": ["베이지안 장점", "불확실성"]
  },
  {
    "chapter": "03. Regression",
    "type": "essay",
    "q": "최대 우도 추정법(Maximum Likelihood)의 기본 개념을 회귀 분석 모델의 관점에서 설명하시오.",
    "a": "관측된 데이터셋이 발생할 확률(우도)을 최대화하는 매개변수 w와 β를 찾는 방법이다. 가우시안 노이즈를 가정할 경우 오차 제곱합을 최소화하는 해와 일치한다.",
    "k": ["우도 최대화", "매개변수 추정", "가우시안 가정"]
  },
  {
    "chapter": "03. Regression",
    "type": "essay",
    "q": "과적합(Overfitting)의 정의와 이를 해결하기 위한 두 가지 이상의 기법을 서술하시오.",
    "a": "모델이 훈련 데이터에 너무 과하게 최적화되어 일반화 성능이 떨어지는 현상이다. 해결 기법으로는 규제화(Regularization) 추가, 데이터 양 늘리기, 모델 복잡도 낮추기 등이 있다.",
    "k": ["일반화 성능 저하", "규제화", "데이터 증강"]
  },
  {
    "chapter": "03. Regression",
    "type": "essay",
    "q": "규제화(Regularization)가 포함된 오차 함수에서 규제 매개변수 λ(람다)의 역할을 설명하시오.",
    "a": "λ는 훈련 데이터에 대한 적합도와 가중치 크기에 대한 제약 사이의 상대적 중요도를 조절한다. λ가 커질수록 가중치 값들이 작아져 모델이 단순해진다.",
    "k": ["상대적 중요도", "가중치 억제", "복잡도 조절"]
  },
  {
    "chapter": "03. Regression",
    "type": "essay",
    "q": "다항식 곡선 피팅(Polynomial Curve Fitting)에서 차수(M)가 모델의 성능에 미치는 영향을 서술하시오.",
    "a": "차수가 너무 낮으면 과소적합(Underfitting)이 발생하여 데이터를 잘 설명하지 못하고, 차수가 너무 높으면 데이터의 노이즈까지 학습하여 과적합(Overfitting)이 발생한다.",
    "k": ["과소적합", "과적합", "차수 M"]
  },
  {
    "chapter": "03. Regression",
    "type": "essay",
    "q": "무어-펜로즈 유사 역행렬(Moore-Penrose pseudo-inverse)의 수식적 정의와 사용 목적을 서술하시오.",
    "a": "수식은 Φ† = (Φ^T Φ)^-1 Φ^T 이며, 행렬이 정사각 행렬이 아니거나 역행렬이 존재하지 않는 경우 선형 회귀의 최소 제곱해를 구하기 위해 사용된다.",
    "k": ["(Φ^T Φ)^-1 Φ^T", "최소 제곱해", "유사 역행렬"]
  },
  {
    "chapter": "03. Regression",
    "type": "essay",
    "q": "베이지안 선형 회귀에서 순차적 학습(Sequential learning)이 가능한 이유를 설명하시오.",
    "a": "특정 시점까지의 사후 분포를 다음 데이터를 위한 사전 분포로 사용할 수 있는 베이지안 업데이트 구조를 갖추고 있기 때문이다.",
    "k": ["사후 분포", "사전 분포 전환", "베이지안 업데이트"]
  },
  {
    "chapter": "03. Regression",
    "type": "essay",
    "q": "최대 사후 확률 추정(MAP)과 최대 우도 추정(ML)의 결정적인 차이점을 기술하시오.",
    "a": "ML은 관측 데이터의 확률만을 고려하지만, MAP는 데이터뿐만 아니라 매개변수에 대한 사전 지식(Prior)을 결합하여 최적의 값을 찾는다.",
    "k": ["Prior", "사전 지식 유무", "데이터 확률"]
  },
  {
    "chapter": "03. Regression",
    "type": "essay",
    "q": "선형 회귀에서 기저 함수(Basis Function)를 도입함으로써 얻는 이점은 무엇인가?",
    "a": "입력 변수 x에 대해서는 비선형적인 관계를 갖는 복잡한 데이터도 매개변수 w에 대해서는 선형적인 모델로 표현할 수 있어 선형 대수적 풀이가 가능해진다.",
    "k": ["비선형성 모델링", "매개변수 선형성", "복잡한 데이터"]
  },
  {
    "chapter": "03. Regression",
    "type": "essay",
    "q": "가우시안 기저 함수(Gaussian Basis Function)의 매개변수인 μ(뮤)와 s의 의미를 서술하시오.",
    "a": "μ는 기저 함수가 공간상에서 위치하는 중심점을 의미하고, s는 해당 기저 함수의 영향력이 미치는 공간적 범위(폭)를 결정한다.",
    "k": ["중심 위치", "공간적 범위", "폭"]
  },
  {
    "chapter": "03. Regression",
    "type": "essay",
    "q": "회귀 모델에서 '일반화(Generalization)'의 의미와 중요성을 보안 분석 관점에서 설명하시오.",
    "a": "일반화란 학습에 사용되지 않은 새로운 데이터에 대해 정확한 예측을 수행하는 능력이다. 보안 분석에서는 과거 패턴뿐 아니라 변형된 새로운 공격을 탐지하기 위해 일반화 성능이 매우 중요하다.",
    "k": ["새로운 데이터 예측", "일반화 성능", "보안 분석"]
  },
  {
    "chapter": "03. Regression",
    "type": "essay",
    "q": "예측 분포(Predictive distribution)란 무엇이며 점 추정 예측값과의 차이는 무엇인가?",
    "a": "새로운 입력에 대해 단일 결과값만 내놓는 것이 아니라 결과값의 확률 분포를 제공하는 것이다. 이는 예측 결과의 불확실성(분산)까지 함께 제공한다는 차이가 있다.",
    "k": ["확률 분포", "불확실성 제공", "분산"]
  },
  {
    "chapter": "03. Regression",
    "type": "essay",
    "q": "Bias-Variance 분해의 관점에서 복잡한 모델이 갖는 특징을 설명하시오.",
    "a": "복잡한 모델은 데이터에 유연하게 적응하여 편향(Bias)은 낮아지지만, 데이터의 사소한 변동에도 민감하게 반응하여 분산(Variance)이 높아지는 특징을 갖는다.",
    "k": ["낮은 편향", "높은 분산", "복잡한 모델"]
    },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "ox",
    "q": "퍼셉트론(Perceptron)은 다수의 신호를 입력받아 하나의 신호를 출력하는 알고리즘이다.",
    "a": "O",
    "k": ["퍼셉트론", "신호 출력"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "ox",
    "q": "단층 퍼셉트론은 비선형 분리 문제를 해결할 수 있다.",
    "a": "X",
    "k": ["단층 퍼셉트론", "선형 분리만 가능"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "ox",
    "q": "다층 퍼셉트론(MLP)은 은닉층을 추가함으로써 비선형적인 문제를 해결할 수 있게 된다.",
    "a": "O",
    "k": ["은닉층", "비선형성"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "ox",
    "q": "역전파(Backpropagation) 알고리즘은 출력층에서 입력층 방향으로 오차를 전파하며 가중치를 업데이트한다.",
    "a": "O",
    "k": ["역전파", "가중치 업데이트"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "ox",
    "q": "계단 함수(Step function)는 미분이 가능하여 현대 딥러닝의 활성화 함수로 가장 많이 사용된다.",
    "a": "X",
    "k": ["계단 함수", "미분 불가능"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "ox",
    "q": "시그모이드(Sigmoid) 함수는 출력값이 0과 1 사이의 값을 가진다.",
    "a": "O",
    "k": ["시그모이드", "0과 1 사이"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "short",
    "q": "입력 신호의 총합을 출력 신호로 변환할 때, 출력 여부를 결정하는 함수를 무엇이라 하는가?",
    "a": "활성화 함수 (Activation Function)",
    "k": ["활성화 함수", "Activation Function"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "short",
    "q": "단층 퍼셉트론으로는 해결할 수 없지만, 다층 퍼셉트론으로 해결 가능한 대표적인 논리 회로 문제는?",
    "a": "XOR 문제",
    "k": ["XOR"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "short",
    "q": "신경망 학습에서 실제 정답과 모델 예측값 사이의 차이를 계산하는 함수는?",
    "a": "손실 함수 (Loss Function)",
    "k": ["손실 함수", "Loss Function"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "short",
    "q": "기울기(Gradient)를 이용하여 손실 함수의 값을 최소화하는 방향으로 매개변수를 갱신하는 방법은?",
    "a": "경사 하강법 (Gradient Descent)",
    "k": ["경사 하강법", "Gradient Descent"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "short",
    "q": "입력층과 출력층 사이에 존재하는 층을 무엇이라 하는가?",
    "a": "은닉층 (Hidden Layer)",
    "k": ["은닉층", "Hidden Layer"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "short",
    "q": "0보다 작으면 0을, 0보다 크면 입력값 그대로를 출력하는 현대 딥러닝에서 가장 대중적인 활성화 함수는?",
    "a": "ReLU (Rectified Linear Unit)",
    "k": ["ReLU", "Rectified Linear Unit"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "multiple",
    "q": "다음 중 신경망의 각 층에서 비선형성을 부여하기 위해 사용하는 활성화 함수가 아닌 것은?\na) Sigmoid\nb) ReLU\nc) Identity Function (항등 함수)\nd) Tanh",
    "a": "c",
    "k": ["비선형성", "활성화 함수"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "multiple",
    "q": "출력층의 활성화 함수 선택 중 분류(Classification) 문제에서 주로 사용되는 함수는?\na) 항등 함수\nb) 소프트맥스(Softmax)\nc) 가우시안 함수\nd) 평균 제곱 오차",
    "a": "b",
    "k": ["분류", "Softmax"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "multiple",
    "q": "신경망 학습 과정에서 가중치(Weight) 초기값이 0일 때 발생하는 문제점은?\na) 연산 속도가 너무 빨라진다.\nb) 모든 노드가 동일하게 업데이트되어 다층 구조의 의미가 사라진다.\nc) 과적합이 완벽히 예방된다.\nd) 오차가 발생하지 않는다.",
    "a": "b",
    "k": ["가중치 초기화", "대칭 파괴"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "multiple",
    "q": "경사 하강법에서 학습률(Learning Rate)이 너무 클 경우 발생하는 현상은?\na) 학습 속도가 매우 느려진다.\nb) 최솟값에 수렴하지 못하고 발산한다.\nc) 전역 최솟값(Global Minimum)에 항상 도달한다.\nd) 가중치가 변화하지 않는다.",
    "a": "b",
    "k": ["학습률", "발산"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "multiple",
    "q": "다층 퍼셉트론에서 연쇄 법칙(Chain Rule)이 주로 사용되는 단계는?\na) 데이터 전처리\nb) 순전파(Forward Propagation)\nc) 역전파(Backpropagation)\nd) 결과 리포팅",
    "a": "c",
    "k": ["역전파", "연쇄 법칙"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "multiple",
    "q": "배치 경사 하강법(Batch Gradient Descent)에 대한 설명으로 옳은 것은?\na) 매 데이터 샘플마다 가중치를 갱신한다.\nb) 전체 데이터를 한 번에 사용하여 기울기를 계산한다.\nc) 무작위로 데이터를 추출하여 계산한다.\nd) 메모리 사용량이 가장 적다.",
    "a": "b",
    "k": ["전체 데이터", "배치 경사 하강법"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "essay",
    "q": "단층 퍼셉트론이 XOR 문제를 해결할 수 없는 이유를 기하학적 관점에서 설명하시오.",
    "a": "단층 퍼셉트론은 직선 하나로 영역을 나누는 선형 분리만 가능하지만, XOR 데이터는 직선 하나로는 0과 1의 영역을 완벽하게 분리할 수 없는 비선형 구조를 가지기 때문이다.",
    "k": ["선형 분리", "비선형 구조", "직선"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "essay",
    "q": "신경망의 출력층에서 사용하는 소프트맥스(Softmax) 함수의 수식적 특징과 출력값의 의미를 설명하시오.",
    "a": "출력되는 모든 노드의 값의 합이 1이 되도록 정규화하는 함수이다. 각 출력값은 해당 클래스에 속할 확률로 해석될 수 있다.",
    "k": ["합이 1", "정규화", "확률"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "essay",
    "q": "경사 하강법(Gradient Descent)에서 'Local Minimum' 문제란 무엇인지 서술하시오.",
    "a": "손실 함수의 전체 영역에서 가장 낮은 지점인 Global Minimum이 아니라, 주변보다 낮은 부분 최솟값 지점에 갇혀 더 이상 학습이 진행되지 않는 문제를 의미한다.",
    "k": ["부분 최솟값", "Global Minimum", "학습 중단"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "essay",
    "q": "순전파(Forward Propagation)와 역전파(Backpropagation)의 차이점을 데이터 흐름의 관점에서 서술하시오.",
    "a": "순전파는 입력 데이터를 입력층부터 출력층 방향으로 전달하며 예측값을 계산하는 과정이고, 역전파는 출력층의 오차를 반대 방향으로 전파하며 각 가중치의 기울기를 계산하여 갱신하는 과정이다.",
    "k": ["예측값 계산", "오차 전파", "가중치 갱신"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "essay",
    "q": "시그모이드(Sigmoid) 활성화 함수가 층이 깊어질 때 발생하는 'Gradient Vanishing' 문제에 대해 설명하시오.",
    "a": "층이 깊어질수록 역전파 과정에서 곱해지는 미분값이 매우 작아져(0에 가까워져), 입력층에 가까운 가중치들이 제대로 학습되지 않는 현상이다.",
    "k": ["미분값 소실", "기울기 소실", "학습 부진"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "essay",
    "q": "오차 제곱합(MSE)과 교차 엔트로피 오차(Cross Entropy Error)의 주된 용도 차이를 설명하시오.",
    "a": "MSE는 주로 회귀(Regression) 문제에서 예측값과 실제값의 수치적 거리를 측정할 때 사용하고, Cross Entropy는 주로 분류(Classification) 문제에서 두 확률 분포 간의 차이를 측정할 때 사용한다.",
    "k": ["회귀-MSE", "분류-Cross Entropy"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "essay",
    "q": "학습률(Learning Rate) 최적화의 중요성을 경사 하강법 이동 거리에 빗대어 설명하시오.",
    "a": "학습률은 가중치 갱신 시 이동하는 보폭을 결정한다. 너무 크면 최솟값을 지나쳐버리고(오버슈팅), 너무 작으면 학습 시간이 과도하게 오래 걸리거나 Local Minimum에 쉽게 빠진다.",
    "k": ["보폭", "오버슈팅", "학습 속도"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "essay",
    "q": "다층 퍼셉트론에서 비선형 활성화 함수를 생략하고 선형 함수만 사용했을 때의 문제점을 서술하시오.",
    "a": "선형 함수를 여러 층 겹치더라도 결국 하나의 선형 함수로 요약되므로, 층을 깊게 쌓는 의미가 사라지고 비선형 문제를 해결할 수 없게 된다.",
    "k": ["선형성 유지", "은닉층 효과 상실", "비선형성 부족"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "essay",
    "q": "확률적 경사 하강법(SGD)이 배치 경사 하강법보다 속도 면에서 유리한 이유를 설명하시오.",
    "a": "배치 경사 하강법은 전체 데이터를 다 읽어야 한 번 갱신하지만, SGD는 데이터 하나(또는 소수)마다 가중치를 즉시 갱신하므로 계산량이 적고 빠른 피드백이 가능하기 때문이다.",
    "k": ["즉시 갱신", "계산 효율", "피드백"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "essay",
    "q": "미니배치(Mini-batch) 학습의 개념과 장점을 서술하시오.",
    "a": "전체 데이터를 작은 묶음 단위로 나누어 학습하는 방식으로, 배치 방식의 안정성과 SGD의 속도라는 장점을 동시에 취하며 GPU 병렬 연산 효율을 높일 수 있다.",
    "k": ["데이터 묶음", "병렬 연산", "학습 효율"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "essay",
    "q": "ReLU 함수가 시그모이드 함수보다 딥러닝에서 선호되는 주된 이유 한 가지를 서술하시오.",
    "a": "양수 영역에서 미분값이 1로 일정하기 때문에 층이 매우 깊어져도 기울기가 사라지지 않아 학습 속도가 빠르고 Gradient Vanishing 문제를 완화해주기 때문이다.",
    "k": ["미분값 1", "학습 속도", "기울기 소실 완화"]
  },
  {
    "chapter": "04. Multi-layer Perceptron",
    "type": "essay",
    "q": "신경망에서 과적합(Overfitting)을 억제하기 위한 '드롭아웃(Dropout)' 기법의 원리를 설명하시오.",
    "a": "학습 과정에서 무작위로 일부 뉴런을 비활성화하여 특정 뉴런에만 지나치게 의존하는 것을 방지하고, 앙상블 학습과 유사한 효과를 내어 일반화 성능을 높인다.",
    "k": ["뉴런 비활성화", "의존성 분산", "일반화"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "ox",
    "q": "합성곱 계층(Convolutional Layer)은 이미지의 공간적 구조 정보를 유지하면서 특징을 추출할 수 있다.",
    "a": "O",
    "k": ["공간적 구조", "특징 추출"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "ox",
    "q": "풀링 계층(Pooling Layer)은 학습해야 할 매개변수(Weight)가 존재하여 역전파를 통해 업데이트된다.",
    "a": "X",
    "k": ["매개변수 없음", "고정 연산"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "ox",
    "q": "합성곱 연산에서 스트라이드(Stride)를 키우면 출력 데이터의 크기는 작아진다.",
    "a": "O",
    "k": ["스트라이드", "출력 크기 감소"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "ox",
    "q": "CNN에서 패딩(Padding)을 사용하는 주된 이유 중 하나는 출력 크기가 줄어드는 것을 방지하기 위함이다.",
    "a": "O",
    "k": ["패딩", "크기 유지"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "ox",
    "q": "완전 연결 계층(Fully Connected Layer)은 이미지의 인접 픽셀 간의 관계를 무시하고 1차원 데이터로 처리한다.",
    "a": "O",
    "k": ["형상 무시", "1차원"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "ox",
    "q": "채널(Channel)이 여러 개인 이미지의 합성곱 연산 시, 필터의 채널 수도 입력 이미지의 채널 수와 일치해야 한다.",
    "a": "O",
    "k": ["채널 수 일치"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "short",
    "q": "합성곱 연산에서 입력 데이터에 적용하여 특징을 추출하는 작은 행렬을 무엇이라 하는가?",
    "a": "필터 (또는 커널)",
    "k": ["필터", "Filter", "커널", "Kernel"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "short",
    "q": "합성곱 계층과 활성화 함수를 거쳐 만들어진 최종 결과물을 무엇이라 부르는가?",
    "a": "특징 맵 (Feature Map)",
    "k": ["특징 맵", "Feature Map"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "short",
    "q": "특정 영역에서 가장 큰 값을 선택하여 데이터의 크기를 줄이는 풀링 방식은?",
    "a": "최대 풀링 (Max Pooling)",
    "k": ["최대 풀링", "Max Pooling"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "short",
    "q": "필터를 적용하는 간격을 의미하는 용어는?",
    "a": "스트라이드 (Stride)",
    "k": ["스트라이드", "Stride"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "short",
    "q": "입력 데이터 주변을 특정 값(주로 0)으로 채워 출력 크기를 조절하는 기법은?",
    "a": "패딩 (Padding)",
    "k": ["패딩", "Padding"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "short",
    "q": "CNN의 마지막 단계에서 추출된 특징들을 하나로 모아 최종 분류를 수행하는 계층은?",
    "a": "완전 연결 계층 (Fully Connected Layer)",
    "k": ["완전 연결 계층", "Fully Connected Layer", "Affiner Layer"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "multiple",
    "q": "합성곱 연산에 대한 설명으로 틀린 것은?\na) 필터를 일정 간격으로 이동시키며 입력과 곱하고 합한다.\nb) 필터의 매개변수가 바로 학습해야 할 가중치이다.\nc) 편향(Bias)은 필터를 적용한 후 모든 원소에 공통으로 더해진다.\nd) 출력 데이터의 채널 수는 항상 입력 데이터의 채널 수와 같다.",
    "a": "d",
    "k": ["출력 채널 수", "필터 개수"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "multiple",
    "q": "입력 크기가 (10, 10), 필터 크기가 (3, 3), 패딩이 0, 스트라이드가 1일 때 출력 크기는?\na) (10, 10)\nb) (8, 8)\nc) (7, 7)\nd) (9, 9)",
    "a": "b",
    "k": ["출력 크기 계산", "8x8"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "multiple",
    "q": "풀링(Pooling) 계층의 특징으로 옳은 것은?\na) 가중치가 있어 학습을 통해 변한다.\nb) 채널 수가 변한다.\nc) 미세한 위치 변화(입력 변화)에 강건하다(Robust).\nd) 주로 활성화 함수 이전에 적용한다.",
    "a": "c",
    "k": ["강건함", "Robust", "불변성"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "multiple",
    "q": "3차원 합성곱 연산(C, H, W)에서 필터의 구성으로 옳은 것은?\na) (C, FH, FW)\nb) (1, FH, FW)\nc) (FH, FW, C)\nd) (H, W, C)",
    "a": "a",
    "k": ["3차원 합성곱", "채널 일치"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "multiple",
    "q": "CNN이 MLP(다층 퍼셉트론)보다 이미지 처리에 뛰어난 근본적인 이유는?\na) 계산 속도가 훨씬 느리기 때문이다.\nb) 공간적 휘발성(Spatial variance)을 무시하기 때문이다.\nc) 데이터의 형상(Shape)을 유지하며 특징을 학습하기 때문이다.\nd) 더 많은 활성화 함수를 사용하기 때문이다.",
    "a": "c",
    "k": ["형상 유지", "공간 정보"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "multiple",
    "q": "합성곱 연산에서 '편향'이 적용되는 방식으로 옳은 것은?\na) 각 채널마다 서로 다른 값이 더해진다.\nb) 필터 적용 후 모든 특징 맵 원소에 동일한 하나의 값이 더해진다(필터당 하나).\nc) 입력 데이터에 먼저 더해진 후 필터가 적용된다.\nd) 풀링 계층 이후에만 적용된다.",
    "a": "b",
    "k": ["편향", "브로드캐스팅"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "essay",
    "q": "합성곱 계층에서 패딩(Padding)을 사용하는 목적 두 가지를 서술하시오.",
    "a": "첫째, 출력 데이터의 크기가 입력 데이터와 같거나 특정 크기가 되도록 조절하기 위함이다. 둘째, 입력 데이터의 외곽 부분 정보를 더 많이 반영하여 정보 손실을 방지하기 위함이다.",
    "k": ["크기 조절", "외곽 정보 유지", "정보 손실 방지"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "essay",
    "q": "완전 연결 계층(Fully Connected Layer)과 비교하여 합성곱 계층이 갖는 장점을 데이터 형상 관점에서 설명하시오.",
    "a": "완전 연결 계층은 3차원 이미지를 1차원으로 평면화하여 공간적 정보(픽셀 간 거리, 인접성)를 잃어버리지만, 합성곱 계층은 데이터의 형상을 유지하며 국소적인 특징을 추출하므로 이미지 학습에 효과적이다.",
    "k": ["형상 유지", "공간 정보 보존", "국소적 특징"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "essay",
    "q": "스트라이드(Stride)의 정의와 스트라이드 값이 커질 때 모델에 미치는 영향을 서술하시오.",
    "a": "스트라이드는 필터를 적용하는 간격(이동 거리)이다. 이 값이 커지면 출력 데이터의 크기가 작아지며, 이는 연산량을 줄여주지만 세밀한 특징 추출이 어려워질 수 있다.",
    "k": ["필터 이동 간격", "출력 크기 감소", "연산량 감소"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "essay",
    "q": "풀링 계층(Pooling Layer)의 주요 특징 세 가지를 서술하시오.",
    "a": "1. 학습해야 할 매개변수가 없다. 2. 채널 수가 변하지 않는다. 3. 입력 데이터의 미세한 위치 변화에도 출력 결과가 크게 변하지 않는 강건함(Robustness)을 가진다.",
    "k": ["학습 매개변수 없음", "채널 수 불변", "강건함"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "essay",
    "q": "이미지 채널이 3개(RGB)인 경우, 1개의 필터가 수행하는 합성곱 연산 과정을 설명하시오.",
    "a": "필터 또한 3개의 채널을 가지며, 각 채널별로 입력 이미지와 합성곱 연산을 수행한 뒤 그 결과값들을 모두 더하여 하나의 채널을 가진 특징 맵을 생성한다.",
    "k": ["채널별 연산", "결과 합산", "하나의 출력"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "essay",
    "q": "출력 데이터의 크기(OH, OW)를 구하는 공식을 입력(H, W), 패딩(P), 스트라이드(S), 필터(FH, FW)를 사용하여 기술하시오.",
    "a": "OH = (H + 2P - FH) / S + 1, OW = (W + 2P - FW) / S + 1 이며, 계산 결과는 정수로 나누어떨어져야 한다.",
    "k": ["(H + 2P - FH) / S + 1"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "essay",
    "q": "최대 풀링(Max Pooling)과 평균 풀링(Average Pooling)의 차이점을 설명하시오.",
    "a": "최대 풀링은 대상 영역에서 가장 큰 값을 추출하여 강한 특징을 강조하는 방식이고, 평균 풀링은 대상 영역의 평균값을 계산하여 전반적인 특징을 반영하는 방식이다. 주로 CNN에서는 최대 풀링이 더 선호된다.",
    "k": ["최대값 추출", "평균값 계산", "특징 강조"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "essay",
    "q": "CNN에서 '수용장(Receptive Field)'의 개념을 간단히 설명하시오.",
    "a": "출력 레이어의 한 픽셀이 입력 레이어에서 어느 정도 범위의 영역을 보고 있는지를 나타내는 것으로, 층이 깊어질수록 하나의 노드가 커버하는 수용장은 넓어진다.",
    "k": ["입력 영역 범위", "계층 깊이", "범위 확장"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "essay",
    "q": "다수의 필터를 사용하는 이유를 특징 추출의 관점에서 서술하시오.",
    "a": "하나의 필터는 하나의 특정 패턴(가로선, 세로선 등)만 추출할 수 있으므로, 여러 개의 필터를 사용하여 이미지 내의 다양한 시각적 특징들을 동시에 추출하기 위함이다.",
    "k": ["다양한 특징", "패턴 추출", "필터 개수=출력 채널"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "essay",
    "q": "CNN 구조에서 활성화 함수(예: ReLU)는 보통 어느 시점에 적용되는지 서술하시오.",
    "a": "일반적으로 합성곱 계층의 연산(필터 곱 및 편향 합) 직후에 적용되어 데이터에 비선형성을 부여하며, 그 이후에 풀링 계층이 오는 경우가 많다.",
    "k": ["합성곱 연산 후", "비선형성 부여"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "essay",
    "q": "보안 관제에서 CNN을 활용하여 이상 트래픽을 탐지하고자 할 때, 1차원 로그 데이터를 어떻게 변환하여 CNN에 입력할 수 있을지 아이디어를 서술하시오.",
    "a": "1차원 로그 시퀀스를 일정 시간 단위로 잘라 행렬 형태로 재구성하거나, 패킷의 바이너리 데이터를 이미지화(Pixelation)하여 2차원 데이터로 변환함으로써 CNN의 공간적 특징 추출 기능을 활용할 수 있다.",
    "k": ["이미지화", "행렬 재구성", "2차원 변환"]
  },
  {
    "chapter": "05. Convolutional Neural Network",
    "type": "essay",
    "q": "CNN 학습 시 데이터 증강(Data Augmentation)이 과적합 방지에 도움이 되는 이유를 서술하시오.",
    "a": "이미지를 회전, 반전, 확대/축소하여 훈련 데이터의 양을 인위적으로 늘림으로써, 모델이 특정 구도나 위치에 고정되지 않고 일반적인 특징을 학습하게 하여 일반화 성능을 높이기 때문이다.",
    "k": ["데이터 양 증가", "일반화", "변형 학습"]
  }
]