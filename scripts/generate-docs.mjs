import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow,
  TableCell, WidthType, AlignmentType, BorderStyle, ShadingType,
  PageBreak, TabStopPosition, TabStopType, Header, Footer,
} from "docx";
import { writeFileSync, mkdirSync } from "fs";

const BRAND = { primary: "4F46E5", dark: "0F172A", accent: "7C3AED", white: "FFFFFF", gray: "94A3B8", light: "E2E8F0" };

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, spacing: { before: 300, after: 100 }, children: [new TextRun({ text, bold: true, color: BRAND.primary, font: "Calibri" })] });
}
function para(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, size: 22, font: "Calibri", color: opts.color || "333333", ...opts })] });
}
function bullet(text, opts = {}) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text, size: 22, font: "Calibri", ...opts })] });
}
function boldPara(label, text) {
  return new Paragraph({ spacing: { after: 120 }, children: [
    new TextRun({ text: label, bold: true, size: 22, font: "Calibri" }),
    new TextRun({ text, size: 22, font: "Calibri" }),
  ]});
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map(c => new TableCell({
      shading: isHeader ? { type: ShadingType.SOLID, color: BRAND.primary } : undefined,
      children: [new Paragraph({ children: [new TextRun({ text: c, bold: isHeader, size: 20, font: "Calibri", color: isHeader ? BRAND.white : "333333" })] })],
      width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
    })),
  });
}

function simpleTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [tableRow(headers, true), ...rows.map(r => tableRow(r))],
  });
}

