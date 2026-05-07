import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const fileDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(fileDirectory, "../../..");
const linkedinWorkspaceDirectory = join(workspaceRoot, "workspace", "linkedin");
const professionalContextDirectory = join(workspaceRoot, "workspace", "professional-context");

const workspacePaths = {
  current: join(linkedinWorkspaceDirectory, "profile-current.json"),
  proposed: join(linkedinWorkspaceDirectory, "profile-proposed.json"),
  source: join(linkedinWorkspaceDirectory, "profile-source.md"),
  professionalSources: join(linkedinWorkspaceDirectory, "professional-sources.json"),
  contextSourceMap: join(professionalContextDirectory, "source-map.json"),
  contextEvidenceIndex: join(professionalContextDirectory, "professional-evidence-index.json"),
  contextSensitivityReview: join(professionalContextDirectory, "sensitivity-review.json"),
  contextProfile: join(professionalContextDirectory, "profile-context.md"),
  contextLinkedIn: join(professionalContextDirectory, "linkedin-positioning.md"),
  contextSiteBio: join(professionalContextDirectory, "site-bio.md"),
  posts: join(linkedinWorkspaceDirectory, "posts"),
  reviews: join(linkedinWorkspaceDirectory, "reviews")
};

const defaultFacilitaSuporteRoot = resolve(workspaceRoot, "..", "facilita-suporte");

const defaultProfessionalSource = {
  name: "facilita-suporte",
  root: defaultFacilitaSuporteRoot,
  readOnly: true,
  include: [
    "AGENTS.md",
    "CLAUDE.md",
    "RALPH.md",
    ".claude/skills",
    "knowledge/core/index.md",
    "knowledge/core/productivity-framework.md",
    "knowledge",
    "knowledge/agents/workspace-reference.md",
    "knowledge/agents/shared-capabilities.md",
    "knowledge/agents/capability-report.md",
    "knowledge/agents/connector-roadmap.md",
    "knowledge/agents/risk-policy.yaml",
    "knowledge/agents/codex-review-reference.md",
    "workflows",
    "workspace",
    "workspace/active/daily-board.md",
    "workspace/backlog/backlog.md",
    "workspace/reports/daily"
  ],
  exclude: [
    ".git",
    ".next",
    "node_modules",
    "local",
    "tmp",
    "temp",
    "output",
    "backups",
    ".playwright-cli",
    "_playwright_profile"
  ],
  maxFiles: 2000,
  maxBytesPerFile: 30000
};

const defaultProfessionalSources = {
  sources: [defaultProfessionalSource]
};

const defaultProfile = {
  metadata: {
    owner: "Josivan",
    language: "pt-BR",
    source: "manual",
    profileUrl: "",
    lastImportedAt: null,
    lastUpdatedAt: null
  },
  identity: {
    name: "Josivan",
    headline: "",
    location: "",
    industry: ""
  },
  about: "",
  featured: [],
  experience: [],
  education: [],
  licensesAndCertifications: [],
  skills: [],
  projects: [],
  recommendations: [],
  notes: []
};

const toolDefinitions = [
  {
    name: "read_current_profile",
    description: "Read the current, proposed, or both local LinkedIn profile versions.",
    inputSchema: {
      type: "object",
      properties: {
        version: {
          type: "string",
          enum: ["current", "proposed", "both"],
          default: "current"
        },
        includeSource: {
          type: "boolean",
          default: false
        }
      }
    }
  },
  {
    name: "update_profile_section",
    description: "Replace a section in the current or proposed local LinkedIn profile JSON.",
    inputSchema: {
      type: "object",
      required: ["section", "value"],
      properties: {
        version: {
          type: "string",
          enum: ["current", "proposed"],
          default: "proposed"
        },
        section: {
          type: "string",
          description: "Dot path such as identity.headline, about, experience, skills, or featured."
        },
        value: {
          description: "New JSON value for the selected section."
        }
      }
    }
  },
  {
    name: "compare_profile_versions",
    description: "Compare current and proposed LinkedIn profile JSON versions.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "generate_linkedin_copy",
    description: "Generate deterministic profile copy drafts from local profile context and explicit input.",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          enum: ["headline", "about", "experience", "post", "featured", "complete_profile"],
          default: "complete_profile"
        },
        context: {
          type: "string",
          default: ""
        },
        tone: {
          type: "string",
          default: "senior, pragmatic, direct"
        },
        constraints: {
          type: "string",
          default: ""
        }
      }
    }
  },
  {
    name: "export_apply_checklist",
    description: "Write a Markdown checklist with the exact differences to apply manually in LinkedIn.",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          default: "LinkedIn apply checklist"
        }
      }
    }
  },
  {
    name: "review_profile_positioning",
    description: "Review local LinkedIn profile positioning, completeness, and edit readiness.",
    inputSchema: {
      type: "object",
      properties: {
        version: {
          type: "string",
          enum: ["current", "proposed"],
          default: "proposed"
        },
        save: {
          type: "boolean",
          default: false
        }
      }
    }
  },
  {
    name: "scan_professional_evidence",
    description: "Scan configured read-only professional sources and return evidence for positioning work.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          default: ""
        },
        limit: {
          type: "number",
          default: 20
        },
        includeNeutral: {
          type: "boolean",
          default: false
        }
      }
    }
  },
  {
    name: "summarize_technical_skills",
    description: "Summarize technical skills with evidence from configured read-only professional sources.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          default: ""
        },
        limit: {
          type: "number",
          default: 12
        }
      }
    }
  },
  {
    name: "summarize_operational_strengths",
    description: "Summarize operational and soft-skill strengths with evidence from configured sources.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          default: ""
        },
        limit: {
          type: "number",
          default: 12
        }
      }
    }
  },
  {
    name: "extract_profile_signals",
    description: "Extract reusable positioning signals for LinkedIn, site bio, CV, and professional narrative.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          default: ""
        },
        limit: {
          type: "number",
          default: 10
        }
      }
    }
  },
  {
    name: "generate_linkedin_positioning",
    description: "Generate LinkedIn positioning drafts grounded in configured professional evidence.",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          enum: ["headline", "about", "site_bio", "complete"],
          default: "complete"
        },
        context: {
          type: "string",
          default: ""
        }
      }
    }
  },
  {
    name: "build_professional_context_index",
    description: "Build a sanitized professional profile context index from configured read-only sources.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          default: 2000
        }
      }
    }
  },
  {
    name: "refresh_professional_context_index",
    description: "Refresh the sanitized professional context index from the living workspace sources.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          default: 2000
        }
      }
    }
  },
  {
    name: "read_professional_context",
    description: "Read generated sanitized professional context artifacts.",
    inputSchema: {
      type: "object",
      properties: {
        artifact: {
          type: "string",
          enum: ["summary", "evidence", "source_map", "sensitivity", "linkedin", "site_bio", "all"],
          default: "summary"
        }
      }
    }
  },
  {
    name: "summarize_daily_work_patterns",
    description: "Summarize daily work patterns from the sanitized professional context index.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          default: 12
        }
      }
    }
  },
  {
    name: "summarize_facilita_skills",
    description: "Summarize Facilita workspace skills and operating logic from sanitized sources.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          default: 12
        }
      }
    }
  },
  {
    name: "extract_professional_capabilities",
    description: "Extract hard, operational, and soft capabilities from the generated context index.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "extract_case_studies",
    description: "Extract sanitized professional case-study outlines without client or company-sensitive detail.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          default: 8
        }
      }
    }
  },
  {
    name: "generate_linkedin_from_context",
    description: "Generate LinkedIn copy from the latest sanitized professional context index.",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          enum: ["headline", "about", "experience", "complete"],
          default: "complete"
        }
      }
    }
  },
  {
    name: "generate_site_profile_from_context",
    description: "Generate public site profile copy from the latest sanitized professional context index.",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          enum: ["bio", "about", "capabilities", "complete"],
          default: "complete"
        }
      }
    }
  },
  {
    name: "review_public_safety",
    description: "Review generated public profile artifacts for obvious sensitive terms and unsafe references.",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          default: ""
        }
      }
    }
  }
];

