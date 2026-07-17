import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../store/api'
import type { ExportRange } from '../types/types'

interface UseExportTransactionsReturn {
  exportTransactions: (range: ExportRange) => Promise<void>
  isExporting: boolean
}

export function useExportTransactions(): UseExportTransactionsReturn {
  const [isExporting, setIsExporting] = useState(false)

  const exportTransactions = async (range: ExportRange): Promise<void> => {
    if (isExporting) return
    setIsExporting(true)

    const toastId = toast.loading('Preparing your Excel file…')

    try {
      const response = await api.get('/export/transactions', {
        params: { range },
        responseType: 'blob',
      })

      // Extract filename from Content-Disposition header, fall back to a default
      const disposition: string =
        (response.headers['content-disposition'] as string | undefined) ?? ''
      const filenameMatch = /filename="?([^";\n]+)"?/.exec(disposition)
      const filename = filenameMatch?.[1] ?? `spendwise-export-${range}.xlsx`

      // Trigger browser download
      const url = URL.createObjectURL(new Blob([response.data as BlobPart]))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)

      toast.success('Download started!', { id: toastId })
    } catch {
      toast.error('Export failed. Please try again.', { id: toastId })
    } finally {
      setIsExporting(false)
    }
  }

  return { exportTransactions, isExporting }
}
