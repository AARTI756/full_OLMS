const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { createFaker, departmentMap, buildCandidatePayload, buildOfferPayload } = require("./seed-utils");

const prisma = new PrismaClient();

const builtInTemplates = [
  {
    title: "Corporate Classic",
    description: "A formal enterprise offer letter with refined serif styling for established hiring workflows.",
    category: "Corporate",
    content: `
      <style>
        .classic-body { font-family: Georgia, serif; color: #111827; line-height: 1.75; }
        .classic-header { border-bottom: 1px solid #d1d5db; margin-bottom: 24px; padding-bottom: 20px; }
        .classic-header h1 { margin: 0; font-size: 30px; letter-spacing: -0.02em; }
        .classic-summary { margin-top: 12px; color: #475569; font-size: 14px; }
        .classic-details { margin: 24px 0; }
        .classic-details th { text-align: left; padding: 10px 12px; background: #f8fafc; font-weight: 700; }
        .classic-details td { padding: 10px 12px; border-top: 1px solid #e2e8f0; }
        .classic-cta { margin-top: 28px; }
      </style>
      <div class="classic-body">
        <div class="classic-header">
          <p style="margin:0;font-size:13px;color:#6b7280;">{{companyName}}</p>
          <h1>{{companyName}} Offer Letter</h1>
          <p class="classic-summary">Issued on {{offerDate}} for the {{department}} team.</p>
        </div>
        <p>Dear {{candidateName}},</p>
        <p>We are pleased to extend an offer for the position of <strong>{{position}}</strong> with our {{department}} team. This offer reflects our confidence in your abilities and our commitment to a strong partnership.</p>
        <table class="classic-details">
          <tr><th>Position</th><td>{{position}}</td></tr>
          <tr><th>Department</th><td>{{department}}</td></tr>
          <tr><th>Total compensation</th><td>{{salary}}</td></tr>
          <tr><th>Start date</th><td>{{joiningDate}}</td></tr>
          <tr><th>Acceptance deadline</th><td>{{validUntil}}</td></tr>
        </table>
        <p>As a reminder, this offer is conditional upon our standard background and reference checks. Your anticipated start date is <strong>{{joiningDate}}</strong>.</p>
        <p>We look forward to welcoming you to {{companyName}} and supporting your success on the team.</p>
        <div class="classic-cta">
          <p>Sincerely,</p>
          <p><strong>Human Resources</strong><br />{{companyName}}</p>
        </div>
      </div>
    `,
  },
  {
    title: "Modern SaaS",
    description: "A clean startup offer letter with modern spacing, neutral card layout, and simple brand presentation.",
    category: "Modern SaaS",
    content: `
      <style>
        .saas-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; line-height: 1.8; }
        .saas-banner { display: grid; gap: 12px; padding: 26px; background: #f8fafc; border-radius: 24px; margin-bottom: 24px; }
        .saas-banner h1 { margin: 0; font-size: 28px; }
        .saas-banner p { margin: 0; color: #475569; }
        .saas-card { padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 22px; margin-bottom: 18px; }
        .saas-label { display: inline-block; margin-bottom: 10px; color: #0f172a; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; }
        .saas-strong { color: #0f172a; font-weight: 700; }
        .saas-stat { font-size: 16px; margin: 0; }
      </style>
      <div class="saas-body">
        <div class="saas-banner">
          <div>
            <p class="saas-label">Offer summary</p>
            <h1>Offer for {{candidateName}}</h1>
          </div>
          <p>Join <strong>{{companyName}}</strong> as a <strong>{{position}}</strong> in {{department}}. This offer provides a contemporary compensation package with clear next steps.</p>
        </div>
        <div class="saas-card">
          <p class="saas-label">Offer details</p>
          <p class="saas-stat"><strong>Position:</strong> {{position}}</p>
          <p class="saas-stat"><strong>Department:</strong> {{department}}</p>
          <p class="saas-stat"><strong>Compensation:</strong> {{salary}}</p>
          <p class="saas-stat"><strong>Start date:</strong> {{joiningDate}}</p>
          <p class="saas-stat"><strong>Reply by:</strong> {{validUntil}}</p>
        </div>
        <div class="saas-card">
          <p class="saas-label">Welcome note</p>
          <p>Hi {{candidateName}},</p>
          <p>We are excited to offer you the role of <strong>{{position}}</strong> at {{companyName}}. Your experience will help shape our growth and product strategy in {{department}}.</p>
          <p>We believe this role is the right blend of challenge and collaboration, and we’re excited to move forward together.</p>
        </div>
        <div class="saas-card">
          <p class="saas-label">Next steps</p>
          <ul>
            <li>Review this offer and confirm by <strong>{{validUntil}}</strong>.</li>
            <li>Provide any questions or required details to the hiring team.</li>
            <li>Your expected start date is <strong>{{joiningDate}}</strong>.</li>
          </ul>
        </div>
        <p>We look forward to welcoming you to the team.</p>
      </div>
    `,
  },
  {
    title: "Executive Premium",
    description: "A luxury dark-accent offer letter designed for executive-level hires and premium presentation.",
    category: "Executive",
    content: `
      <style>
        .premium-body { font-family: 'Segoe UI', sans-serif; color: #f8fafc; background: #0f172a; padding: 28px; border-radius: 24px; }
        .premium-panel { background: rgba(15,23,42,0.95); border: 1px solid rgba(148,163,184,0.16); border-radius: 24px; padding: 28px; }
        .premium-title { margin: 0 0 8px; color: #f8fafc; font-size: 32px; letter-spacing: -0.03em; }
        .premium-subtitle { margin: 0; color: #94a3b8; }
        .premium-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin: 24px 0; }
        .premium-card { padding: 20px; border-radius: 18px; background: rgba(15,23,42,0.75); border: 1px solid rgba(148,163,184,0.12); }
        .premium-card h3 { margin: 0 0 10px; color: #e2e8f0; font-size: 16px; }
        .premium-card p { margin: 0; color: #cbd5e1; }
        .premium-footer { margin-top: 28px; color: #cbd5e1; }
      </style>
      <div class="premium-body">
        <div class="premium-panel">
          <p class="premium-subtitle">Executive offer</p>
          <h1 class="premium-title">{{companyName}} Executive Offer</h1>
          <p class="premium-subtitle">Developed for senior leadership roles with premium presentation and refined details.</p>
        </div>
        <div class="premium-grid">
          <div class="premium-card">
            <h3>Candidate</h3>
            <p>{{candidateName}}</p>
            <p>{{candidateEmail}}</p>
          </div>
          <div class="premium-card">
            <h3>Role</h3>
            <p>{{position}}</p>
            <p>{{department}}</p>
          </div>
          <div class="premium-card">
            <h3>Compensation</h3>
            <p>{{salary}}</p>
            <p>Effective {{offerDate}}</p>
          </div>
        </div>
        <div class="premium-card">
          <h3>Offer summary</h3>
          <p>This letter confirms your appointment as <strong>{{position}}</strong> at {{companyName}} with an executive-level compensation package and strategic leadership responsibilities within the {{department}} organization.</p>
        </div>
        <div class="premium-card">
          <h3>Key dates</h3>
          <p>Offer date: {{offerDate}}</p>
          <p>Acceptance required by: {{validUntil}}</p>
          <p>Proposed start: {{joiningDate}}</p>
        </div>
        <p class="premium-footer">Please review the terms carefully and reach out with any questions. We look forward to your leadership.</p>
      </div>
    `,
  },
  {
    title: "Creative Studio",
    description: "A vivid creative agency offer letter with bold headers, colorful sections, and engaging layout.",
    category: "Creative",
    content: `
      <style>
        .studio-body { font-family: 'Segoe UI', sans-serif; color: #111827; line-height: 1.75; }
        .studio-banner { padding: 28px; border-radius: 28px; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border: 1px solid #e5e7eb; margin-bottom: 24px; }
        .studio-title { margin: 0; font-size: 30px; color: #111827; }
        .studio-tag { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; color: #0f172a; font-weight: 700; }
        .studio-section { padding: 20px; border-radius: 24px; background: #ffffff; border: 1px solid #e5e7eb; margin-bottom: 18px; }
        .studio-section h2 { margin: 0 0 12px; font-size: 18px; color: #0f172a; }
        .studio-spot { display: inline-block; padding: 6px 12px; background: #cffafe; color: #0369a1; border-radius: 999px; font-size: 12px; margin-top: 12px; }
      </style>
      <div class="studio-body">
        <div class="studio-banner">
          <p class="studio-title">Creative offer for {{candidateName}}</p>
          <p class="studio-tag">Position: {{position}} · Department: {{department}}</p>
        </div>
        <div class="studio-section">
          <h2>Why join {{companyName}}</h2>
          <p>We are excited to invite you to the {{department}} team in a creative leadership role. Your expertise will help define our design language and product experience.</p>
          <p class="studio-spot">Offer amount: {{salary}}</p>
        </div>
        <div class="studio-section">
          <h2>Offer details</h2>
          <ul>
            <li>Role: <strong>{{position}}</strong></li>
            <li>Department: <strong>{{department}}</strong></li>
            <li>Start date: <strong>{{joiningDate}}</strong></li>
            <li>Accept by: <strong>{{validUntil}}</strong></li>
          </ul>
        </div>
        <div class="studio-section">
          <h2>Creative culture</h2>
          <p>At {{companyName}}, we value bold thinking, high craft, and collaboration. This offer is designed to give you the freedom you need to make meaningful work.</p>
        </div>
        <p>We look forward to building something remarkable together.</p>
      </div>
    `,
  },
  {
    title: "Minimal Clean",
    description: "A lightweight clean offer letter with elegant monochrome styling and compact formatting.",
    category: "Minimal",
    content: `
      <style>
        .minimal-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; line-height: 1.8; }
        .minimal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 26px; }
        .minimal-title { margin: 0; font-size: 28px; font-weight: 700; }
        .minimal-meta { color: #6b7280; font-size: 13px; }
        .minimal-block { margin-bottom: 20px; }
        .minimal-table { width: 100%; border-collapse: collapse; margin: 18px 0; }
        .minimal-table th,
        .minimal-table td { text-align: left; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .minimal-table th { width: 150px; color: #6b7280; }
      </style>
      <div class="minimal-body">
        <div class="minimal-header">
          <div>
            <p class="minimal-title">{{companyName}}</p>
            <p class="minimal-meta">Offer Letter</p>
          </div>
          <p class="minimal-meta">Issued {{offerDate}}</p>
        </div>
        <div class="minimal-block">
          <p>Dear {{candidateName}},</p>
          <p>We are pleased to offer you the position of <strong>{{position}}</strong> in the {{department}} team. Your clean compensation package is summarized below.</p>
        </div>
        <table class="minimal-table">
          <tr><th>Role</th><td>{{position}}</td></tr>
          <tr><th>Department</th><td>{{department}}</td></tr>
          <tr><th>Compensation</th><td>{{salary}}</td></tr>
          <tr><th>Start date</th><td>{{joiningDate}}</td></tr>
          <tr><th>Accept by</th><td>{{validUntil}}</td></tr>
        </table>
        <div class="minimal-block">
          <p>Please review the terms and confirm your acceptance before <strong>{{validUntil}}</strong>. We look forward to welcoming you to {{companyName}}.</p>
        </div>
        <div class="minimal-block">
          <p>Sincerely,</p>
          <p><strong>Talent Team</strong></p>
        </div>
      </div>
    `,
  },
  {
    title: "Startup Pitch",
    description: "A high-energy startup offer letter built for high growth teams and velocity hiring.",
    category: "Startup",
    content: `
      <style>
        .startup-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; background: #fbfbfd; padding: 26px; }
        .startup-hero { padding: 24px; border-radius: 24px; background: #eef2ff; margin-bottom: 20px; }
        .startup-title { margin: 0 0 8px; font-size: 32px; color: #0f172a; }
        .startup-note { margin: 0; color: #475569; }
        .startup-card { padding: 18px; border-radius: 20px; background: #ffffff; border: 1px solid #e2e8f0; margin-bottom: 16px; }
        .startup-card h2 { margin: 0 0 10px; font-size: 18px; color: #0f172a; }
      </style>
      <div class="startup-body">
        <section class="startup-hero">
          <h1 class="startup-title">Offer for {{candidateName}}</h1>
          <p class="startup-note">Your chance to join {{companyName}} as a <strong>{{position}}</strong>.</p>
        </section>
        <section class="startup-card">
          <h2>What you will get</h2>
          <p>This offer includes a competitive pay package of <strong>{{salary}}</strong>, aligned with our fast-growing {{department}} team.</p>
          <p>Start date is slated for <strong>{{joiningDate}}</strong>, with acceptance due by <strong>{{validUntil}}</strong>.</p>
        </section>
        <section class="startup-card">
          <h2>Why this role matters</h2>
          <p>We are building the next generation of solutions, and your expertise will help us push product and engineering boundaries.</p>
        </section>
      </div>
    `,
  },
  {
    title: "Nonprofit Impact",
    description: "A mission-first offer letter crafted for nonprofit hiring and values-driven teams.",
    category: "Nonprofit",
    content: `
      <style>
        .impact-body { font-family: 'Segoe UI', sans-serif; color: #111827; line-height: 1.8; background: #f7f8fb; padding: 26px; }
        .impact-panel { padding: 22px; border-radius: 24px; background: #ffffff; border: 1px solid #d1d5db; margin-bottom: 18px; }
        .impact-title { margin: 0 0 12px; font-size: 26px; color: #0f172a; }
        .impact-note { margin: 0; color: #475569; }
      </style>
      <div class="impact-body">
        <div class="impact-panel">
          <h1 class="impact-title">Impact offer for {{candidateName}}</h1>
          <p class="impact-note">Join {{companyName}} to help fuel meaningful outcomes for communities and beneficiaries.</p>
        </div>
        <div class="impact-panel">
          <p><strong>Position:</strong> {{position}}</p>
          <p><strong>Department:</strong> {{department}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Accept by:</strong> {{validUntil}}</p>
        </div>
        <div class="impact-panel">
          <p>We are excited to invite you to a team that is committed to purpose-driven work, strong partnerships, and measurable impact.</p>
        </div>
      </div>
    `,
  },
  {
    title: "Healthcare Care",
    description: "A polished healthcare offer letter with compassionate tone and clinical clarity.",
    category: "Healthcare",
    content: `
      <style>
        .health-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #0f172a; line-height: 1.75; padding: 26px; background: #f8fafc; }
        .health-header { padding: 24px; border-radius: 22px; background: #ffffff; border: 1px solid #dbeafe; margin-bottom: 20px; }
        .health-title { margin: 0 0 6px; font-size: 28px; }
        .health-subtitle { margin: 0; color: #475569; }
        .health-card { padding: 18px; border-radius: 20px; background: #ffffff; border: 1px solid #e2e8f0; margin-bottom: 16px; }
      </style>
      <div class="health-body">
        <div class="health-header">
          <h1 class="health-title">Clinical offer for {{candidateName}}</h1>
          <p class="health-subtitle">A compassionate, clear offer letter for your role in {{department}}.</p>
        </div>
        <div class="health-card">
          <p><strong>Role:</strong> {{position}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Deadline:</strong> {{validUntil}}</p>
        </div>
        <div class="health-card">
          <p>We appreciate the care you bring and look forward to your contribution to our patient-first mission.</p>
        </div>
      </div>
    `,
  },
  {
    title: "Legal Trust",
    description: "A precise legal services offer letter with clean structure and predictable terms.",
    category: "Legal",
    content: `
      <style>
        .legal-body { font-family: Georgia, serif; color: #111827; line-height: 1.75; padding: 26px; background: #f3f4f6; }
        .legal-top { padding: 22px; border-radius: 22px; background: #ffffff; border: 1px solid #d1d5db; margin-bottom: 18px; }
        .legal-title { margin: 0 0 10px; font-size: 28px; }
        .legal-section { margin-bottom: 18px; }
        .legal-section h2 { margin: 0 0 10px; font-size: 18px; }
      </style>
      <div class="legal-body">
        <div class="legal-top">
          <h1 class="legal-title">Offer details for {{candidateName}}</h1>
          <p>We are pleased to confirm your position as <strong>{{position}}</strong> within the {{department}} team at {{companyName}}.</p>
        </div>
        <div class="legal-section">
          <h2>Key terms</h2>
          <p>Compensation: {{salary}}</p>
          <p>Start date: {{joiningDate}}</p>
          <p>Deadline: {{validUntil}}</p>
        </div>
        <div class="legal-section">
          <h2>Next steps</h2>
          <p>Please review the terms and confirm acceptance by <strong>{{validUntil}}</strong>. This offer remains subject to standard hiring checks.</p>
        </div>
      </div>
    `,
  },
  {
    title: "Sales Accelerator",
    description: "A high-impact sales offer letter with revenue-focused messaging and clear incentives.",
    category: "Sales",
    content: `
      <style>
        .sales-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; padding: 26px; background: #f8fafc; }
        .sales-hero { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #d1d5db; margin-bottom: 20px; }
        .sales-title { margin: 0 0 10px; font-size: 28px; }
        .sales-section { margin-bottom: 18px; }
        .sales-section h2 { margin: 0 0 10px; font-size: 18px; }
        .sales-highlight { background: #e0f2fe; border-radius: 18px; padding: 14px; margin-top: 14px; }
      </style>
      <div class="sales-body">
        <div class="sales-hero">
          <h1 class="sales-title">Sales offer for {{candidateName}}</h1>
          <p>This package is designed to reward performance and accelerate growth in {{department}}.</p>
        </div>
        <div class="sales-section">
          <h2>Role details</h2>
          <p>Position: {{position}}</p>
          <p>Department: {{department}}</p>
          <p>Compensation: {{salary}}</p>
          <p>Start date: {{joiningDate}}</p>
        </div>
        <div class="sales-highlight">
          <p>Please accept by <strong>{{validUntil}}</strong> to keep timing aligned with next quarter goals.</p>
        </div>
      </div>
    `,
  },
  {
    title: "Engineering Blueprint",
    description: "A technical offer letter with clear product alignment and engineering milestones.",
    category: "Engineering",
    content: `
      <style>
        .engineer-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; padding: 26px; background: #f9fafb; }
        .engineer-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #dbeafe; margin-bottom: 18px; }
        .engineer-title { margin: 0 0 8px; font-size: 28px; }
        .engineer-list { margin: 0; padding-left: 18px; }
      </style>
      <div class="engineer-body">
        <div class="engineer-panel">
          <h1 class="engineer-title">Offer for {{candidateName}}</h1>
          <p>Join {{companyName}} as an engineering leader focused on scaling core systems and accelerating product delivery.</p>
        </div>
        <div class="engineer-panel">
          <p><strong>Position:</strong> {{position}}</p>
          <p><strong>Department:</strong> {{department}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
        </div>
        <div class="engineer-panel">
          <h2>What to expect</h2>
          <ul class="engineer-list">
            <li>Start date: {{joiningDate}}</li>
            <li>Deadline: {{validUntil}}</li>
            <li>Acceptance conditions aligned with engineering onboarding.</li>
          </ul>
        </div>
      </div>
    `,
  },
  {
    title: "Finance Forecast",
    description: "A structured finance offer letter with clear cost and compliance details.",
    category: "Finance",
    content: `
      <style>
        .finance-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; background: #f3f4f6; padding: 26px; }
        .finance-card { padding: 24px; border-radius: 22px; background: #ffffff; border: 1px solid #d1d5db; margin-bottom: 18px; }
        .finance-title { margin: 0 0 10px; font-size: 28px; }
      </style>
      <div class="finance-body">
        <div class="finance-card">
          <h1 class="finance-title">Finance offer for {{candidateName}}</h1>
          <p>We are pleased to present your compensation and role details for the {{department}} team.</p>
        </div>
        <div class="finance-card">
          <p><strong>Role:</strong> {{position}}</p>
          <p><strong>Salary:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Response by:</strong> {{validUntil}}</p>
        </div>
        <div class="finance-card">
          <p>This offer is presented with transparency and the right approvals to help ensure a smooth transition.</p>
        </div>
      </div>
    `,
  },
  {
    title: "Campus Recruit",
    description: "A friendly campus recruitment offer with approachable tone and next-step clarity.",
    category: "Education",
    content: `
      <style>
        .campus-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; padding: 26px; background: #f8fafc; }
        .campus-panel { padding: 22px; border-radius: 24px; background: #ffffff; border: 1px solid #e2e8f0; margin-bottom: 18px; }
        .campus-title { margin: 0 0 8px; font-size: 28px; }
      </style>
      <div class="campus-body">
        <div class="campus-panel">
          <h1 class="campus-title">Offer for {{candidateName}}</h1>
          <p>We are excited to welcome you to the {{department}} team and support your first professional experience.</p>
        </div>
        <div class="campus-panel">
          <p><strong>Position:</strong> {{position}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Please reply by:</strong> {{validUntil}}</p>
        </div>
        <div class="campus-panel">
          <p>This offer is tailored to help you succeed from day one and aligns with our campus recruiting commitments.</p>
        </div>
      </div>
    `,
  },
  {
    title: "Retail Ready",
    description: "A retail offer letter with polished service tone and customer-centric language.",
    category: "Retail",
    content: `
      <style>
        .retail-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; background: #f9fafb; padding: 26px; }
        .retail-panel { padding: 22px; border-radius: 24px; background: #ffffff; border: 1px solid #e2e8f0; margin-bottom: 18px; }
        .retail-title { margin: 0 0 8px; font-size: 28px; }
      </style>
      <div class="retail-body">
        <div class="retail-panel">
          <h1 class="retail-title">Retail offer for {{candidateName}}</h1>
          <p>We are excited to offer you a role on our customer-facing team with a focus on retail excellence.</p>
        </div>
        <div class="retail-panel">
          <p><strong>Position:</strong> {{position}}</p>
          <p><strong>Department:</strong> {{department}}</p>
          <p><strong>Salary:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Offer deadline:</strong> {{validUntil}}</p>
        </div>
        <div class="retail-panel">
          <p>We look forward to having you help deliver exceptional customer experiences for {{companyName}}.</p>
        </div>
      </div>
    `,
  },
  {
    title: "Remote Flex",
    description: "A remote-friendly offer letter with flexible work language and clear expectations.",
    category: "Remote",
    content: `
      <style>
        .remote-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #0f172a; padding: 26px; background: #eff6ff; }
        .remote-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #dbeafe; margin-bottom: 18px; }
        .remote-title { margin: 0 0 8px; font-size: 28px; }
      </style>
      <div class="remote-body">
        <div class="remote-panel">
          <h1 class="remote-title">Remote offer for {{candidateName}}</h1>
          <p>This package is built to support your success while working remotely within the {{department}} team.</p>
        </div>
        <div class="remote-panel">
          <p><strong>Position:</strong> {{position}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Reply by:</strong> {{validUntil}}</p>
        </div>
        <div class="remote-panel">
          <p>Please review the offer and let us know if you have any questions about remote setup, tools, or onboarding.</p>
        </div>
      </div>
    `,
  },
  {
    title: "Inclusive Growth",
    description: "A diversity-first offer letter with inclusive language and culture-focused phrasing.",
    category: "Diversity",
    content: `
      <style>
        .inclusive-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; padding: 26px; background: #f8fafc; }
        .inclusive-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #d1d5db; margin-bottom: 18px; }
        .inclusive-title { margin: 0 0 8px; font-size: 28px; }
      </style>
      <div class="inclusive-body">
        <div class="inclusive-panel">
          <h1 class="inclusive-title">Inclusive offer for {{candidateName}}</h1>
          <p>We are excited to bring your skills to {{companyName}} and build a stronger team through diverse perspectives.</p>
        </div>
        <div class="inclusive-panel">
          <p><strong>Position:</strong> {{position}}</p>
          <p><strong>Department:</strong> {{department}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
        </div>
        <div class="inclusive-panel">
          <p>Please confirm your acceptance by <strong>{{validUntil}}</strong>. We’ll be ready to support your onboarding and belonging from day one.</p>
        </div>
      </div>
    `,
  },
  {
    title: "Global Talent",
    description: "An international offer letter designed for cross-border hiring and global teams.",
    category: "International",
    content: `
      <style>
        .global-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; padding: 26px; background: #f9fafb; }
        .global-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #dbeafe; margin-bottom: 18px; }
        .global-title { margin: 0 0 10px; font-size: 28px; }
      </style>
      <div class="global-body">
        <div class="global-panel">
          <h1 class="global-title">International offer for {{candidateName}}</h1>
          <p>We are pleased to invite you to join a global {{department}} team at {{companyName}}.</p>
        </div>
        <div class="global-panel">
          <p><strong>Position:</strong> {{position}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Accept by:</strong> {{validUntil}}</p>
        </div>
        <div class="global-panel">
          <p>This offer supports cross-border collaboration and clarifies the next steps for a smooth international onboarding experience.</p>
        </div>
      </div>
    `,
  },
  {
    title: "Freelance Offer",
    description: "A flexible freelance contract-style offer letter for temporary and consulting engagements.",
    category: "Freelance",
    content: `
      <style>
        .freelance-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; padding: 26px; background: #f7f7fb; }
        .freelance-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #e5e7eb; margin-bottom: 18px; }
        .freelance-title { margin: 0 0 10px; font-size: 28px; }
      </style>
      <div class="freelance-body">
        <div class="freelance-panel">
          <h1 class="freelance-title">Freelance offer for {{candidateName}}</h1>
          <p>This contract-style offer details the scope, compensation, and timeline for your work with {{companyName}}.</p>
        </div>
        <div class="freelance-panel">
          <p><strong>Project:</strong> {{position}}</p>
          <p><strong>Team:</strong> {{department}}</p>
          <p><strong>Fee:</strong> {{salary}}</p>
          <p><strong>Start:</strong> {{joiningDate}}</p>
          <p><strong>Response by:</strong> {{validUntil}}</p>
        </div>
      </div>
    `,
  },
  {
    title: "Hospitality Welcome",
    description: "A hospitality offer letter with warm tone and guest-focused service messaging.",
    category: "Hospitality",
    content: `
      <style>
        .hospitality-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; padding: 26px; background: #fffdfa; }
        .hospitality-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #f5e8d3; margin-bottom: 18px; }
        .hospitality-title { margin: 0 0 10px; font-size: 28px; }
      </style>
      <div class="hospitality-body">
        <div class="hospitality-panel">
          <h1 class="hospitality-title">Welcome offer for {{candidateName}}</h1>
          <p>We are delighted to offer you a role in our hospitality team where guest experience is our top priority.</p>
        </div>
        <div class="hospitality-panel">
          <p><strong>Role:</strong> {{position}}</p>
          <p><strong>Department:</strong> {{department}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Please reply by:</strong> {{validUntil}}</p>
        </div>
      </div>
    `,
  },
  {
    title: "Manufacturing Precision",
    description: "A manufacturing-focused offer letter with precision language and production readiness.",
    category: "Manufacturing",
    content: `
      <style>
        .manufacturing-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; background: #f7f9fc; padding: 26px; }
        .manufacturing-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #d1d5db; margin-bottom: 18px; }
        .manufacturing-title { margin: 0 0 10px; font-size: 28px; }
      </style>
      <div class="manufacturing-body">
        <div class="manufacturing-panel">
          <h1 class="manufacturing-title">Manufacturing offer for {{candidateName}}</h1>
          <p>We are pleased to extend this offer for a role in our {{department}} operations team.</p>
        </div>
        <div class="manufacturing-panel">
          <p><strong>Position:</strong> {{position}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Accept by:</strong> {{validUntil}}</p>
        </div>
      </div>
    `,
  },
  {
    title: "Consumer Experience",
    description: "A consumer brand offer letter with experience-first copy and polished layout.",
    category: "Consumer",
    content: `
      <style>
        .consumer-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; padding: 26px; background: #f8fafc; }
        .consumer-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #e2e8f0; margin-bottom: 18px; }
        .consumer-title { margin: 0 0 10px; font-size: 28px; }
      </style>
      <div class="consumer-body">
        <div class="consumer-panel">
          <h1 class="consumer-title">Offer for {{candidateName}}</h1>
          <p>Join {{companyName}} to enhance the consumer experience across products and services.</p>
        </div>
        <div class="consumer-panel">
          <p><strong>Role:</strong> {{position}}</p>
          <p><strong>Department:</strong> {{department}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Deadline:</strong> {{validUntil}}</p>
        </div>
      </div>
    `,
  },
  {
    title: "Sustainability Pledge",
    description: "A sustainability-minded offer letter with green-focused messaging and future-ready tone.",
    category: "Sustainability",
    content: `
      <style>
        .sustain-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; padding: 26px; background: #f0fdf4; }
        .sustain-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #d1fae5; margin-bottom: 18px; }
        .sustain-title { margin: 0 0 10px; font-size: 28px; }
      </style>
      <div class="sustain-body">
        <div class="sustain-panel">
          <h1 class="sustain-title">Sustainability offer for {{candidateName}}</h1>
          <p>We are excited to offer you a role that advances {{companyName}}’s environmental and social initiatives.</p>
        </div>
        <div class="sustain-panel">
          <p><strong>Position:</strong> {{position}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Accept by:</strong> {{validUntil}}</p>
        </div>
      </div>
    `,
  },
  {
    title: "Analytics Insight",
    description: "A data-driven offer letter with analytical clarity and concise financial detail.",
    category: "Analytics",
    content: `
      <style>
        .analytics-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; padding: 26px; background: #f8fafc; }
        .analytics-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #dbeafe; margin-bottom: 18px; }
        .analytics-title { margin: 0 0 10px; font-size: 28px; }
      </style>
      <div class="analytics-body">
        <div class="analytics-panel">
          <h1 class="analytics-title">Offer for {{candidateName}}</h1>
          <p>We are excited to invite you to our analytics team to help turn data into better business outcomes.</p>
        </div>
        <div class="analytics-panel">
          <p><strong>Position:</strong> {{position}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Response by:</strong> {{validUntil}}</p>
        </div>
      </div>
    `,
  },
  {
    title: "Leadership Vision",
    description: "A visionary leadership offer letter with executive-level narrative and strategic framing.",
    category: "Leadership",
    content: `
      <style>
        .leadership-body { font-family: 'Segoe UI', sans-serif; color: #111827; padding: 26px; background: #f7f8fb; }
        .leadership-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #d1d5db; margin-bottom: 18px; }
        .leadership-title { margin: 0 0 10px; font-size: 28px; }
      </style>
      <div class="leadership-body">
        <div class="leadership-panel">
          <h1 class="leadership-title">Leadership offer for {{candidateName}}</h1>
          <p>We invite you to shape the future of {{companyName}} and lead a high-performance {{department}} team.</p>
        </div>
        <div class="leadership-panel">
          <p><strong>Role:</strong> {{position}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Deadline:</strong> {{validUntil}}</p>
        </div>
      </div>
    `,
  },
  {
    title: "Product Development",
    description: "A product team offer letter with roadmap-focused language and agile cadence detail.",
    category: "Product",
    content: `
      <style>
        .product-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; padding: 26px; background: #f8fafc; }
        .product-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #dbeafe; margin-bottom: 18px; }
        .product-title { margin: 0 0 10px; font-size: 28px; }
      </style>
      <div class="product-body">
        <div class="product-panel">
          <h1 class="product-title">Offer for {{candidateName}}</h1>
          <p>Join the {{department}} team to help define product strategy and bring customer-driven features to market.</p>
        </div>
        <div class="product-panel">
          <p><strong>Position:</strong> {{position}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Response by:</strong> {{validUntil}}</p>
        </div>
      </div>
    `,
  },
  {
    title: "Customer Success",
    description: "A customer success offer letter with client-focused language and service excellence tone.",
    category: "Customer Success",
    content: `
      <style>
        .success-body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; padding: 26px; background: #f7f8fb; }
        .success-panel { padding: 24px; border-radius: 24px; background: #ffffff; border: 1px solid #d1d5db; margin-bottom: 18px; }
        .success-title { margin: 0 0 10px; font-size: 28px; }
      </style>
      <div class="success-body">
        <div class="success-panel">
          <h1 class="success-title">Offer for {{candidateName}}</h1>
          <p>We are pleased to offer you a role focused on customer advocacy and success for our clients.</p>
        </div>
        <div class="success-panel">
          <p><strong>Position:</strong> {{position}}</p>
          <p><strong>Department:</strong> {{department}}</p>
          <p><strong>Compensation:</strong> {{salary}}</p>
          <p><strong>Start date:</strong> {{joiningDate}}</p>
          <p><strong>Accept by:</strong> {{validUntil}}</p>
        </div>
      </div>
    `,
  },
];

