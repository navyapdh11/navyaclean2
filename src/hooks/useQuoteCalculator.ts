import { useMemo } from 'react'
import { useWatch, type Control } from 'react-hook-form'
import type { QuoteForm } from '../lib/schema'
import { calculateQuote } from '../lib/pricing'

/**
 * Custom hook for reactive quote calculation.
 * Uses useWatch for isolated re-renders only when relevant fields change.
 */
export function useQuoteCalculator(control: Control<QuoteForm>) {
  const watchedValues = useWatch({ control })

  const liveQuote = useMemo(() => {
    // Safe validation before calculating
    if (
      !watchedValues ||
      !watchedValues.propertyType ||
      !watchedValues.services ||
      !Array.isArray(watchedValues.services)
    ) {
      return 0
    }

    // Type-safe: ensure all required fields exist
    const values = watchedValues as Partial<QuoteForm>
    if (!isQuoteFormComplete(values)) return 0

    return calculateQuote(values as QuoteForm)
  }, [watchedValues])

  return liveQuote
}

/**
 * Type guard to ensure all required QuoteForm fields are present
 */
function isQuoteFormComplete(values: Partial<QuoteForm>): values is QuoteForm {
  return (
    typeof values.propertyType === 'string' &&
    Array.isArray(values.services) &&
    values.services.length > 0 &&
    typeof values.area === 'number' &&
    typeof values.bedrooms === 'number' &&
    typeof values.bathrooms === 'number' &&
    typeof values.frequency === 'string'
  )
}