// ─── EXECUTIVE BRIEF ───
function buildExecutiveBrief() {
  return new Document({
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [{
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "ELEVATE LEARNING WITH AI  |  Executive Brief", italics: true, size: 18, color: BRAND.gray })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Confidential  |  © 2026 Elevate Learning", size: 16, color: BRAND.gray })] })] }) },
      children: [
        new Paragraph({ spacing: { after: 0 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 100 }, children: [new TextRun({ text: "ELEVATE LEARNING WITH AI", bold: true, size: 52, color: BRAND.primary, font: "Calibri" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Transforming Institutional Learning Through Intelligent Collaboration", size: 28, color: BRAND.gray, font: "Calibri" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "Executive Brief  |  2026", size: 24, color: BRAND.accent, font: "Calibri" })] }),

        heading("Executive Summary"),
        para("Higher education is at an inflection point. Institutions face mounting pressure from declining student outcomes, rising operational costs, inconsistent assessment practices, and a generation of learners who have already adopted AI tools without institutional guidance. The question is no longer whether AI will reshape education — it is whether institutions will lead that transformation or be disrupted by it."),
        para("Elevate Learning with AI is a purpose-built SaaS platform that embeds artificial intelligence directly into the learning process — not as an answer machine, but as an intelligent collaborator that teaches students how to think, not what to think. It provides institutions with real-time visibility into student learning behaviors, automates the most time-consuming aspects of assessment, and creates a defensible framework for AI-assisted learning that preserves academic integrity."),
        para("The result: students learn more deeply, instructors reclaim time for high-impact teaching, and institutions gain a measurable, auditable system that demonstrates learning effectiveness to accreditors, boards, and stakeholders."),

        heading("The Problem: What Current eLearning Gets Wrong"),
        heading("1. The Assessment Bottleneck", HeadingLevel.HEADING_2),
        para("Traditional learning management systems (Canvas, Blackboard, Moodle) were designed as content delivery and grade recording platforms — not learning intelligence systems. Instructors spend an average of 11–15 hours per week on grading and administrative tasks, leaving limited time for mentorship and feedback that actually move the needle on student outcomes."),
        para("Current automated grading tools assess outputs — the final answer — while ignoring the process by which a student arrived at that answer. An institution cannot distinguish between a student who deeply understands a concept and one who copied a correct answer."),

        heading("2. The AI Integrity Crisis", HeadingLevel.HEADING_2),
        para("ChatGPT and similar tools have made it trivially easy for students to generate submissions without genuine engagement. A 2024 Stanford study found that 67% of undergraduate students report using generative AI on coursework, yet only 12% of institutions have formal policies guiding productive AI use. This policy vacuum creates risk — integrity violations, inconsistent enforcement, and a widening gap between what students do and what institutions measure."),

        heading("3. The Visibility Gap", HeadingLevel.HEADING_2),
        para("When a student submits a paper, the instructor sees a finished product. They do not see how long the student struggled, whether they asked productive questions, at what point understanding broke down, or how their reasoning evolved. Instructors are grading artifacts instead of learning."),

        heading("4. One-Size-Fits-All Pedagogy", HeadingLevel.HEADING_2),
        para("Every student learns differently, yet most eLearning platforms deliver the same content to every student. Instructors have no practical way to provide individualized guidance at scale."),

        heading("The Solution: How Elevate Closes These Gaps"),
        simpleTable(
          ["Dimension", "Traditional LMS", "Elevate Learning"],
          [
            ["What is graded", "Final submission only", "Process (60%), AI interaction quality (30%), correctness (10%)"],
            ["AI role", "Banned or uncontrolled", "Structured collaborator with guardrails"],
            ["Instructor workload", "Manual grading, 11–15 hrs/week", "AI pre-grades; instructor reviews and finalizes"],
            ["Student visibility", "Grade + optional comments", "Full scorecard: AI score, breakdown, feedback"],
            ["Process evidence", "None", "Complete interaction transcript, duration, go-backs"],
            ["Academic integrity", "Plagiarism detection (reactive)", "AI interaction capture (proactive)"],
            ["Personalization", "None", "3 AI tutor styles, adaptive, weekly goals"],
            ["Completed work", "Final file only", "Attached file + full AI collaboration record"],
          ]
        ),

        heading("AI Integration: Purposeful, Not Performative"),
        heading("AI Tutors — Teaching Students to Think", HeadingLevel.HEADING_2),
        para("Three distinct AI tutor personalities are bound by strict pedagogical guardrails: they never provide direct answers, adapt to the student's level, and encourage metacognition. Students who engage with the tutor must demonstrate understanding to progress."),

        heading("AI Grading — Measuring What Matters", HeadingLevel.HEADING_2),
        simpleTable(
          ["Component", "Weight", "What It Captures"],
          [
            ["Problem-Solving Ability", "60%", "Did the student decompose the problem, show progressive reasoning, recover from mistakes?"],
            ["AI Competency", "30%", "Did the student ask productive questions and use AI guidance effectively?"],
            ["Correctness", "10%", "Was the final answer or conclusion accurate?"],
          ]
        ),

        heading("Completed Work + Redo Workflow", HeadingLevel.HEADING_2),
        para("Students must attach their completed assignment file when submitting. Instructors can download and review the actual work alongside the AI interaction transcript. If the work is insufficient, instructors can request a redo with an explanation — the student is notified and can rework and resubmit."),

        heading("Value for Institutional Stakeholders"),
        boldPara("Provost / VP of Academic Affairs: ", "Every assignment produces a structured competency breakdown with supporting process evidence — exactly what accreditors (HLC, SACSCOC, MSCHE, WASC) demand."),
        boldPara("CIO / VP of Technology: ", "Brings shadow AI usage into a sanctioned, monitored environment. All data stored in your institution's database. Integrates with existing LMS via LTI 1.3."),
        boldPara("CFO / VP of Finance: ", "AI pre-grading reduces instructor grading workload by 40–60%. Improved retention from early warning systems protects tuition revenue."),
        boldPara("Dean of Students: ", "Weekly study goals with automated reminders, interaction quality monitoring, and redo workflow provide early intervention before students disengage."),
        boldPara("Instructors: ", "AI generates detailed feedback for every submission. Grade in minutes instead of hours. Focus on pedagogy, not paperwork."),

        heading("Competitive Landscape"),
        simpleTable(
          ["Platform", "Approach", "Key Limitation"],
          [
            ["Canvas / Blackboard / Moodle", "Content delivery + grade book", "No AI tutoring, no process visibility"],
            ["Turnitin", "Plagiarism detection", "Reactive — catches cheating after the fact"],
            ["ChatGPT / Claude (direct)", "General-purpose AI", "No guardrails, no grading, no visibility"],
            ["Khanmigo", "AI tutor for K-12", "Not designed for higher ed institutions"],
            ["Elevate Learning", "AI-guided learning + process capture", "Purpose-built for higher ed with full instructor authority"],
          ]
        ),

        heading("Measurable Outcomes"),
        simpleTable(
          ["Metric", "Expected Impact"],
          [
            ["Instructor grading time", "40–60% reduction"],
            ["Student engagement", "25–35% increase in active learning behaviors"],
            ["Academic integrity incidents", "Significant reduction via proactive process capture"],
            ["Student satisfaction", "Higher feedback quality ratings"],
            ["Accreditation readiness", "Competency evidence at student and program level"],
            ["Student retention", "Early warning signals enable timely intervention"],
          ]
        ),

        heading("Implementation"),
        simpleTable(
          ["Phase", "Duration", "Activities"],
          [
            ["Configuration", "1 week", "Auth setup, database provisioning, LTI registration"],
            ["Pilot", "4–6 weeks", "2–3 courses, 50–200 students, instructor training"],
            ["Evaluation", "2 weeks", "Analyze time savings, engagement, grading consistency"],
            ["Scale", "Ongoing", "Roll out to additional departments based on pilot results"],
          ]
        ),

        para(""),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: "Elevate Learning with AI", bold: true, size: 28, color: BRAND.primary })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Because the future of education isn't AI replacing teachers.", italics: true, size: 22, color: BRAND.gray })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "It's AI making every student-teacher interaction more informed, more intentional, and more effective.", italics: true, size: 22, color: BRAND.gray })] }),
      ]
    }]
  });
}

// ─── ONE-PAGE AD (ENGLISH) ───
function buildAdEnglish() {
  return new Document({
    sections: [{
      properties: { page: { margin: { top: 500, bottom: 500, left: 700, right: 700 } } },
      children: [
        // Hero
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 50 }, children: [new TextRun({ text: "ELEVATE", bold: true, size: 72, color: BRAND.primary, font: "Calibri" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 50 }, children: [new TextRun({ text: "LEARNING WITH AI", bold: true, size: 36, color: BRAND.accent, font: "Calibri" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "The AI-Powered Learning Platform That Teaches Students How to Think", size: 24, color: "555555", font: "Calibri" })] }),

        // Problem → Solution
        new Paragraph({ shading: { type: ShadingType.SOLID, color: "F1F5F9" }, spacing: { after: 150 }, children: [
          new TextRun({ text: "  67% of students use AI on coursework. Only 12% of institutions have a framework for it.  ", size: 22, color: "334155", font: "Calibri", italics: true }),
        ]}),
        para("Elevate doesn't ban AI — it harnesses it. Students collaborate with guardrailed AI tutors that guide without giving answers, while every interaction is captured for instructor review."),

        // 4 Pillars
        heading("Why Institutions Choose Elevate", HeadingLevel.HEADING_2),
        new Paragraph({ spacing: { after: 50 }, children: [] }),
        simpleTable(
          ["AI-Guided Tutoring", "Process-Based Grading", "Full Transparency", "Instructor Authority"],
          [
            [
              "3 tutor styles with strict guardrails — students must think to progress",
              "60% problem-solving, 30% AI competency, 10% correctness",
              "Students attach completed work; instructors see everything",
              "Instructors give the final grade — or request a redo",
            ],
          ]
        ),

        // Key Stats
        heading("Measurable Impact", HeadingLevel.HEADING_2),
        new Paragraph({ spacing: { after: 50 }, children: [] }),
        simpleTable(
          ["40–60%", "25–35%", "100%", "Zero"],
          [
            [
              "Reduction in grading time",
              "Increase in active learning",
              "Process visibility per assignment",
              "Infrastructure to maintain",
            ],
          ]
        ),

        // Integration
        heading("Seamless Integration", HeadingLevel.HEADING_2),
        bullet("LTI 1.3 integration with Canvas, Blackboard, Moodle, D2L Brightspace"),
        bullet("Deploys in 1 week — no on-premise infrastructure required"),
        bullet("Institution owns all data (Supabase) — FERPA aligned"),
        bullet("Automated weekly goal reminders via email + in-app notifications"),

        // Pricing
        heading("Enterprise Pricing", HeadingLevel.HEADING_2),
        simpleTable(
          ["", "Starter", "Professional", "Enterprise"],
          [
            ["Students", "Up to 2,500", "Up to 15,000", "Unlimited"],
            ["Implementation", "$15,000", "$35,000", "$75,000"],
            ["Annual License", "$18,000/yr", "$42,000/yr", "$85,000/yr"],
            ["Per-Student Equiv.", "~$7.20/student", "~$2.80/student", "Custom"],
            ["LMS Integration", "1 LMS", "Up to 3 LMS", "Unlimited"],
            ["Support", "Email + docs", "Priority + onboarding", "Dedicated CSM + SLA"],
            ["Custom Branding", "—", "Logo + colors", "Full white-label"],
          ]
        ),
        para("All plans include: AI tutoring, process-based grading, feedback reports, weekly goals, file attachments, redo workflow, and notification system.", { size: 18, color: BRAND.gray }),

        // CTA
        new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "Schedule a Demo  |  Request a Pilot Proposal  |  elevatelearning.ai", bold: true, size: 24, color: BRAND.primary, font: "Calibri" }),
        ]}),
      ]
    }]
  });
}