async function main() {
  const deterministic = process.argv.includes("--deterministic") || process.env.SEED_DETERMINISTIC === "true";
  const faker = createFaker(deterministic);

  const roleNames = ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"];
  for (const name of roleNames) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name, description: `${name} role with scoped access` } });
  }

  for (const department of departmentMap) {
    await prisma.department.upsert({ where: { name: department.name }, update: {}, create: { name: department.name, code: department.code, description: `${department.name} department` } });
  }

  const adminEmail = "admin@olms.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "OLMS Administrator", phone: "000-000-0000", hashedPassword, isActive: true },
    create: { name: "OLMS Administrator", email: adminEmail, phone: "000-000-0000", hashedPassword, role: { connect: { name: "ADMIN" } } },
  });

  const createdUsers = [];
  const recruiterNames = ["Samantha Garcia", "Jordan Blake"];
  const approverNames = ["Avery Brooks", "Morgan Chen"];

  for (const name of recruiterNames) {
    const email = `${name.toLowerCase().replace(/\s+/g, '.') }@olms.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, phone: faker.phone.number('###-###-####'), isActive: true },
      create: { name, email, phone: faker.phone.number('###-###-####'), hashedPassword, role: { connect: { name: 'RECRUITER' } }, department: { connect: { name: 'Engineering' } } },
    });
    createdUsers.push(user);
  }

  for (const name of approverNames) {
    const email = `${name.toLowerCase().replace(/\s+/g, '.') }@olms.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, phone: faker.phone.number('###-###-####'), isActive: true },
      create: { name, email, phone: faker.phone.number('###-###-####'), hashedPassword, role: { connect: { name: 'APPROVER' } }, department: { connect: { name: 'Finance' } } },
    });
    createdUsers.push(user);
  }

  const hrUser = await prisma.user.upsert({
    where: { email: 'rebecca.ellis@olms.local' },
    update: { name: 'Rebecca Ellis', phone: faker.phone.number('###-###-####'), isActive: true },
    create: { name: 'Rebecca Ellis', email: 'rebecca.ellis@olms.local', phone: faker.phone.number('###-###-####'), hashedPassword, role: { connect: { name: 'HR' } }, department: { connect: { name: 'HR' } } },
  });
  createdUsers.push(hrUser);

  const financeUser = await prisma.user.upsert({
    where: { email: 'olivia.morgan@olms.local' },
    update: { name: 'Olivia Morgan', phone: faker.phone.number('###-###-####'), isActive: true },
    create: { name: 'Olivia Morgan', email: 'olivia.morgan@olms.local', phone: faker.phone.number('###-###-####'), hashedPassword, role: { connect: { name: 'FINANCE' } }, department: { connect: { name: 'Finance' } } },
  });
  createdUsers.push(financeUser);

  const recruiterIds = createdUsers.filter((user) => user.roleId && user.roleId !== adminUser.roleId).slice(0, 2).map((user) => user.id);
  const approverIds = createdUsers.filter((user) => user.roleId && user.roleId !== adminUser.roleId && user.roleId !== hrUser.roleId).slice(2).map((user) => user.id);

  const templateRecords = [];
  for (const template of builtInTemplates) {
    const category = await prisma.templateCategory.upsert({ where: { name: template.category }, update: {}, create: { name: template.category } });
    const created = await prisma.offerTemplate.upsert({
      where: { title: template.title },
      update: { description: template.description, content: template.content, categoryId: category.id, isActive: true, isArchived: false },
      create: { title: template.title, description: template.description, content: template.content, categoryId: category.id, createdById: adminUser.id, isActive: true, isArchived: false },
    });
    const version = await prisma.templateVersion.upsert({
      where: { templateId_versionNumber: { templateId: created.id, versionNumber: 1 } },
      update: { title: template.title, content: template.content, createdById: adminUser.id },
      create: { versionNumber: 1, title: template.title, content: template.content, templateId: created.id, createdById: adminUser.id },
    });
    await prisma.offerTemplate.update({ where: { id: created.id }, data: { latestVersionId: version.id } });
    templateRecords.push(created);
  }

  const candidatePayloads = Array.from({ length: 20 }, () => buildCandidatePayload(faker, recruiterIds, departmentMap));
  const candidates = [];

  for (const payload of candidatePayloads) {
    const candidate = await prisma.candidate.create({
      data: {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        role: payload.role,
        department: { connect: { name: payload.department } },
        experienceYears: payload.experienceYears,
        expectedCtc: payload.expectedCtc,
        currentCtc: payload.currentCtc,
        noticePeriodDays: payload.noticePeriodDays,
        status: payload.status,
        recruiterId: payload.recruiterId,
        location: payload.location,
        skills: payload.skills,
        resumeUrl: payload.resumeUrl,
        notes: payload.notes,
      },
    });

    await prisma.candidateActivity.create({
      data: { candidateId: candidate.id, userId: candidate.recruiterId ?? adminUser.id, action: 'CREATED', details: `Created candidate profile for ${candidate.fullName}` },
    });

    if (faker.datatype.boolean()) {
      const resume = await prisma.candidateResume.create({
        data: {
          candidateId: candidate.id,
          uploadedById: candidate.recruiterId || adminUser.id,
          fileName: `${candidate.fullName.replace(/\s+/g, '_')}_resume.pdf`,
          fileUrl: `/resumes/${candidate.id}/${faker.string.uuid()}.pdf`,
          mimeType: 'application/pdf',
          size: faker.number.int({ min: 32000, max: 1800000 }),
          storagePath: `resumes/${candidate.id}/${faker.string.uuid()}.pdf`,
        },
      });
      await prisma.candidateActivity.create({
        data: { candidateId: candidate.id, userId: candidate.recruiterId ?? adminUser.id, action: 'RESUME_UPLOADED', details: `Uploaded resume ${resume.fileName}` },
      });
    }

    if (candidate.recruiterId) {
      await prisma.notification.create({
        data: {
          userId: candidate.recruiterId,
          type: 'CANDIDATE',
          title: 'New candidate added',
          message: `Candidate ${candidate.fullName} was added to your pipeline.`,
          status: 'UNREAD',
          entityId: candidate.id,
          metadata: { event: 'CANDIDATE_CREATED' },
        },
      });
    }

    candidates.push(candidate);
  }

  const creatorIds = [adminUser.id, ...recruiterIds, hrUser.id];
  const offers = [];
  for (const candidate of faker.helpers.arrayElements(candidates, { min: 10, max: 16 })) {
    const template = faker.helpers.arrayElement(templateRecords);
    const creatorId = faker.helpers.arrayElement(creatorIds);
    const offerPayload = buildOfferPayload(faker, candidate, creatorId, template.id);
    const offer = await prisma.offer.create({
      data: {
        candidateId: offerPayload.candidateId,
        createdById: offerPayload.createdById,
        templateId: offerPayload.templateId,
        templateVersionId: template.latestVersionId ?? undefined,
        title: offerPayload.title,
        department: { connect: { name: offerPayload.department } },
        designation: offerPayload.designation,
        status: offerPayload.status,
        baseSalary: offerPayload.baseSalary,
        variablePay: offerPayload.variablePay,
        joiningBonus: offerPayload.joiningBonus,
        retentionBonus: offerPayload.retentionBonus,
        probationPeriodMonths: offerPayload.probationPeriodMonths,
        offerDate: new Date(offerPayload.offerDate),
        validUntil: new Date(offerPayload.validUntil),
        totalCtc: offerPayload.baseSalary + offerPayload.variablePay + offerPayload.joiningBonus + offerPayload.retentionBonus,
        approvalComments: offerPayload.approvalComments,
      },
    });
    await prisma.activity.create({
      data: {
        userId: creatorId,
        offerId: offer.id,
        candidateId: candidate.id,
        action: 'OFFER_CREATED',
        details: `Offer created for ${candidate.fullName} (${offer.title})`,
      },
    });
    const approverId = faker.helpers.arrayElement(approverIds);
    const shouldRequestApproval = offerPayload.status !== 'DRAFT';
    if (shouldRequestApproval) {
      const decision = offerPayload.status === 'PENDING' ? 'PENDING' : offerPayload.status === 'REJECTED' ? 'REJECTED' : 'APPROVED';
      await prisma.approval.create({
        data: {
          offerId: offer.id,
          approverId,
          decision,
          comments: decision === 'PENDING' ? 'Approval requested prior to release.' : `Decision recorded as ${decision}.`,
          decidedAt: decision === 'PENDING' ? null : new Date(),
        },
      });
      await prisma.activity.create({
        data: {
          userId: approverId,
          offerId: offer.id,
          candidateId: candidate.id,
          action: decision === 'PENDING' ? 'OFFER_APPROVAL_REQUESTED' : 'OFFER_APPROVAL_DECIDED',
          details: decision === 'PENDING' ? `Approval requested for ${offer.title}` : `Offer ${offer.title} was ${decision.toLowerCase()}.`,
        },
      });
      await prisma.notification.create({
        data: {
          userId: approverId,
          type: 'APPROVAL',
          title: decision === 'PENDING' ? 'Approval requested' : `Approval ${decision.toLowerCase()}`,
          message: decision === 'PENDING' ? `Please review the offer ${offer.title}.` : `The offer ${offer.title} was ${decision.toLowerCase()}.`,
          status: 'UNREAD',
          entityId: offer.id,
          metadata: { event: decision === 'PENDING' ? 'OFFER_APPROVAL_REQUESTED' : `OFFER_${decision}` },
        },
      });
    }
    if (offerPayload.status === 'ACCEPTED') {
      await prisma.notification.create({
        data: {
          userId: creatorId,
          type: 'OFFER',
          title: 'Offer accepted',
          message: `Offer ${offer.title} was accepted by ${candidate.fullName}.`,
          status: 'UNREAD',
          entityId: offer.id,
          metadata: { event: 'OFFER_ACCEPTED' },
        },
      });
    }
    offers.push(offer);
  }

  for (const template of templateRecords) {
    await prisma.activity.create({
      data: {
        userId: adminUser.id,
        action: 'TEMPLATE_UPDATED',
        details: `Template ${template.title} refreshed for enterprise hiring workflows.`,
      },
    });
    await prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: 'SYSTEM',
        title: 'Template refreshed',
        message: `Template ${template.title} was updated with new workflow enhancements.`,
        status: 'UNREAD',
        entityId: template.id,
        metadata: { event: 'TEMPLATE_UPDATED' },
      },
    });
  }

  console.log('Seed complete. Admin user created:');
  console.log(`  email: ${adminEmail}`);
  console.log(`  password: ${adminPassword}`);
  console.log(`  deterministic: ${deterministic}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