const jsonResponse = (id, result) => ({
  jsonrpc: "2.0",
  id,
  result
});

const jsonError = (id, code, message) => ({
  jsonrpc: "2.0",
  id,
  error: {
    code,
    message
  }
});

const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

const ensureDirectory = (directoryPath) => mkdirSync(directoryPath, { recursive: true });

const ensureWorkspace = () => {
  ensureDirectory(linkedinWorkspaceDirectory);
  ensureDirectory(professionalContextDirectory);
  ensureDirectory(workspacePaths.posts);
  ensureDirectory(workspacePaths.reviews);
};

const readTextFile = (filePath) => {
  if (!existsSync(filePath)) return "";

  return readFileSync(filePath, "utf8");
};

const readJsonFile = (filePath, fallback) => {
  if (!existsSync(filePath)) return fallback;

  const content = readFileSync(filePath, "utf8").trim();

  if (content.length === 0) return fallback;

  return JSON.parse(content);
};

const writeJsonFile = (filePath, value) => {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");

  return value;
};

const normalizeProfileVersion = (version) => {
  if (version === "current") return "current";
  if (version === "proposed") return "proposed";

  return "proposed";
};

const profilePathForVersion = (version) => workspacePaths[normalizeProfileVersion(version)];

const readProfile = (version) => readJsonFile(profilePathForVersion(version), defaultProfile);

const timestamp = () => new Date().toISOString();

const fileSafeTimestamp = () => timestamp().replace(/[:.]/g, "-");

const normalizeSectionPath = (section) => String(section || "").split(".").map((segment) => segment.trim()).filter(Boolean);

const setValueAtPath = (source, pathSegments, value) => {
  if (pathSegments.length === 0) return value;

  const [head, ...tail] = pathSegments;

  if (Array.isArray(source)) {
    return source.map((item, index) => {
      if (String(index) === head) return setValueAtPath(item, tail, value);

      return item;
    });
  }

  const nextSource = isRecord(source) ? source : {};

  return {
    ...nextSource,
    [head]: setValueAtPath(nextSource[head], tail, value)
  };
};

const stableStringify = (value) => JSON.stringify(value);

const flattenProfile = (value, prefix = []) => {
  const key = prefix.join(".") || "$";

  if (Array.isArray(value) && value.length === 0) return { [key]: [] };

  if (Array.isArray(value)) {
    return Object.fromEntries(value.flatMap((item, index) => Object.entries(flattenProfile(item, [...prefix, String(index)]))));
  }

  if (isRecord(value) && Object.keys(value).length === 0) return { [key]: {} };

  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).flatMap(([entryKey, entryValue]) => Object.entries(flattenProfile(entryValue, [...prefix, entryKey]))));
  }

  return { [key]: value };
};

const formatValue = (value) => {
  if (value === undefined) return "(missing)";
  if (typeof value === "string") return value;

  return JSON.stringify(value);
};

const buildDiffChanges = (currentProfile, proposedProfile) => {
  const currentFlat = flattenProfile(currentProfile);
  const proposedFlat = flattenProfile(proposedProfile);
  const keys = Array.from(new Set([...Object.keys(currentFlat), ...Object.keys(proposedFlat)])).sort();

  return keys.map((path) => ({
    path,
    current: currentFlat[path],
    proposed: proposedFlat[path]
  })).filter((change) => stableStringify(change.current) !== stableStringify(change.proposed));
};

const renderDiffMarkdown = (changes) => {
  if (changes.length === 0) return "No differences between current and proposed profile.";

  return changes.map((change) => [
    `### ${change.path}`,
    `Current: ${formatValue(change.current)}`,
    `Proposed: ${formatValue(change.proposed)}`
  ].join("\n")).join("\n\n");
};

const compareProfileVersions = () => {
  const currentProfile = readProfile("current");
  const proposedProfile = readProfile("proposed");
  const changes = buildDiffChanges(currentProfile, proposedProfile);

  return {
    changedFields: changes.length,
    changes,
    markdown: renderDiffMarkdown(changes)
  };
};

const firstText = (values) => values.find((value) => typeof value === "string" && value.trim().length > 0) || "";

const profileSignal = (profile, input) => firstText([
  input.context,
  profile.identity?.headline,
  profile.about,
  "engenharia de software, orquestracao de IA e operacao de sistemas juridicos"
]).trim();

const headlineCopy = (input, profile) => {
  const signal = profileSignal(profile, input);

  return [
    `Engenheiro de Software | IA aplicada a operacoes juridicas | ${signal}`,
    `Orquestracao de IA para produto, suporte e operacao juridica | Engenheiro de Software`,
    `Engenheiro de Software no Facilita Juridico | Automacao, observabilidade e agentes de IA`
  ];
};

const aboutCopy = (input, profile) => {
  const signal = profileSignal(profile, input);

  return [
    "Sou Josivan, engenheiro de software no Facilita Juridico. Trabalho na intersecao entre produto, suporte, operacao e IA, com foco em transformar problemas recorrentes em sistemas mais previsiveis, auditaveis e eficientes.",
    `Minha atuacao atual combina ${signal}. No dia a dia, orquestro agentes, reviso decisoes tecnicas, estruturo diagnosticos e ajudo a reduzir friccao operacional em fluxos juridicos digitais.`,
    "Meu foco profissional e construir ferramentas praticas, seguras e sustentaveis: menos improviso, mais observabilidade, melhores criterios de decisao e automacoes que respeitam o contexto real do negocio."
  ].join("\n\n");
};

const experienceCopy = (input, profile) => {
  const signal = profileSignal(profile, input);

  return [
    "Responsavel por apoiar a evolucao tecnica de sistemas juridicos digitais, conectando produto, suporte, dados e operacao.",
    `Atuacao em ${signal}, com enfase em diagnostico de incidentes, automacao de rotinas, revisao de arquitetura e melhoria continua de processos.`,
    "Uso agentes de IA como camada operacional para acelerar investigacoes, documentar decisoes, validar hipoteses e reduzir retrabalho tecnico."
  ];
};

const postCopy = (input, profile) => {
  const signal = profileSignal(profile, input);

  return [
    `Tema: ${signal}`,
    "",
    "Gancho: O maior ganho da IA em engenharia nao esta em escrever codigo mais rapido. Esta em reduzir o custo de entender, decidir e validar.",
    "",
    "Desenvolvimento:",
    "1. Problemas tecnicos raramente sao apenas tecnicos.",
    "2. Contexto, evidencia e criterio de aceite importam mais do que velocidade bruta.",
    "3. Agentes ajudam quando trabalham dentro de um sistema operacional claro.",
    "",
    "Fechamento: A pergunta deixou de ser se a IA consegue executar. A pergunta agora e se o processo humano sabe orientar, revisar e absorver essa execucao."
  ].join("\n");
};

const featuredCopy = () => [
  "Documento de posicionamento: IA aplicada a operacao juridica",
  "Case interno: reducao de retrabalho com agentes e runbooks",
  "Playbook: diagnostico tecnico orientado por evidencias"
];