// ─── ONE-PAGE AD (SPANISH) ───
function buildAdSpanish() {
  return new Document({
    sections: [{
      properties: { page: { margin: { top: 500, bottom: 500, left: 700, right: 700 } } },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 50 }, children: [new TextRun({ text: "ELEVATE", bold: true, size: 72, color: BRAND.primary, font: "Calibri" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 50 }, children: [new TextRun({ text: "APRENDIZAJE CON IA", bold: true, size: 36, color: BRAND.accent, font: "Calibri" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "La Plataforma de Aprendizaje con IA que Enseña a los Estudiantes a Pensar", size: 24, color: "555555", font: "Calibri" })] }),

        new Paragraph({ shading: { type: ShadingType.SOLID, color: "F1F5F9" }, spacing: { after: 150 }, children: [
          new TextRun({ text: "  El 67% de los estudiantes usan IA en sus tareas. Solo el 12% de las instituciones tienen un marco para gestionarlo.  ", size: 22, color: "334155", font: "Calibri", italics: true }),
        ]}),
        para("Elevate no prohíbe la IA — la aprovecha. Los estudiantes colaboran con tutores de IA con barreras pedagógicas que guían sin dar respuestas, mientras cada interacción queda registrada para revisión del instructor."),

        heading("Por Qué las Instituciones Eligen Elevate", HeadingLevel.HEADING_2),
        new Paragraph({ spacing: { after: 50 }, children: [] }),
        simpleTable(
          ["Tutoría Guiada por IA", "Evaluación por Proceso", "Transparencia Total", "Autoridad del Instructor"],
          [
            [
              "3 estilos de tutoría con controles estrictos — el estudiante debe pensar para avanzar",
              "60% resolución de problemas, 30% competencia en IA, 10% exactitud",
              "Los estudiantes adjuntan su trabajo; el instructor ve todo",
              "El instructor da la nota final — o solicita rehacer el trabajo",
            ],
          ]
        ),

        heading("Impacto Medible", HeadingLevel.HEADING_2),
        new Paragraph({ spacing: { after: 50 }, children: [] }),
        simpleTable(
          ["40–60%", "25–35%", "100%", "Cero"],
          [
            [
              "Reducción en tiempo de calificación",
              "Aumento en aprendizaje activo",
              "Visibilidad del proceso por tarea",
              "Infraestructura que mantener",
            ],
          ]
        ),

        heading("Integración Sin Fricciones", HeadingLevel.HEADING_2),
        bullet("Integración LTI 1.3 con Canvas, Blackboard, Moodle, D2L Brightspace"),
        bullet("Se implementa en 1 semana — sin infraestructura local requerida"),
        bullet("La institución es dueña de todos los datos (Supabase) — compatible con FERPA"),
        bullet("Recordatorios automáticos de metas semanales por correo y notificaciones"),

        heading("Precios Empresariales", HeadingLevel.HEADING_2),
        simpleTable(
          ["", "Inicial", "Profesional", "Empresarial"],
          [
            ["Estudiantes", "Hasta 2,500", "Hasta 15,000", "Ilimitado"],
            ["Implementación", "$15,000 USD", "$35,000 USD", "$75,000 USD"],
            ["Licencia Anual", "$18,000/año", "$42,000/año", "$85,000/año"],
            ["Equiv. por Estudiante", "~$7.20/est.", "~$2.80/est.", "Personalizado"],
            ["Integración LMS", "1 LMS", "Hasta 3 LMS", "Ilimitado"],
            ["Soporte", "Correo + docs", "Prioritario + onboarding", "CSM dedicado + SLA"],
            ["Marca Personalizada", "—", "Logo + colores", "White-label completo"],
          ]
        ),
        para("Todos los planes incluyen: tutoría IA, evaluación por proceso, reportes de retroalimentación, metas semanales, adjuntos de archivos, flujo de rehacer trabajo y sistema de notificaciones.", { size: 18, color: BRAND.gray }),

        new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "Solicite una Demo  |  Propuesta de Piloto  |  elevatelearning.ai", bold: true, size: 24, color: BRAND.primary, font: "Calibri" }),
        ]}),
      ]
    }]
  });
}

// ─── GENERATE ALL DOCS ───
async function main() {
  mkdirSync("docs", { recursive: true });

  const brief = buildExecutiveBrief();
  const briefBuffer = await Packer.toBuffer(brief);
  writeFileSync("docs/executive-brief-elevate-learning.docx", briefBuffer);
  console.log("✓ Executive Brief (Word) → docs/executive-brief-elevate-learning.docx");

  const adEn = buildAdEnglish();
  const adEnBuffer = await Packer.toBuffer(adEn);
  writeFileSync("docs/elevate-one-page-ad-english.docx", adEnBuffer);
  console.log("✓ One-Page Ad (English) → docs/elevate-one-page-ad-english.docx");

  const adEs = buildAdSpanish();
  const adEsBuffer = await Packer.toBuffer(adEs);
  writeFileSync("docs/elevate-one-page-ad-spanish.docx", adEsBuffer);
  console.log("✓ One-Page Ad (Spanish) → docs/elevate-one-page-ad-spanish.docx");
}

main().catch(console.error);
