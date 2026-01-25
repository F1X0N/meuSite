# JOSIVAN AMORIM - PROFILE KNOWLEDGE BASE
> SYSTEM INSTRUCTION: Use this document as the SINGLE SOURCE OF TRUTH for Josivan Amorim's professional profile.

## 1. RESUMO EXECUTIVO
Engenheiro de Software Fullstack com foco em IA Generativa aplicada em produção. Especialista em construir "Monólitos Modulares" robustos, pipelines de dados resilientes e arquiteturas que equilibram custo (FinOps) e qualidade. Transita entre o desenvolvimento de produto (React/Node) e engenharia de IA (Python/RAG/LLMs).

Atualmente focado em uma **LegalTech SaaS**, desenvolvendo soluções de automação e IA para otimizar fluxos de escritórios de advocacia.

## 2. PRINCÍPIOS DE ENGENHARIA
1. **Production-First AI:** Prompts são código. Custo e latência são requisitos não-funcionais críticos.
2. **Resiliência:** Wrappers e decorators para tratar falhas de API (timeout, rate limit) com Retry Exponencial.
3. **KISS & Modularidade:** Monólitos modulares bem arquitetados reduzem complexidade operacional vs microserviços prematuros.
4. **FinOps Nativo:** Otimização de tokens, chunking inteligente e cacheamento agressivo.

## 3. EXPERIÊNCIA PROFISSIONAL (Cronológica)

### [Atual] Desenvolvedor Fullstack & IA @ LegalTech SaaS (Automação Jurídica)
**Período:** Julho 2024 — Presente
**Foco:** Arquitetura de IA, RAG, Automação Jurídica.
**Stack:** Python, OpenAI API, AWS, Docker, PostgreSQL, React, Node.js.
**Principais Feitos:**
- **Monólito Modular:** Arquitetura dividida em (1) Processamento Documental (OCR/ETL), (2) Motor de Cálculos (Domain-Driven) e (3) Orquestração.
- **RAG com Layout Awareness:** Algoritmo de geometria que preserva tabelas em PDFs jurídicos antes da vetorização.
- **JSON Repair:** Implementação de parser resiliente para garantir saídas estruturadas de LLMs.
- **Gestão de Custos:** Sistema multi-tenant de API Keys para segregar custos por cliente/contexto.

### [Anterior] Desenvolvedor Fullstack @ Grande Enterprise (Varejo/Indústria)
**Período:** Fevereiro 2022 — Maio 2024
**Foco:** Transformação Digital, Sistemas Corporativos de Larga Escala.
**Stack:** Angular, Node.js, PHP, PostgreSQL, Docker.
**Principais Feitos:**
- **Escala:** Desenvolvimento e sustentação de sistemas para base de 28.000+ colaboradores (Brasil/Argentina).
- **Eficiência:** Automação de processos internos com ganho de 30% em eficiência operacional.
- **Legado:** Modernização gradual de sistemas legados mantendo alta disponibilidade.
- **Metodologia:** Atuação em cultura Lean e Scrum/Kanban.

### [Anterior] Desenvolvedor Frontend @ Freelance
**Período:** Julho 2021 — Julho 2024
**Foco:** Interfaces Responsivas, UX/UI.
**Stack:** React, JavaScript, Bootstrap, HTML5/CSS3.
**Principais Feitos:**
- Portais imobiliários e corporativos com foco em responsividade e SEO.

## 4. PORTFÓLIO TÉCNICO (Resumo de Artigos e Cases Principais)

### Artigos Técnicos Publicados:
- **Early Returns (Clean Code):** Defende o uso de retornos antecipados para reduzir aninhamento e melhorar legibilidade. Contra o dogma de "função com único ponto de saída".
- **Funções Puras:** Explica os benefícios de funções determinísticas sem efeitos colaterais para testabilidade e manutenibilidade.

### Estudos de Caso Destacados:
- **OCR Híbrido (FinOps + Visão):** Pipeline de extração de texto com cascata inteligente (texto nativo -> OCR local -> Cloud API). Resultado: Redução de 78% de custos (de $30k para $6.5k/mês) mantendo 97.8% de acurácia. Tags: Python, Tesseract, EasyOCR, Textract, FinOps.

- **Sistema Multi-LLM Resiliente:** Arquitetura com retry exponencial, fallback entre providers (OpenAI/Anthropic/Azure) e JSON repair automático. Resultado: 99.97% de disponibilidade (vs 94% anterior). Tags: OpenAI, Anthropic, Circuit Breaker, Resilience.

- **Telemetria Granular de Custos em IA:** Sistema de rastreamento de tokens por operação e usuário com OpenTelemetry. Resultado: Identificou economia de $2.2k/mês (44% do budget) via otimizações (troca de modelos GPT-4 ->  GPT-3.5, cache de embeddings, prompt tuning). Tags: OpenTelemetry, FinOps, Observability.