const completeProfileCopy = (input, profile) => ({
  headline: headlineCopy(input, profile),
  about: aboutCopy(input, profile),
  experienceBullets: experienceCopy(input, profile),
  featured: featuredCopy(),
  post: postCopy(input, profile)
});

const generationStrategies = {
  headline: headlineCopy,
  about: aboutCopy,
  experience: experienceCopy,
  post: postCopy,
  featured: featuredCopy,
  complete_profile: completeProfileCopy
};

const generateLinkedInCopy = (input) => {
  const target = input.target || "complete_profile";
  const profile = readProfile("proposed");
  const generate = generationStrategies[target] || generationStrategies.complete_profile;

  return {
    target,
    tone: input.tone || "senior, pragmatic, direct",
    constraints: input.constraints || "",
    generated: generate(input, profile)
  };
};

const textLength = (value) => String(value || "").trim().length;

const sectionCount = (value) => {
  if (Array.isArray(value)) return value.length;

  return 0;
};

const profileChecks = (profile) => [
  {
    name: "Profile URL",
    passed: textLength(profile.metadata?.profileUrl) > 0,
    recommendation: "Add the public LinkedIn profile URL to metadata.profileUrl."
  },
  {
    name: "Headline",
    passed: textLength(profile.identity?.headline) >= 40 && textLength(profile.identity?.headline) <= 220,
    recommendation: "Use a headline with role, domain, and concrete positioning."
  },
  {
    name: "About",
    passed: textLength(profile.about) >= 500 && textLength(profile.about) <= 2600,
    recommendation: "Write an About section with context, authority, proof, and direction."
  },
  {
    name: "Experience",
    passed: sectionCount(profile.experience) > 0,
    recommendation: "Add at least one experience with concrete responsibilities and outcomes."
  },
  {
    name: "Featured",
    passed: sectionCount(profile.featured) > 0,
    recommendation: "Add featured items that prove the positioning."
  },
  {
    name: "Skills",
    passed: sectionCount(profile.skills) >= 15,
    recommendation: "Add a focused skill set with engineering, AI, product, and operations terms."
  }
];

const renderReviewMarkdown = (version, checks, score) => [
  `# LinkedIn profile review (${version})`,
  "",
  `Score: ${score}/100`,
  "",
  ...checks.map((check) => `- ${check.passed ? "[x]" : "[ ]"} ${check.name}: ${check.recommendation}`)
].join("\n");

const reviewProfilePositioning = (input) => {
  const version = normalizeProfileVersion(input.version);
  const profile = readProfile(version);
  const checks = profileChecks(profile);
  const passed = checks.filter((check) => check.passed).length;
  const score = Math.round((passed / checks.length) * 100);
  const markdown = renderReviewMarkdown(version, checks, score);
  const outputPath = join(workspacePaths.reviews, `profile-review-${fileSafeTimestamp()}.md`);

  if (input.save === true) {
    writeFileSync(outputPath, `${markdown}\n`, "utf8");
  }

  return {
    version,
    score,
    checks,
    savedTo: input.save === true ? outputPath : null,
    markdown
  };
};

const allowedEvidenceExtensions = new Set([".md", ".yaml", ".yml", ".json", ".ps1", ".js", ".ts", ".py", ".sql", ".txt"]);
const blockedEvidenceFileNames = new Set(["package-lock.json", "tsconfig.tsbuildinfo"]);
const highRiskEvidenceExtensions = new Set([".sql", ".json", ".csv", ".log"]);
const sensitiveTerms = [
  "senha",
  "password",
  "token",
  "secret",
  "credential",
  "cpf",
  "cnpj",
  "telefone",
  "email",
  "cliente",
  "customer",
  "transaction",
  "request_id",
  "pedido",
  "whatsapp",
  "twilio",
  "sendgrid",
  "pagar",
  "stripe"
];
const publicBlockedTerms = [
  "cpf",
  "cnpj",
  "senha",
  "password",
  "token",
  "secret",
  "credential",
  "transaction",
  "request_id",
  ".env",
  "bearer "
];
const categoryDefinitions = [
  {
    category: "daily_work",
    patterns: ["workspace/reports/daily", "daily-board"],
    publicLabel: "daily operating rhythm and work summaries"
  },
  {
    category: "skill",
    patterns: [".claude/skills"],
    publicLabel: "agent skills and operating procedures"
  },
  {
    category: "knowledge",
    patterns: ["knowledge/"],
    publicLabel: "workspace knowledge base and system context"
  },
  {
    category: "workflow",
    patterns: ["workflows/"],
    publicLabel: "workflow templates and runbooks"
  },
  {
    category: "incident",
    patterns: ["workspace/incidents", "incidente", "incident"],
    publicLabel: "incident diagnosis and recovery work"
  },
  {
    category: "feature",
    patterns: ["workspace/features", "workspace/specs", "feature"],
    publicLabel: "feature planning and delivery work"
  },
  {
    category: "research",
    patterns: ["workspace/research", "benchmark", "investigation"],
    publicLabel: "technical research and evaluation work"
  },
  {
    category: "support_request",
    patterns: ["workspace/requests", "pedido-"],
    publicLabel: "support request investigation and follow-up"
  },
  {
    category: "active_work",
    patterns: ["workspace/active"],
    publicLabel: "active operational work"
  }
];

const professionalSignalDefinitions = [
  {
    key: "ai_orchestration",
    label: "AI orchestration",
    kind: "technical",
    terms: ["agente", "agentes", "codex", "claude", "ralph", "openai", "anthropic", "llm", "ia", "mcp", "orquestrador"],
    skills: ["AI orchestration", "LLM workflows", "prompt engineering", "agent supervision", "MCP tooling"]
  },
  {
    key: "software_engineering",
    label: "Software engineering",
    kind: "technical",
    terms: ["node", "typescript", "javascript", "python", "powershell", "api", "arquitetura", "frontend", "backend", "repository"],
    skills: ["Node.js", "TypeScript", "JavaScript", "Python", "PowerShell", "API design", "software architecture"]
  },
  {
    key: "observability",
    label: "Observability and incident analysis",
    kind: "technical",
    terms: ["grafana", "loki", "sentry", "observabilidade", "incidente", "diagnostico", "monitor", "dashboard", "logs"],
    skills: ["observability", "incident diagnosis", "Grafana", "Loki", "Sentry", "monitoring"]
  },
  {
    key: "data_safety",
    label: "Data and production safety",
    kind: "technical",
    terms: ["postgresql", "sql", "safe-sql", "read-only", "update", "delete", "schema", "redis", "firestore", "segredo"],
    skills: ["PostgreSQL", "SQL safety", "read-only diagnostics", "Redis", "Firestore", "secure configuration handling"]
  },
  {
    key: "product_operations",
    label: "Product and support operations",
    kind: "operational",
    terms: ["suporte", "feature", "pedido", "cliente", "triagem", "runbook", "workflow", "backlog", "validacao"],
    skills: ["technical support operations", "feature intake", "workflow design", "runbooks", "validation planning"]
  },
  {
    key: "release_discipline",
    label: "Release discipline",
    kind: "operational",
    terms: ["pre-deploy", "pos-deploy", "deploy", "risk-policy", "guardrail", "rollback", "criterio de aceite", "evidencia"],
    skills: ["release validation", "risk management", "deployment discipline", "acceptance criteria", "evidence-based delivery"]
  },
  {
    key: "analytical_communication",
    label: "Analytical communication",
    kind: "soft",
    terms: ["relatorio", "diagnostico", "evidencia", "contexto", "decisao", "executivo", "resposta", "analise"],
    skills: ["analytical writing", "executive communication", "evidence synthesis", "decision framing"]
  },
  {
    key: "ownership",
    label: "Ownership and technical responsibility",
    kind: "soft",
    terms: ["responsavel", "operador", "orquestrador", "rotina diaria", "produtividade", "follow-up", "revisao", "arquitetura"],
    skills: ["ownership", "technical leadership", "operational discipline", "review discipline", "cross-functional judgment"]
  }
];

