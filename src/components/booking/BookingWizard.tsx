// Multi-step Booking Wizard — 5-step form with validation
import { useState, useCallback, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, ChevronLeft, Calendar, Clock, MapPin, User, FileText } from 'lucide-react'
import { bookingSchema, type BookingForm } from '../../lib/schema'
import { cleaningServices, AU_STATES } from '../../lib/services-au'
import { runMonteCarloSimulation } from '../../lib/pricing'

const STEPS = [
  { icon: FileText, label: 'Service' },
  { icon: User, label: 'Property' },
  { icon: Calendar, label: 'Date & Time' },
  { icon: MapPin, label: 'Address' },
  { icon: Check, label: 'Confirm' },
]

const TIME_SLOTS = [
  { id: '08:00-12:00', label: 'Morning (8am - 12pm)' },
  { id: '12:00-16:00', label: 'Afternoon (12pm - 4pm)' },
  { id: '16:00-20:00', label: 'Evening (4pm - 8pm)' },
]

export default function BookingWizard() {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    mode: 'onBlur',
    defaultValues: {
      state: 'NSW',
      propertyDetails: { bedrooms: 3, bathrooms: 2, parking: false },
    },
  })

  // Auto-save to localStorage
  const formData = watch()
  useEffect(() => {
    localStorage.setItem('booking-draft', JSON.stringify(formData))
  }, [formData])

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('booking-draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        Object.entries(parsed).forEach(([key, value]) => {
          if (value !== undefined) setValue(key as any, value)
        })
      } catch {
        // Ignore parse errors
      }
    }
  }, [setValue])

  const nextStep = useCallback(async () => {
    const fieldsToValidate: Record<number, (keyof BookingForm)[]> = {
      0: ['serviceId'],
      1: ['propertyDetails'],
      2: ['date', 'timeSlot'],
      3: ['address', 'contact'],
    }

    const isValid = await trigger(fieldsToValidate[step])
    if (isValid) setStep((s) => Math.min(s + 1, 4))
  }, [step, trigger])

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const onSubmit = useCallback(async (data: BookingForm) => {
    setIsSubmitting(true)
    try {
      // Simulate booking submission (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log('[Booking] Submitted:', data)
      localStorage.removeItem('booking-draft')
      setSubmitted(true)
    } catch (error) {
      console.error('[Booking] Submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-8 glow-border"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-black text-gradient mb-4">Booking Confirmed!</h2>
          <p className="text-white/70 mb-6">
            Your cleaning has been booked successfully. We'll send you a confirmation email shortly.
          </p>
          <a href="/" className="glass-button-neon px-8 py-4 font-bold inline-block">
            Back to Home
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.h1
        className="text-4xl font-black text-gradient text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📅 Book Your Cleaning
      </motion.h1>

      {/* Progress Bar */}
      <div className="mb-8" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={5}>
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((StepIcon, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    i < step
                      ? 'bg-neon-green text-black'
                      : i === step
                      ? 'bg-neon-blue text-black'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {i < step ? <Check className="w-5 h-5" /> : <StepIcon.icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-2 ${i <= step ? 'text-white' : 'text-gray-500'}`}>
                  {StepIcon.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-neon-green' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Service Selection */}
            {step === 0 && <ServiceSelectionStep control={control} errors={errors} watch={watch} />}

            {/* Step 2: Property Details */}
            {step === 1 && <PropertyDetailsStep control={control} errors={errors} watch={watch} />}

            {/* Step 3: Date & Time */}
            {step === 2 && <DateTimeStep control={control} errors={errors} watch={watch} setValue={setValue} />}

            {/* Step 4: Address & Contact */}
            {step === 3 && <AddressContactStep control={control} errors={errors} watch={watch} />}

            {/* Step 5: Review & Confirm */}
            {step === 4 && <ReviewStep formData={watch()} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <button
              type="button"
              onClick={prevStep}
              className="glass-input px-6 py-3 font-semibold flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="glass-button-neon px-6 py-3 font-semibold flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="glass-button-neon px-8 py-3 font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Booking
                  <Check className="w-5 h-5" aria-hidden="true" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// ─── Step 1: Service Selection ────────────────────────────────────
function ServiceSelectionStep({ control, errors, watch: _watch }: any) {
  const services = Object.values(cleaningServices) as any[]

  return (
    <div className="glass-panel p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gradient">Select Service</h2>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-neon-blue">Service Type *</label>
        <Controller
          name="serviceId"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="radiogroup">
              {services.slice(0, 9).map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => field.onChange(service.id)}
                  className={`p-4 rounded-lg text-left transition-all ${
                    field.value === service.id
                      ? 'bg-neon-blue/20 border-2 border-neon-blue'
                      : 'glass-input border-2 border-transparent hover:border-white/20'
                  }`}
                  role="radio"
                  aria-checked={field.value === service.id}
                >
                  <div className="text-2xl mb-2">{service.icon}</div>
                  <div className="text-sm font-semibold text-white">{service.name}</div>
                  <div className="text-xs text-white/50">From ${service.basePrice.min}</div>
                </button>
              ))}
            </div>
          )}
        />
        {errors.serviceId && (
          <p className="text-red-400 text-xs" role="alert">{String(errors.serviceId.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-neon-blue">State *</label>
        <Controller
          name="state"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-4 gap-2">
              {AU_STATES.map((state: string) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => field.onChange(state)}
                  className={`px-3 py-2 text-sm font-bold rounded ${
                    field.value === state
                      ? 'bg-neon-blue text-black'
                      : 'glass-input text-white/70 hover:text-white'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          )}
        />
      </div>
    </div>
  )
}

// ─── Step 2: Property Details ─────────────────────────────────────
function PropertyDetailsStep({ control, errors: _errors, watch: _watch }: any) {
  return (
    <div className="glass-panel p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gradient">Property Details</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neon-blue">Bedrooms</label>
          <Controller
            name="propertyDetails.bedrooms"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                min="0"
                max="10"
                value={field.value || 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="glass-input w-full p-3 text-center text-2xl font-bold"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neon-blue">Bathrooms</label>
          <Controller
            name="propertyDetails.bathrooms"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                min="1"
                max="5"
                value={field.value || 1}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="glass-input w-full p-3 text-center text-2xl font-bold"
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-neon-blue">Property Size (m²)</label>
        <Controller
          name="propertyDetails.sqm"
          control={control}
          render={({ field }) => (
            <>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={field.value || 100}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="w-full accent-neon-blue"
              />
              <div className="text-center text-neon-blue font-mono text-lg">{field.value || 100} m²</div>
            </>
          )}
        />
      </div>
    </div>
  )
}

// ─── Step 3: Date & Time ──────────────────────────────────────────
function DateTimeStep({ control, errors, watch: _w, setValue: _s }: any) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="glass-panel p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gradient">Select Date & Time</h2>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-neon-blue">Date *</label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <input
              type="date"
              min={today}
              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
              onChange={(e) => field.onChange(new Date(e.target.value))}
              className="glass-input w-full p-3"
              aria-label="Select booking date"
            />
          )}
        />
        {errors.date && <p className="text-red-400 text-xs" role="alert">{String(errors.date.message)}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-neon-blue">Time Slot *</label>
        <Controller
          name="timeSlot"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => field.onChange(slot.id)}
                  className={`p-4 rounded-lg text-left transition-all ${
                    field.value === slot.id
                      ? 'bg-neon-blue/20 border-2 border-neon-blue'
                      : 'glass-input border-2 border-transparent hover:border-white/20'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" aria-hidden="true" />
                  {slot.label}
                </button>
              ))}
            </div>
          )}
        />
        {errors.timeSlot && <p className="text-red-400 text-xs" role="alert">{String(errors.timeSlot.message)}</p>}
      </div>
    </div>
  )
}

// ─── Step 4: Address & Contact ────────────────────────────────────
function AddressContactStep({ control, errors }: any) {
  return (
    <div className="glass-panel p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gradient">Address & Contact</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neon-blue mb-2">Street Address *</label>
          <Controller
            name="address.street"
            control={control}
            render={({ field }) => (
              <input {...field} className="glass-input w-full p-3" placeholder="51 Tate Street" />
            )}
          />
          {errors.address?.street && (
            <p className="text-red-400 text-xs mt-1" role="alert">{String(errors.address.street.message)}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neon-blue mb-2">Suburb *</label>
            <Controller
              name="address.suburb"
              control={control}
              render={({ field }) => (
                <input {...field} className="glass-input w-full p-3" placeholder="Sydney" />
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neon-blue mb-2">Postcode *</label>
            <Controller
              name="address.postcode"
              control={control}
              render={({ field }) => (
                <input {...field} className="glass-input w-full p-3" placeholder="2000" maxLength={4} />
              )}
            />
            {errors.address?.postcode && (
              <p className="text-red-400 text-xs mt-1" role="alert">{String(errors.address.postcode.message)}</p>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neon-blue mb-2">Full Name *</label>
            <Controller
              name="contact.name"
              control={control}
              render={({ field }) => (
                <input {...field} className="glass-input w-full p-3" placeholder="John Smith" />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neon-blue mb-2">Email *</label>
              <Controller
                name="contact.email"
                control={control}
                render={({ field }) => (
                  <input {...field} type="email" className="glass-input w-full p-3" placeholder="john@example.com" />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neon-blue mb-2">Phone *</label>
              <Controller
                name="contact.phone"
                control={control}
                render={({ field }) => (
                  <input {...field} type="tel" className="glass-input w-full p-3" placeholder="04XX XXX XXX" />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 5: Review & Confirm ─────────────────────────────────────
function ReviewStep({ formData }: { formData: any }) {
  const service = (Object.values(cleaningServices) as any[]).find((s: any) => s.id === formData.serviceId)
  const priceRange = service
    ? runMonteCarloSimulation(service as any, formData.state, {
        serviceId: formData.serviceId,
        state: formData.state,
        bedrooms: formData.propertyDetails?.bedrooms,
        bathrooms: formData.propertyDetails?.bathrooms,
        sqm: formData.propertyDetails?.sqm,
      })
    : null

  return (
    <div className="glass-panel p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gradient">Review & Confirm</h2>

      {service && (
        <>
          {/* Service Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-neon-blue">Service</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-white/50">Service</div>
              <div className="text-white font-semibold">{service?.name}</div>
              <div className="text-white/50">State</div>
              <div className="text-white font-semibold">{formData.state}</div>
              <div className="text-white/50">Property</div>
              <div className="text-white font-semibold">
                {formData.propertyDetails?.bedrooms} bed / {formData.propertyDetails?.bathrooms} bath
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-3">
            <h3 className="font-bold text-neon-blue">Date & Time</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-white/50">Date</div>
              <div className="text-white font-semibold">
                {formData.date ? new Date(formData.date).toLocaleDateString('en-AU') : 'Not selected'}
              </div>
              <div className="text-white/50">Time</div>
              <div className="text-white font-semibold">{formData.timeSlot}</div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <h3 className="font-bold text-neon-blue">Address</h3>
            <div className="text-white font-semibold">
              {formData.address?.street}, {formData.address?.suburb} {formData.address?.postcode}
            </div>
          </div>

          {/* Price Estimate */}
          {priceRange && (
            <div className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-xl p-6 text-center">
              <div className="text-sm text-white/60 mb-1">Estimated Price (incl. GST)</div>
              <div className="text-4xl font-black text-gradient mb-2">${priceRange.avg} AUD</div>
              <div className="text-xs text-white/50">Range: ${priceRange.min} — ${priceRange.max}</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