## 5. HABILIDADES TÉCNICAS (Hard Skills)
- **Linguagens:** Python (Avançado), TypeScript/JavaScript (Avançado), PHP.
- **IA/LLM:** OpenAI API, Anthropic, RAG Avançado, Prompt Engineering, LangChain (Conceitos).
- **Backend:** Node.js, FastAPI, REST, PostgreSQL, Redis.
- **Frontend:** React, Next.js, Angular, TailwindCSS.
- **DevOps:** Docker, AWS (S3, EC2), CI/CD (GitHub Actions), Linux.

## 6. EDUCAÇÃO
- **Análise e Desenvolvimento de Sistemas** - UNIFACS (2021–2023)
- Autodidata contínuo: Foco em Engenharia de Software Moderna e IA.

## 7. LINKS & CONTATO
- **LinkedIn:** linkedin.com/in/josivan-amorim-44401120a
- **GitHub:** github.com/F1X0N
- **Email:** amorimjosivan7@gmail.com

## 8. BANCO DE RESPOSTAS (FAQ - ROTEIRO DE ENTREVISTA)

### 1) Perfil e Trajetória
**P: Me conte sobre você e sua trajetória.**
R: Eu sou um desenvolvedor full stack com foco em construção e sustentação de aplicações web e integração de IA em produto. Atualmente atuo na Facilita Jurídico, desenvolvendo funcionalidades, realizando manutenções e implementando soluções com IA para otimizar fluxos e melhorar a experiência dos clientes.

**P: Onde você trabalha atualmente e o que faz no dia a dia?**
R: Na Facilita Jurídico eu desenvolvo soluções tanto no lado do cliente quanto no servidor, além de integrar serviços de inteligência artificial para atender melhor os clientes.

**P: Quais experiências anteriores você considera mais relevantes?**
R: No Grupo Dass eu trabalhei com desenvolvimento e sustentação de aplicações web para uma base grande (mais de 28 mil funcionários no Brasil e Argentina), sendo responsável por back-end, front-end, coleta de requisitos, entrega e apresentação do que foi desenvolvido, dentro de cultura Lean e metodologias ágeis.

**P: Você já trabalhou com outras frentes além de aplicações web?**
R: Sim. Já atuei com automação de processos, RFID, visão computacional e infraestrutura com Docker e VMs.

### 2) Stack e Competências
**P: Quais stacks você domina hoje?**
R: Minhas stacks principais incluem React, JavaScript, Node.js, Python, PostgreSQL e Inteligência Artificial.

**P: Quais competências você destaca ligadas a IA?**
R: Destaco uso avançado da API da OpenAI, Python para orquestração e Inteligência Artificial aplicada, além do posicionamento como "Prompt Engineer" e Full Stack.

### 3) Principal Projeto Técnico (Arquitetura)
**P: Explique uma arquitetura de um sistema que você já trabalhou.**
R: Descrevo um monólito modular voltado à automação de fluxos jurídicos (Facilita Jurídico). A arquitetura tem três módulos principais: (1) Processamento Documental (OCR/ETL), (2) Motor de Cálculos (Domain-Driven) e (3) Orquestração e Serviços. O fluxo: a orquestração recebe a requisição; se houver documentos, o módulo de processamento transforma "papel digital" em dados; o motor de cálculos consome esses dados e produz laudos; o resultado é consolidado e devolvido.

**P: Por que monólito modular (e não microserviços)?**
R: A opção pelo monólito modular evitou a complexidade operacional prematura de microserviços e facilitou o compartilhamento de código utilitário e a consistência do domínio.

### 4) IA Aplicada em Produção
**P: Como foi o ciclo de integrar LLMs em produto?**
R: Apliquei práticas de engenharia de software na IA: prompts defensivos, governança multi-provider, reparo de saídas estruturadas (JSON), tratamento de rate limit e controle de custo (tokens).

**P: Como lida com múltiplos provedores?**
R: Criei uma camada de abstração (Model Gateway) com interface unificada para OpenAI, Anthropic e DeepSeek, permitindo troca rápida via configuração.

**P: Como garante a integridade de respostas JSON?**
R: Utilizo processamento de "JSON Repair", um parser resiliente que corrige JSON malformado retornado por LLMs antes que isso quebre a aplicação.

### 5) Dados e OCR
**P: Como processa dados não estruturados (PDF/Imagem)?**
R: O módulo de processamento documental é um pipeline ETL que ingere PDF, imagens e DOCX, normalizando para JSON/Markdown estruturado.

**P: Como controla custo de OCR?**
R: Uso uma "cascata de extração": 1º Texto nativo do PDF (Grátis); 2º EasyOCR local (Custo computacional baixo); 3º Textract/Cloud API (Custo alto) apenas como fallback.

### 6) Metodologia
**P: Como você se descreve profissionalmente?**
R: Sou movido por aprendizado contínuo, com disposição para sair da zona de conforto e tenho uma visão de tecnologia orientada a resolver problemas reais e materializar ideias de negócio.