const normalizeSearchText = (value) => String(value || "").toLowerCase();

const normalizeLimit = (value, fallback, maximum = 5000) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return fallback;

  return Math.max(1, Math.min(maximum, Math.trunc(numericValue)));
};

const uniqueValues = (values) => Array.from(new Set(values.filter(Boolean)));

const hashContent = (content) => createHash("sha256").update(content).digest("hex");

const fileHash = (filePath) => hashContent(readFileSync(filePath));

const fileReferenceId = (sourceName, hash) => `${sourceName}:${hash.slice(0, 16)}`;

const classifyEvidencePath = (relativePath) => {
  const normalizedPath = normalizeSearchText(relativePath.replace(/\\/g, "/"));
  const definition = categoryDefinitions.find((item) => item.patterns.some((pattern) => normalizedPath.includes(normalizeSearchText(pattern))));

  if (definition) return definition;

  return {
    category: "other",
    publicLabel: "workspace artifact"
  };
};

const detectSensitivity = (relativePath, content) => {
  const extension = extname(relativePath).toLowerCase();
  const normalizedText = normalizeSearchText(`${relativePath}\n${content.slice(0, 20000)}`);
  const matchedTerms = sensitiveTerms.filter((term) => normalizedText.includes(term));
  const blockedTerms = publicBlockedTerms.filter((term) => normalizedText.includes(term));
  const extensionRisk = highRiskEvidenceExtensions.has(extension);
  const score = matchedTerms.length + blockedTerms.length * 3 + (extensionRisk ? 2 : 0);
  const level = score >= 8 ? "high" : score >= 3 ? "medium" : "low";

  return {
    level,
    publicSafe: level === "low" && blockedTerms.length === 0,
    reasons: uniqueValues([
      ...(extensionRisk ? [`high-risk extension ${extension}`] : []),
      ...matchedTerms.map((term) => `matched sensitive term ${term}`),
      ...blockedTerms.map((term) => `matched blocked public term ${term}`)
    ])
  };
};

const publicLabelForEvidence = (relativePath) => classifyEvidencePath(relativePath).publicLabel;

const resolveConfiguredRoot = (root) => {
  if (isAbsolute(root)) return resolve(root);

  return resolve(workspaceRoot, root);
};

const isWithinPath = (childPath, parentPath) => {
  const relativePath = relative(parentPath, childPath);

  if (relativePath === "") return true;
  if (relativePath.startsWith("..")) return false;
  if (isAbsolute(relativePath)) return false;

  return true;
};

const readProfessionalSourcesConfig = () => {
  const config = readJsonFile(workspacePaths.professionalSources, defaultProfessionalSources);
  const configuredSources = Array.isArray(config.sources) ? config.sources : [];
  const sources = configuredSources.map((source) => ({
    ...defaultProfessionalSource,
    ...source,
    root: resolveConfiguredRoot(source.root || defaultProfessionalSource.root),
    readOnly: true,
    include: Array.isArray(source.include) ? source.include : defaultProfessionalSource.include,
    exclude: Array.isArray(source.exclude) ? source.exclude : defaultProfessionalSource.exclude,
    maxFiles: normalizeLimit(source.maxFiles, defaultProfessionalSource.maxFiles),
    maxBytesPerFile: Math.max(1000, Number(source.maxBytesPerFile || defaultProfessionalSource.maxBytesPerFile))
  }));

  return {
    ...config,
    sources
  };
};

const readDirectoryEntries = (directoryPath) => {
  try {
    return readdirSync(directoryPath, { withFileTypes: true });
  } catch {
    return [];
  }
};

const readPathStats = (filePath) => {
  try {
    return lstatSync(filePath);
  } catch {
    return null;
  }
};

const relativeEvidencePath = (source, filePath) => relative(source.root, filePath).replace(/\\/g, "/");

const evidencePathSegments = (source, filePath) => relativeEvidencePath(source, filePath).split("/").filter(Boolean);

const isExcludedEvidencePath = (source, filePath) => {
  const segments = evidencePathSegments(source, filePath).map((segment) => segment.toLowerCase());
  const relativePath = segments.join("/");
  const exclusions = uniqueValues([...(source.exclude || []), ...defaultProfessionalSource.exclude]).map((entry) => String(entry).replace(/\\/g, "/").toLowerCase());

  if (segments.some((segment) => exclusions.includes(segment))) return true;
  if (exclusions.some((exclusion) => relativePath === exclusion || relativePath.startsWith(`${exclusion}/`))) return true;

  return false;
};

const isAllowedEvidenceFile = (filePath) => {
  const fileName = filePath.split(/[\\/]/).at(-1).toLowerCase();
  const extension = extname(filePath).toLowerCase();

  if (blockedEvidenceFileNames.has(fileName)) return false;
  if (fileName.includes(".env")) return false;
  if (fileName.includes("credential")) return false;
  if (fileName.includes("secret")) return false;

  return allowedEvidenceExtensions.has(extension);
};

const resolveSourceEntry = (source, includeEntry) => {
  const entryPath = resolve(source.root, includeEntry);

  if (!isWithinPath(entryPath, source.root)) return null;

  return entryPath;
};

const collectFilesFromPath = (entryPath, source) => {
  if (!entryPath) return [];
  if (!existsSync(entryPath)) return [];
  if (!isWithinPath(entryPath, source.root)) return [];
  if (isExcludedEvidencePath(source, entryPath)) return [];

  const stats = readPathStats(entryPath);

  if (!stats) return [];
  if (stats.isSymbolicLink()) return [];
  if (stats.isFile()) return isAllowedEvidenceFile(entryPath) ? [entryPath] : [];
  if (!stats.isDirectory()) return [];

  return readDirectoryEntries(entryPath).flatMap((entry) => collectFilesFromPath(join(entryPath, entry.name), source)).slice(0, source.maxFiles);
};

const collectEvidenceFiles = (source) => {
  if (!existsSync(source.root)) return [];

  const files = (source.include || [])
    .map((includeEntry) => resolveSourceEntry(source, includeEntry))
    .flatMap((entryPath) => collectFilesFromPath(entryPath, source));

  return uniqueValues(files).slice(0, source.maxFiles);
};

const readEvidenceContent = (filePath, maxBytesPerFile) => {
  const content = readFileSync(filePath);

  return content.subarray(0, maxBytesPerFile).toString("utf8");
};

const splitQueryTerms = (query) => normalizeSearchText(query)
  .split(/[\s,;|/]+/)
  .map((term) => term.trim())
  .filter((term) => term.length > 2);

const termOccurrences = (content, term) => {
  const normalizedContent = normalizeSearchText(content);
  const normalizedTerm = normalizeSearchText(term);

  if (normalizedTerm.length === 0) return 0;

  return normalizedContent.split(normalizedTerm).length - 1;
};

const scoreSignal = (content, signal) => signal.terms.reduce((total, term) => total + termOccurrences(content, term), 0);

