import json

demo_papers = [
    {
        "id": "DEMO-01",
        "index": 1,
        "title": "Opportunity or Exploitation? A Longitudinal Dyadic Analysis of Flexible Working Arrangements and Gender Household Labor Allocation",
        "authors": "Senhu Wang, Cheng Cheng",
        "journal": "Social Forces",
        "year": 2023,
        "doi": "https://doi.org/10.1093/sf/soad125",
        "citations": 35,
        "tier": "P1",
        "tier_label": "P1 · 核心实证靶向",
        "score": 92.5,
        "hypotheses": ["H1", "H2"],
        "apa": "Wang, S., & Cheng, C. (2023). Opportunity or exploitation? A longitudinal dyadic analysis of flexible working arrangements and gender household labor allocation. Social Forces, 102(3), 1012-1035.",
        "bibtex": "@article{wang2023opportunity,\n  title={Opportunity or exploitation? A longitudinal dyadic analysis of flexible working arrangements and gender household labor allocation},\n  author={Wang, Senhu and Cheng, Cheng},\n  journal={Social Forces},\n  volume={102},\n  number={3},\n  pages={1012--1035},\n  year={2023},\n  publisher={Oxford University Press}\n}",
        "sections": [
            {
                "raw_title": "1. 论文元数据与学术声誉",
                "clean_title": "论文元数据与学术声誉",
                "content": "- **正式原题**：*Opportunity or Exploitation? A Longitudinal Dyadic Analysis of Flexible Working Arrangements and Gender Household Labor Allocation*\n- **著者**：Senhu Wang, Cheng Cheng\n- **发表学刊**：*Social Forces* ｜ **出版年份**：2023 年\n- **官方 DOI 链接**：[https://doi.org/10.1093/sf/soad125](https://doi.org/10.1093/sf/soad125) ｜ **全网被引频次**：35 次\n- **综合量化评分**：**92.5 分**（研究关联度 40% + 学术威信 25% + 数据计量 20% + 时效前沿 15%）\n\n---"
            },
            {
                "raw_title": "2. 官方摘要完整还原与逐句学术解构",
                "clean_title": "官方摘要完整还原与逐句学术解构",
                "content": "> **【Abstract 官方英文原文】**\n> It has been extensively debated whether the rise of flexible working arrangements (FWAs) serves as an \"opportunity\" to alleviate work-family conflict or as \"exploitation\" that exacerbates domestic burdens. Utilizing longitudinal dyadic data from the UK Household Longitudinal Study (UKHLS), this study investigates how husbands' and wives' flexible working reshapes intra-household time allocation.\n\n- **逐句学术要义解构**：\n    1. **立论痛点**：精准切入劳动市场灵活性与家庭内部性别分工的长期未决争议。\n    2. **理论双向对抗**：新古典时间可用性理论（Time Availability）预期远程办公通过消除通勤释放时间红利；而社会学性别表演（Doing Gender）理论指出在宅可能强化传统角色预期。\n    3. **关键实证贡献**：通过夫妻对偶固定效应微观面板，揭示了时间转移在不同家务形态上的非对称效应。\n\n---"
            },
            {
                "raw_title": "3. 现实问题背景与理论对立力量机制（Contrasting Forces）",
                "clean_title": "现实问题背景与理论对立力量机制（Contrasting Forces）",
                "content": "- **现实背景**：远程与弹性办公普及重塑了工作-家庭边界，政策制定者期待其作为性别平等催化剂，但缺乏对家庭内部隐性劳动分配的严谨因果识别。\n- **核心对立力量（Contrasting Forces）**：\n    - **正向力量（Positive Force / 经济学效率拉力）**：基于 Becker (1965) 与 Goldin (2014) 时间灵活性假说，节约的通勤时间直接扩大了家庭生产的时间预算集 $T$。\n    - **负向力量（Negative Force / 传统规范摩擦力）**：基于 West & Zimmerman (1987) Doing Gender 假说，缺乏职场物理边界时，传统母职惩罚与男主外女主内规范将被隐性放大。\n\n---"
            },
            {
                "raw_title": "4. 数据来源、样本构造与变量测度细则",
                "clean_title": "数据来源、样本构造与变量测度细则",
                "content": "- **微观数据集**：英国具有全国代表性的夫妻对偶大型追踪调查 UK Household Longitudinal Study (UKHLS, Understanding Society)。\n- **严苛样本筛选规则**：\n    - 聚焦婚内双职工对偶样本（Dual-earner married or cohabiting couples）；\n    - 排除严重疾病或关键时间利用缺失的异常样本；\n    - 保留平衡面板观测值以确保动态因果识别的严密性。\n- **关键变量测度**：\n    - **因变量**：日常家务时间（烹饪、清洁、洗涤）与照料育儿时间（Childcare）；\n    - **核心自变量**：夫妻双方各自的远程办公状态与频度梯度。\n\n---"
            },
            {
                "raw_title": "5. 计量经济学因果识别策略与精确回归方程",
                "clean_title": "计量经济学因果识别策略与精确回归方程",
                "content": "为吸收不可观测的家庭偏好与未观测异质性（Unobserved Heterogeneity），论文采用严格的夫妻对偶固定效应（Couple Fixed Effects）回归模型：\n\n$$\nY_{ijt} = \\beta_0 + \\beta_1 Telework_{it}^{H} + \\beta_2 Telework_{jt}^{W} + \\beta_3 (Telework_{it}^{H} \\times Z_{ijt}) + \\mathbf{X}_{ijt}'\\boldsymbol{\\gamma} + \\alpha_{ij} + \\delta_t + \\varepsilon_{ijt}\n$$\n\n- **因变量 $Y_{ijt}$**：家庭 $ij$ 在 $t$ 期的家务时间或育儿时间；\n- **核心自变量 $Telework_{it}^{H}, Telework_{jt}^{W}$**：夫与妻各自的在宅工作虚拟变量或周在宅天数；\n- **调节变量 $Z_{ijt}$**：相对收入比（Relative Income）或传统性别角色态度指数；\n- **固定效应 $\\alpha_{ij}, \\delta_t$**：吸收夫妻对偶不随时间变化的固定效应与宏观时间冲击；\n- **识别原理**：基于夫妻内部时间转换（Within-Couple Transformation），有效剔除选择性偏差与内生性。\n\n---"
            },
            {
                "raw_title": "6. 核心实证估计结果与系数拆解",
                "clean_title": "核心实证估计结果与系数拆解",
                "content": "1. **任务异质性（Task Heterogeneity）显著**：丈夫远程办公显著增加了育儿投入（$\\beta_1 > 0, p < 0.01$），但对日常繁重家务（烹饪洗涤）的分担无统计显著影响。\n2. **女性在宅的“双重负担”**：妻子远程办公不仅显著增加了家务时间，更拉长了心理认知负荷（Mental Load）。\n3. **调节效应**：在传统性别观念浓厚的家庭中，丈夫远程办公的家事促进效应被显著削弱（$\\beta_3 < 0$）。\n\n---"
            },
            {
                "raw_title": "7. 本文局限性与研究者的超越空白（Research Gap）",
                "clean_title": "本文局限性与研究者的超越空白（Research Gap）",
                "content": "- **文献既有局限**：数据主要立足欧美弱家庭主义文化，难以直接外推至日本等东亚强男性养家糊口体制（Breadwinner Model）社会。\n- **未来研究的边际突破空间（Research Gap）**：\n    - 引入东亚高精度面板（如日本 JHPS）考察在超长工作时间与极端性别分工体制下的对偶反应；\n    - 细分完全在宅（Full WFH）与混合办公（Hybrid）的非线性效应；\n    - 结合配偶健康与主观幸福感（Well-being）评估总体福利变化。\n\n---"
            }
        ]
    },
    {
        "id": "DEMO-02",
        "index": 2,
        "title": "A Grand Gender Convergence: Its Last Chapter",
        "authors": "Claudia Goldin",
        "journal": "American Economic Review",
        "year": 2014,
        "doi": "https://doi.org/10.1257/aer.104.4.1091",
        "citations": 2840,
        "tier": "P2",
        "tier_label": "P2 · 经典理论基石",
        "score": 96.0,
        "hypotheses": ["H1", "H3"],
        "apa": "Goldin, C. (2014). A grand gender convergence: Its last chapter. American Economic Review, 104(4), 1091-1119.",
        "bibtex": "@article{goldin2014grand,\n  title={A grand gender convergence: Its last chapter},\n  author={Goldin, Claudia},\n  journal={American Economic Review},\n  volume={104},\n  number={4},\n  pages={1091--1119},\n  year={2014}\n}",
        "sections": [
            {
                "raw_title": "1. 论文元数据与学术声誉",
                "clean_title": "论文元数据与学术声誉",
                "content": "- **正式原题**：*A Grand Gender Convergence: Its Last Chapter*\n- **著者**：Claudia Goldin（诺贝尔经济学奖得主，哈佛大学教授）\n- **发表学刊**：*American Economic Review*（AER 总统致辞讲话） ｜ **出版年份**：2014 年\n- **官方 DOI 链接**：[https://doi.org/10.1257/aer.104.4.1091](https://doi.org/10.1257/aer.104.4.1091) ｜ **被引频次**：2,840+ 次\n- **学术定位**：现代劳动经济学与性别经济学里程碑式文献，时间灵活性与非线性薪酬惩罚理论母体。\n\n---"
            },
            {
                "raw_title": "2. 核心理论机制与时间灵活性假说",
                "clean_title": "核心理论机制与时间灵活性假说",
                "content": "> **【核心理论洞察】**\n> 性别工资差距的根源不再是人力资本积累（教育与经验）的差异，而是劳动市场对“连续长工时”与“不可预测时间”的非线性巨额奖励（Nonlinear Wage Penalty）。\n\n- **非线性时间惩罚模型**：\n    - 若某一职业要求员工在特定时刻随叫随到（如投行、律所企业咨询），劳动报酬呈现工时的凸函数 $W(h) = A h^{1+\gamma} (\\gamma > 0)$；\n    - 夫妻在最大化家庭效用时，分工均衡必然迫使承担主要育儿责任的配偶（通常为妻子）放弃高惩罚岗位，导致家庭内性别收入与地位差距扩大。\n\n---"
            },
            {
                "raw_title": "3. 对现代在宅办公（WFH）与家务分工研究的理论启示",
                "clean_title": "对现代在宅办公（WFH）与家务分工研究的理论启示",
                "content": "- **远程办公作为技术性救赎**：远程与弹性工时通过降低员工之间的替代成本，降低了对“在场证明”的时间依赖性，使工时报酬趋于线性化。\n- **家庭内溢出效应**：当丈夫的工作时间获得弹性时，其在家庭内部提供即时支援的沉没成本显著下降，从理论上推导出时间灵活性具有改善家庭分工平衡的潜力。\n- **与文化规范的交互**：戈尔丁特别强调，技术与雇佣契约的灵活性是必要条件，但唯有配合社会规范意识的转变，才能真正迎来性别平等收敛的“最终章”。\n\n---"
            }
        ]
    }
]

# Write to papers_data.json
with open('d:/sotsuron/academic-literature-reader/data/papers_data.json', 'w', encoding='utf-8') as f:
    json.dump(demo_papers, f, ensure_ascii=False, indent=2)

# Write to papers_data.js
js_content = f"/**\n * Academic Literature Reader - Demo Dataset\n * Compatible with file:/// and browser offline execution.\n */\nwindow.PAPERS_DATA = {json.dumps(demo_papers, ensure_ascii=False, indent=2)};\n"
with open('d:/sotsuron/academic-literature-reader/data/papers_data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Demo dataset created with {len(demo_papers)} papers successfully.")
