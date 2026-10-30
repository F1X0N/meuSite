import { Document, Page, Text, pdf } from '@react-pdf/renderer'

export const CoverLetterDocument = ({ content }: { content: string }) => (
    <Document title="Cover Letter" author="Josivan Amorim">
      <Page size="A4" style={{ padding: 48, fontFamily: 'Helvetica', fontSize: 11, lineHeight: 1.5 }}>
        {content.split(/\n\s*\n/).map((paragraph, index) => (
          <Text key={index} style={{ marginBottom: 12 }}>{paragraph}</Text>
        ))}
      </Page>
    </Document>
)

export const downloadCoverLetterPdf = async (content: string, language: string) => {
  const blob = await pdf(<CoverLetterDocument content={content} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = `Josivan_Amorim_Cover_Letter_${language.toUpperCase()}.pdf`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
