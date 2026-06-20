'use client';

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { TemplateRenderContext } from '@/lib/template-variables';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#E2E8F0',
    backgroundColor: '#020617',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#9BE7FF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  section: {
    marginTop: 14,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 1.6,
  },
  accentBox: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#112240',
    border: '1px solid #164E63',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rowLabel: {
    color: '#94A3B8',
    fontSize: 10,
  },
  rowValue: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: 500,
  },
  signOff: {
    marginTop: 28,
  },
  signature: {
    marginTop: 24,
    borderTop: '1px solid #334155',
    paddingTop: 8,
    width: '40%',
    color: '#94A3B8',
  },
});

function normalizeHtmlToText(html: string) {
  return html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n\n')
    .replace(/<\s*\/h[1-6]\s*>/gi, '\n\n')
    .replace(/<\s*li\s*>/gi, '- ')
    .replace(/<\s*\/li\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface TemplatePdfDocumentProps {
  title?: string;
  renderedContent: string;
  context?: TemplateRenderContext;
}

export function TemplatePdfDocument({ title, renderedContent, context }: TemplatePdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title ?? 'Offer Template'}</Text>
          <Text style={styles.subtitle}>Offer template generated with enterprise branding and offer metadata.</Text>
        </View>

        <View style={styles.accentBox}>
          <Text style={styles.rowLabel}>Candidate:</Text>
          <Text style={styles.rowValue}>{context?.candidateName ?? 'Candidate name'}</Text>
          <Text style={styles.rowLabel}>Role:</Text>
          <Text style={styles.rowValue}>{context?.designation ?? 'Designation'}</Text>
          <Text style={styles.rowLabel}>Department:</Text>
          <Text style={styles.rowValue}>{context?.department ?? 'Department'}</Text>
        </View>

        <View>
          {normalizeHtmlToText(renderedContent)
            .split('\n\n')
            .slice(0, 8)
            .map((paragraph, index) => (
              <Text key={index} style={styles.paragraph}>{paragraph}</Text>
            ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Compensation</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total CTC</Text>
            <Text style={styles.rowValue}>{context?.totalCtc ?? '$0.00'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Joining date</Text>
            <Text style={styles.rowValue}>{context?.joiningDate ?? 'TBD'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Company</Text>
            <Text style={styles.rowValue}>{context?.companyName ?? 'Company name'}</Text>
          </View>
        </View>

        <View style={styles.signOff}>
          <Text style={styles.rowValue}>Prepared for {context?.candidateName ?? 'your candidate'}</Text>
          <Text style={styles.signature}>Authorized signature</Text>
        </View>
      </Page>
    </Document>
  );
}