const extractTitle = (content, filePath) => {
  const titleLine = content.split(/\r?\n/).find((line) => line.trim().startsWith("# "));

  if (titleLine) return titleLine.replace(/^#+\s*/, "").trim();

  return filePath.split(/[\\/]/).at(-1);
};

const excerptForTerms = (content, terms) => {
  const normalizedContent = normalizeSearchText(content);
  const indexes = terms.map((term) => normalizedContent.indexOf(normalizeSearchText(term))).filter((index) => index >= 0).sort((first, second) => first - second);
  const firstIndex = indexes[0] || 0;
  const start = Math.max(0, firstIndex - 180);
  const end = Math.min(content.length, firstIndex + 420);

  return content.slice(start, end).replace(/\s+/g, " ").trim();
};

const evidenceItemFromFile = (source, filePath, queryTerms) => {
  const content = readEvidenceContent(filePath, source.maxBytesPerFile);
  const relativePath = relativeEvidencePath(source, filePath);
  const contentHash = fileHash(filePath);
  const sensitivity = detectSensitivity(relativePath, content);
  const matchedSignals = professionalSignalDefinitions
    .map((signal) => ({
      key: signal.key,
      label: signal.label,
      kind: signal.kind,
      score: scoreSignal(content, signal),
      skills: signal.skills
    }))
    .filter((signal) => signal.score > 0);
  const queryScore = queryTerms.reduce((total, term) => total + termOccurrences(content, term), 0);
  const signalScore = matchedSignals.reduce((total, signal) => total + signal.score, 0);
  const matchedTerms = uniqueValues([...queryTerms, ...matchedSignals.flatMap((signal) => professionalSignalDefinitions.find((definition) => definition.key === signal.key)?.terms || [])]);

  return {
    source: source.name,
    root: source.root,
    referenceId: fileReferenceId(source.name, contentHash),
    relativePath: sensitivity.publicSafe ? relativePath : null,
    category: classifyEvidencePath(relativePath).category,
    publicLabel: publicLabelForEvidence(relativePath),
    title: sensitivity.publicSafe ? extractTitle(content, filePath) : publicLabelForEvidence(relativePath),
    score: signalScore + queryScore * 3,
    queryScore,
    sensitivity,
    matchedSignals,
    excerpt: sensitivity.publicSafe ? excerptForTerms(content, matchedTerms) : ""
  };
};

const scanProfessionalEvidence = (input = {}) => {
  const limit = normalizeLimit(input.limit, 20);
  const queryTerms = splitQueryTerms(input.query);
  const sources = readProfessionalSourcesConfig().sources;
  const evidence = sources
    .flatMap((source) => collectEvidenceFiles(source).map((filePath) => evidenceItemFromFile(source, filePath, queryTerms)))
    .filter((item) => input.includeNeutral === true || item.score > 0)
    .sort((first, second) => second.score - first.score);

  return {
    sources: sources.map((source) => ({
      name: source.name,
      root: source.root,
      readOnly: true,
      exists: existsSync(source.root),
      includeCount: source.include.length
    })),
    totalEvidence: evidence.length,
    evidence: evidence.slice(0, limit)
  };
};

const summarizeSignalGroups = (evidence, kinds) => professionalSignalDefinitions
  .filter((signal) => kinds.includes(signal.kind))
  .map((signal) => {
    const relatedEvidence = evidence.filter((item) => item.matchedSignals.some((matchedSignal) => matchedSignal.key === signal.key));

    return {
      key: signal.key,
      label: signal.label,
      kind: signal.kind,
      skills: signal.skills,
      evidenceCount: relatedEvidence.length,
      evidence: relatedEvidence.slice(0, 5).map((item) => ({
        source: item.source,
        relativePath: item.relativePath,
        title: item.title,
        score: item.score
      }))
    };
  })
  .filter((group) => group.evidenceCount > 0);

const summarizeTechnicalSkills = (input = {}) => {
  const evidenceScan = scanProfessionalEvidence({ ...input, limit: 80 });
  const groups = summarizeSignalGroups(evidenceScan.evidence, ["technical"]);

  return {
    recommendedSkills: uniqueValues(groups.flatMap((group) => group.skills)),
    groups,
    supportingEvidence: evidenceScan.evidence.slice(0, normalizeLimit(input.limit, 12))
  };
};

const summarizeOperationalStrengths = (input = {}) => {
  const evidenceScan = scanProfessionalEvidence({ ...input, limit: 80 });
  const groups = summarizeSignalGroups(evidenceScan.evidence, ["operational", "soft"]);

  return {
    strengths: groups.map((group) => group.label),
    groups,
    supportingEvidence: evidenceScan.evidence.slice(0, normalizeLimit(input.limit, 12))
  };
};

const extractProfileSignals = (input = {}) => {
  const evidenceScan = scanProfessionalEvidence({ ...input, limit: 80 });
  const technical = summarizeSignalGroups(evidenceScan.evidence, ["technical"]);
  const operational = summarizeSignalGroups(evidenceScan.evidence, ["operational"]);
  const soft = summarizeSignalGroups(evidenceScan.evidence, ["soft"]);
  const limit = normalizeLimit(input.limit, 10);

  return {
    positioning: "Engenheiro de software que combina arquitetura, operacao, suporte tecnico, observabilidade e orquestracao de IA para transformar problemas recorrentes em sistemas mais previsiveis.",
    hardSkills: uniqueValues(technical.flatMap((group) => group.skills)),
    operationalStrengths: uniqueValues(operational.flatMap((group) => group.skills)),
    softSkills: uniqueValues(soft.flatMap((group) => group.skills)),
    proofPoints: evidenceScan.evidence.slice(0, limit).map((item) => ({
      source: item.source,
      relativePath: item.relativePath,
      title: item.title,
      excerpt: item.excerpt
    })),
    signalGroups: {
      technical,
      operational,
      soft
    }
  };
};

const generateLinkedInPositioning = (input = {}) => {
  const signals = extractProfileSignals({ query: input.context || "", limit: 8 });

  return {
    target: input.target || "complete",
    headlineOptions: [
      "Engenheiro de Software | IA aplicada a operacoes juridicas | Observabilidade, suporte tecnico e automacao",
      "Software Engineer no Facilita Juridico | Orquestracao de IA, produto e operacao tecnica",
      "Engenharia de Software, agentes de IA e operacao juridica digital"
    ],
    about: [
      "Sou Josivan, engenheiro de software no Facilita Juridico. Trabalho na intersecao entre produto, suporte, operacao e IA, conectando diagnostico tecnico, criterio de decisao e execucao assistida por agentes.",
      "Minha rotina envolve investigar problemas reais de operacao, estruturar evidencias, revisar arquitetura, criar runbooks e transformar recorrencias em processos mais seguros e observaveis.",
      "Meu diferencial esta em combinar profundidade tecnica com responsabilidade operacional: entender o sistema, reduzir risco, comunicar com clareza e usar IA como alavanca de produtividade sem perder controle humano."
    ].join("\n\n"),
    siteBio: "Engenheiro de software focado em IA aplicada, automacao operacional, observabilidade e sistemas juridicos digitais.",
    skills: uniqueValues([...signals.hardSkills, ...signals.operationalStrengths, ...signals.softSkills]),
    evidence: signals.proofPoints
  };
};

const buildSourceMapEntry = (source, filePath) => {
  const stats = readPathStats(filePath);
  const contentHash = fileHash(filePath);
  const relativePath = relativeEvidencePath(source, filePath);
  const content = readEvidenceContent(filePath, source.maxBytesPerFile);
  const sensitivity = detectSensitivity(relativePath, content);
  const category = classifyEvidencePath(relativePath);

  return {
    referenceId: fileReferenceId(source.name, contentHash),
    source: source.name,
    sourceRoot: source.root,
    relativePath,
    hash: contentHash,
    size: stats?.size || 0,
    modifiedAt: stats?.mtime?.toISOString?.() || null,
    category: category.category,
    publicLabel: category.publicLabel,
    sensitivity
  };
};

const sanitizeEvidenceForIndex = (entry) => ({
  referenceId: entry.referenceId,
  source: entry.source,
  category: entry.category,
  publicLabel: entry.publicLabel,
  modifiedAt: entry.modifiedAt,
  sensitivityLevel: entry.sensitivity.level,
  publicSafe: entry.sensitivity.publicSafe
});

const buildProfessionalEvidenceEntry = (sourceMapEntry, evidenceItem) => ({
  ...sanitizeEvidenceForIndex(sourceMapEntry),
  score: evidenceItem.score,
  queryScore: evidenceItem.queryScore,
  signals: evidenceItem.matchedSignals.map((signal) => ({
    key: signal.key,
    label: signal.label,
    kind: signal.kind,
    score: signal.score,
    skills: signal.skills
  }))
});

const aggregateCapabilities = (evidenceIndex) => {
  const signalGroups = professionalSignalDefinitions.map((signal) => {
    const evidence = evidenceIndex.filter((item) => item.signals.some((matchedSignal) => matchedSignal.key === signal.key));

    return {
      key: signal.key,
      label: signal.label,
      kind: signal.kind,
      skills: signal.skills,
      evidenceCount: evidence.length,
      referenceIds: evidence.slice(0, 12).map((item) => item.referenceId)
    };
  }).filter((group) => group.evidenceCount > 0);

  return {
    hardSkills: uniqueValues(signalGroups.filter((group) => group.kind === "technical").flatMap((group) => group.skills)),
    operationalSkills: uniqueValues(signalGroups.filter((group) => group.kind === "operational").flatMap((group) => group.skills)),
    softSkills: uniqueValues(signalGroups.filter((group) => group.kind === "soft").flatMap((group) => group.skills)),
    signalGroups
  };
};

const summarizeCategoryCounts = (sourceMap) => Object.values(sourceMap.reduce((accumulator, entry) => ({
  ...accumulator,
  [entry.category]: {
    category: entry.category,
    publicLabel: entry.publicLabel,
    count: (accumulator[entry.category]?.count || 0) + 1
  }
}), {})).sort((first, second) => second.count - first.count);

const sensitivitySummary = (sourceMap) => Object.values(sourceMap.reduce((accumulator, entry) => ({
  ...accumulator,
  [entry.sensitivity.level]: {
    level: entry.sensitivity.level,
    count: (accumulator[entry.sensitivity.level]?.count || 0) + 1
  }
}), {})).sort((first, second) => second.count - first.count);

const renderProfileContextMarkdown = (metadata, capabilities, categories) => [
  "# Professional Context",
  "",
  `Generated at: ${metadata.generatedAt}`,
  `Sources scanned: ${metadata.sourcesScanned}`,
  `Files indexed: ${metadata.filesIndexed}`,
  "",
  "## Positioning",
  "",
  "Josivan is a software engineer focused on AI orchestration, technical operations, observability, support workflows, and production-safe delivery in legal technology systems.",
  "",
  "## Hard Skills",
  "",
  ...capabilities.hardSkills.map((skill) => `- ${skill}`),
  "",
  "## Operational Strengths",
  "",
  ...capabilities.operationalSkills.map((skill) => `- ${skill}`),
  "",
  "## Soft Skills",
  "",
  ...capabilities.softSkills.map((skill) => `- ${skill}`),
  "",
  "## Evidence Categories",
  "",
  ...categories.map((category) => `- ${category.publicLabel}: ${category.count}`),
  "",
  "## Public-Safety Rule",
  "",
  "Use this file as a safe summary. Do not publish internal file paths, client names, logs, SQL, tickets, tokens, or Facilita Juridico operational details."
].join("\n");

const renderLinkedInMarkdown = (capabilities) => [
  "# LinkedIn Positioning",
  "",
  "## Headline Options",
  "",
  "- Engenheiro de Software | IA aplicada a operacoes juridicas | Observabilidade, suporte tecnico e automacao",
  "- Software Engineer no Facilita Juridico | Orquestracao de IA, produto e operacao tecnica",
  "- Engenharia de Software, agentes de IA e operacao juridica digital",
  "",
  "## About Draft",
  "",
  "Sou Josivan, engenheiro de software no Facilita Juridico. Trabalho na intersecao entre produto, suporte, operacao e IA, conectando diagnostico tecnico, criterio de decisao e execucao assistida por agentes.",
  "",
  "Minha rotina envolve investigar problemas reais de operacao, estruturar evidencias, revisar arquitetura, criar runbooks e transformar recorrencias em processos mais seguros e observaveis.",
  "",
  "Meu diferencial esta em combinar profundidade tecnica com responsabilidade operacional: entender o sistema, reduzir risco, comunicar com clareza e usar IA como alavanca de produtividade sem perder controle humano.",
  "",
  "## Skills",
  "",
  ...uniqueValues([...capabilities.hardSkills, ...capabilities.operationalSkills, ...capabilities.softSkills]).map((skill) => `- ${skill}`)
].join("\n");

const renderSiteBioMarkdown = (capabilities) => [
  "# Site Bio",
  "",
  "Engenheiro de software focado em IA aplicada, automacao operacional, observabilidade e sistemas juridicos digitais.",
  "",
  "Atua conectando arquitetura, suporte tecnico, produto e operacao para transformar problemas recorrentes em sistemas mais previsiveis, auditaveis e seguros.",
  "",
  "## Capability Themes",
  "",
  ...uniqueValues([...capabilities.hardSkills, ...capabilities.operationalSkills, ...capabilities.softSkills]).slice(0, 24).map((skill) => `- ${skill}`)
].join("\n");

const buildProfessionalContextIndex = (input = {}) => {
  ensureWorkspace();

  const limit = normalizeLimit(input.limit, 2000);
  const sources = readProfessionalSourcesConfig().sources;
  const sourceMap = sources.flatMap((source) => collectEvidenceFiles(source).slice(0, limit).map((filePath) => buildSourceMapEntry(source, filePath)));
  const evidenceItems = sources.flatMap((source) => collectEvidenceFiles(source).slice(0, limit).map((filePath) => evidenceItemFromFile(source, filePath, [])));
  const evidenceByReference = Object.fromEntries(evidenceItems.map((item) => [item.referenceId, item]));
  const professionalEvidenceIndex = sourceMap
    .map((entry) => buildProfessionalEvidenceEntry(entry, evidenceByReference[entry.referenceId] || { score: 0, queryScore: 0, matchedSignals: [] }))
    .filter((entry) => entry.signals.length > 0)
    .sort((first, second) => second.score - first.score);
  const capabilities = aggregateCapabilities(professionalEvidenceIndex);
  const categories = summarizeCategoryCounts(sourceMap);
  const metadata = {
    generatedAt: timestamp(),
    workspaceRoot,
    contextDirectory: professionalContextDirectory,
    sourcesScanned: sources.length,
    filesIndexed: sourceMap.length,
    evidenceItems: professionalEvidenceIndex.length,
    categories,
    sensitivity: sensitivitySummary(sourceMap)
  };
  const sensitivityReview = {
    metadata,
    items: sourceMap.filter((entry) => entry.sensitivity.level !== "low").map((entry) => ({
      referenceId: entry.referenceId,
      source: entry.source,
      relativePath: entry.relativePath,
      category: entry.category,
      sensitivity: entry.sensitivity
    }))
  };
  const profileContextMarkdown = renderProfileContextMarkdown(metadata, capabilities, categories);
  const linkedInMarkdown = renderLinkedInMarkdown(capabilities);
  const siteBioMarkdown = renderSiteBioMarkdown(capabilities);

  writeJsonFile(workspacePaths.contextSourceMap, {
    metadata,
    items: sourceMap
  });
  writeJsonFile(workspacePaths.contextEvidenceIndex, {
    metadata,
    capabilities,
    items: professionalEvidenceIndex
  });
  writeJsonFile(workspacePaths.contextSensitivityReview, sensitivityReview);
  writeFileSync(workspacePaths.contextProfile, `${profileContextMarkdown}\n`, "utf8");
  writeFileSync(workspacePaths.contextLinkedIn, `${linkedInMarkdown}\n`, "utf8");
  writeFileSync(workspacePaths.contextSiteBio, `${siteBioMarkdown}\n`, "utf8");

  return {
    metadata,
    capabilities,
    artifacts: {
      sourceMap: workspacePaths.contextSourceMap,
      evidenceIndex: workspacePaths.contextEvidenceIndex,
      sensitivityReview: workspacePaths.contextSensitivityReview,
      profileContext: workspacePaths.contextProfile,
      linkedIn: workspacePaths.contextLinkedIn,
      siteBio: workspacePaths.contextSiteBio
    }
  };
};

const refreshProfessionalContextIndex = (input = {}) => buildProfessionalContextIndex(input);

const readProfessionalContext = (input = {}) => {
  const artifact = input.artifact || "summary";
  const readers = {
    summary: () => readTextFile(workspacePaths.contextProfile),
    evidence: () => readJsonFile(workspacePaths.contextEvidenceIndex, {}),
    source_map: () => readJsonFile(workspacePaths.contextSourceMap, {}),
    sensitivity: () => readJsonFile(workspacePaths.contextSensitivityReview, {}),
    linkedin: () => readTextFile(workspacePaths.contextLinkedIn),
    site_bio: () => readTextFile(workspacePaths.contextSiteBio),
    all: () => ({
      summary: readTextFile(workspacePaths.contextProfile),
      evidence: readJsonFile(workspacePaths.contextEvidenceIndex, {}),
      sensitivity: readJsonFile(workspacePaths.contextSensitivityReview, {}),
      linkedin: readTextFile(workspacePaths.contextLinkedIn),
      siteBio: readTextFile(workspacePaths.contextSiteBio)
    })
  };
  const read = readers[artifact] || readers.summary;

  return {
    artifact,
    content: read()
  };
};

const readEvidenceIndex = () => readJsonFile(workspacePaths.contextEvidenceIndex, {
  metadata: {},
  capabilities: {
    hardSkills: [],
    operationalSkills: [],
    softSkills: [],
    signalGroups: []
  },
  items: []
});

const categoryItems = (categories, limit) => {
  const index = readEvidenceIndex();
  const normalizedCategories = categories.map((category) => normalizeSearchText(category));

  return index.items
    .filter((item) => normalizedCategories.includes(normalizeSearchText(item.category)))
    .slice(0, normalizeLimit(limit, 12));
};

const summarizeDailyWorkPatterns = (input = {}) => {
  const items = categoryItems(["daily_work", "active_work"], input.limit);
  const capabilities = aggregateCapabilities(items);

  return {
    patterns: [
      "daily prioritization and follow-up",
      "support and incident triage",
      "evidence-driven technical diagnosis",
      "agent-assisted execution and review",
      "post-change validation and operational communication"
    ],
    capabilities,
    evidence: items.map((item) => ({
      referenceId: item.referenceId,
      category: item.category,
      publicLabel: item.publicLabel,
      signals: item.signals.map((signal) => signal.label)
    }))
  };
};

const summarizeFacilitaSkills = (input = {}) => {
  const items = categoryItems(["skill", "workflow", "knowledge"], input.limit);
  const capabilities = aggregateCapabilities(items);

  return {
    operatingLogic: [
      "structured intake before execution",
      "risk-aware production changes",
      "read-only diagnosis before write operations",
      "documented acceptance criteria",
      "agent orchestration with human review"
    ],
    capabilities,
    evidence: items.map((item) => ({
      referenceId: item.referenceId,
      category: item.category,
      publicLabel: item.publicLabel,
      signals: item.signals.map((signal) => signal.label)
    }))
  };
};

const extractProfessionalCapabilities = () => {
  const index = readEvidenceIndex();

  return {
    generatedAt: index.metadata.generatedAt || null,
    hardSkills: index.capabilities.hardSkills || [],
    operationalSkills: index.capabilities.operationalSkills || [],
    softSkills: index.capabilities.softSkills || [],
    signalGroups: index.capabilities.signalGroups || []
  };
};

const extractCaseStudies = (input = {}) => {
  const limit = normalizeLimit(input.limit, 8);
  const index = readEvidenceIndex();
  const caseStudyCategories = ["incident", "feature", "research", "support_request"];

  return {
    caseStudies: index.items
      .filter((item) => caseStudyCategories.includes(item.category))
      .slice(0, limit)
      .map((item) => ({
        referenceId: item.referenceId,
        theme: item.publicLabel,
        publicProblem: "Complex operational or technical issue in a legal technology environment.",
        publicAction: "Structured context, evidence, risk, implementation, and validation with agent-assisted workflows.",
        publicResult: "Safer diagnosis, clearer decisions, reusable workflows, and reduced operational ambiguity.",
        capabilities: uniqueValues(item.signals.flatMap((signal) => signal.skills)),
        safety: "No client, ticket, SQL, log, or company-sensitive detail included."
      }))
  };
};

const generateLinkedInFromContext = (input = {}) => {
  const index = readEvidenceIndex();
  const capabilities = index.capabilities || {};
  const output = {
    headlineOptions: [
      "Engenheiro de Software | IA aplicada a operacoes juridicas | Observabilidade, suporte tecnico e automacao",
      "Software Engineer no Facilita Juridico | Orquestracao de IA, produto e operacao tecnica",
      "Engenharia de Software, agentes de IA e operacao juridica digital"
    ],
    about: readTextFile(workspacePaths.contextLinkedIn).split("## About Draft").at(1)?.split("## Skills").at(0)?.trim() || "",
    experienceBullets: [
      "Orquestro agentes de IA para acelerar diagnosticos, documentar contexto, revisar hipoteses e apoiar decisoes tecnicas.",
      "Atuo em incidentes, suporte tecnico, observabilidade, validacao pos-mudanca e melhoria de workflows operacionais.",
      "Transformo recorrencias em runbooks, criterios de aceite, scripts e mecanismos de controle mais previsiveis."
    ],
    skills: uniqueValues([...(capabilities.hardSkills || []), ...(capabilities.operationalSkills || []), ...(capabilities.softSkills || [])])
  };

  return {
    target: input.target || "complete",
    output
  };
};

const generateSiteProfileFromContext = (input = {}) => {
  const capabilities = extractProfessionalCapabilities();
  const output = {
    bio: "Engenheiro de software focado em IA aplicada, automacao operacional, observabilidade e sistemas juridicos digitais.",
    about: "Atuo conectando arquitetura, suporte tecnico, produto e operacao para transformar problemas recorrentes em sistemas mais previsiveis, auditaveis e seguros.",
    capabilities: uniqueValues([...capabilities.hardSkills, ...capabilities.operationalSkills, ...capabilities.softSkills]).slice(0, 24)
  };

  return {
    target: input.target || "complete",
    output
  };
};

const reviewPublicSafety = (input = {}) => {
  const generatedTexts = [
    input.text || "",
    readTextFile(workspacePaths.contextLinkedIn),
    readTextFile(workspacePaths.contextSiteBio)
  ].join("\n");
  const normalizedText = normalizeSearchText(generatedTexts);
  const matches = publicBlockedTerms.filter((term) => normalizedText.includes(term));
  const unsafePathPattern = /C:\\Users\\|facilita-suporte\\workspace\\|workspace\/(incidents|requests|active)\//i;
  const pathMatch = unsafePathPattern.test(generatedTexts);

  return {
    publicSafe: matches.length === 0 && !pathMatch,
    matchedTerms: matches,
    matchedInternalPath: pathMatch,
    recommendation: matches.length === 0 && !pathMatch ? "Content appears safe for public profile drafting." : "Remove blocked terms, internal paths, client details, IDs, logs, SQL, and operational specifics before publishing."
  };
};

const readCurrentProfile = (input) => {
  if (input.version === "both") {
    return {
      current: readProfile("current"),
      proposed: readProfile("proposed"),
      source: input.includeSource === true ? readTextFile(workspacePaths.source) : undefined
    };
  }

  const version = normalizeProfileVersion(input.version || "current");

  return {
    version,
    profile: readProfile(version),
    source: input.includeSource === true ? readTextFile(workspacePaths.source) : undefined
  };
};

const updateProfileSection = (input) => {
  const version = normalizeProfileVersion(input.version);
  const sectionPath = normalizeSectionPath(input.section);

  if (sectionPath.length === 0) {
    throw new Error("section is required.");
  }

  const updatedAt = timestamp();
  const profile = readProfile(version);
  const updatedProfile = setValueAtPath(profile, sectionPath, input.value);
  const profileWithMetadata = {
    ...updatedProfile,
    metadata: {
      ...(isRecord(updatedProfile.metadata) ? updatedProfile.metadata : {}),
      lastUpdatedAt: updatedAt,
      lastUpdatedSection: input.section
    }
  };

  writeJsonFile(profilePathForVersion(version), profileWithMetadata);

  return {
    version,
    section: input.section,
    updatedAt,
    profile: profileWithMetadata
  };
};

const exportApplyChecklist = (input) => {
  const comparison = compareProfileVersions();
  const title = input.title || "LinkedIn apply checklist";
  const outputPath = join(workspacePaths.reviews, `apply-checklist-${fileSafeTimestamp()}.md`);
  const checklistItems = comparison.changes.map((change) => `- [ ] Update ${change.path}`);
  const markdown = [
    `# ${title}`,
    "",
    `Generated at: ${timestamp()}`,
    `Changed fields: ${comparison.changedFields}`,
    "",
    "## Checklist",
    "",
    ...(checklistItems.length > 0 ? checklistItems : ["- [ ] No profile differences to apply."]),
    "",
    "## Details",
    "",
    comparison.markdown
  ].join("\n");

  writeFileSync(outputPath, `${markdown}\n`, "utf8");

  return {
    path: outputPath,
    changedFields: comparison.changedFields,
    markdown
  };
};

const toolHandlers = {
  read_current_profile: readCurrentProfile,
  update_profile_section: updateProfileSection,
  compare_profile_versions: compareProfileVersions,
  generate_linkedin_copy: generateLinkedInCopy,
  export_apply_checklist: exportApplyChecklist,
  review_profile_positioning: reviewProfilePositioning,
  scan_professional_evidence: scanProfessionalEvidence,
  summarize_technical_skills: summarizeTechnicalSkills,
  summarize_operational_strengths: summarizeOperationalStrengths,
  extract_profile_signals: extractProfileSignals,
  generate_linkedin_positioning: generateLinkedInPositioning,
  build_professional_context_index: buildProfessionalContextIndex,
  refresh_professional_context_index: refreshProfessionalContextIndex,
  read_professional_context: readProfessionalContext,
  summarize_daily_work_patterns: summarizeDailyWorkPatterns,
  summarize_facilita_skills: summarizeFacilitaSkills,
  extract_professional_capabilities: extractProfessionalCapabilities,
  extract_case_studies: extractCaseStudies,
  generate_linkedin_from_context: generateLinkedInFromContext,
  generate_site_profile_from_context: generateSiteProfileFromContext,
  review_public_safety: reviewPublicSafety
};

const renderToolResult = (value) => {
  if (typeof value === "string") return value;

  return JSON.stringify(value, null, 2);
};

const handleInitialize = (params) => ({
  protocolVersion: params.protocolVersion || "2024-11-05",
  capabilities: {
    tools: {}
  },
  serverInfo: {
    name: "facilita-linkedin-profile-mcp",
    version: "0.1.0"
  }
});

const handleToolsList = () => ({
  tools: toolDefinitions
});

const handleToolsCall = (params) => {
  const toolName = params.name;
  const tool = toolHandlers[toolName];

  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  const output = tool(params.arguments || {});

  return {
    content: [
      {
        type: "text",
        text: renderToolResult(output)
      }
    ],
    structuredContent: output
  };
};

const requestHandlers = {
  initialize: handleInitialize,
  "tools/list": handleToolsList,
  "tools/call": handleToolsCall,
  ping: () => ({})
};

const sendMessage = (message) => {
  const body = JSON.stringify(message);
  const header = `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n`;

  process.stdout.write(`${header}${body}`);
};

const handleRequest = (message) => {
  if (!isRecord(message)) return;
  if (message.id === undefined || message.id === null) return;

  const handler = requestHandlers[message.method];

  if (!handler) {
    sendMessage(jsonError(message.id, -32601, `Method not found: ${message.method}`));

    return;
  }

  try {
    sendMessage(jsonResponse(message.id, handler(message.params || {})));

    return;
  } catch (error) {
    sendMessage(jsonError(message.id, -32603, error.message || "Internal error"));
  }
};

const readNextMessage = (buffer) => {
  const separator = "\r\n\r\n";
  const content = buffer.toString("utf8");
  const headerEndIndex = content.indexOf(separator);

  if (headerEndIndex === -1) return null;

  const header = content.slice(0, headerEndIndex);
  const lengthMatch = header.match(/Content-Length:\s*(\d+)/i);

  if (!lengthMatch) {
    throw new Error("Missing Content-Length header.");
  }

  const bodyStart = headerEndIndex + separator.length;
  const bodyLength = Number(lengthMatch[1]);
  const bodyEnd = bodyStart + bodyLength;

  if (buffer.length < bodyEnd) return null;

  return {
    body: buffer.subarray(bodyStart, bodyEnd).toString("utf8"),
    remaining: buffer.subarray(bodyEnd)
  };
};

const drainMessages = (state) => {
  const nextMessage = readNextMessage(state.buffer);

  if (!nextMessage) return state;

  handleRequest(JSON.parse(nextMessage.body));

  return drainMessages({
    buffer: nextMessage.remaining
  });
};

const startServer = () => {
  let state = {
    buffer: Buffer.alloc(0)
  };

  process.stdin.on("data", (chunk) => {
    state = drainMessages({
      buffer: Buffer.concat([state.buffer, chunk])
    });
  });

  process.stdin.resume();
};

const runSmoke = () => {
  ensureWorkspace();

  const tools = handleToolsList().tools.map((tool) => tool.name);
  const comparison = compareProfileVersions();
  const review = reviewProfilePositioning({ version: "proposed", save: false });

  process.stdout.write(JSON.stringify({
    workspaceRoot,
    linkedinWorkspaceDirectory,
    tools,
    changedFields: comparison.changedFields,
    reviewScore: review.score
  }, null, 2));
};

ensureWorkspace();

if (process.argv.includes("--smoke")) {
  runSmoke();
  process.exit(0);
}

startServer();
