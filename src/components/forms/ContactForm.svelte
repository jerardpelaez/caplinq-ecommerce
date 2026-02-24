<script lang="ts">
  import { ContactFormSchema, type ContactFormData } from '$lib/types/forms';

  let formData = $state<ContactFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
  });

  let errors = $state<Record<string, string>>({});
  let submitting = $state(false);
  let submitted = $state(false);

  function validateField(field: keyof ContactFormData): string | null {
    const partialSchema = ContactFormSchema.shape[field];
    const result = partialSchema.safeParse(formData[field]);
    if (!result.success) {
      return result.error.issues[0]?.message ?? 'Invalid value';
    }
    return null;
  }

  function handleBlur(field: keyof ContactFormData) {
    const error = validateField(field);
    if (error) {
      errors = { ...errors, [field]: error };
    } else {
      const { [field]: _, ...rest } = errors;
      errors = rest;
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    errors = {};

    const result = ContactFormSchema.safeParse(formData);
    if (!result.success) {
      errors = Object.fromEntries(
        result.error.issues.map((i) => [i.path[0], i.message])
      );
      // Focus the first invalid field
      const firstErrorField = result.error.issues[0]?.path[0] as string;
      if (firstErrorField) {
        const el = document.getElementById(`contact-${firstErrorField}`);
        el?.focus();
      }
      return;
    }

    submitting = true;

    try {
      // Placeholder: log to console since no API route yet
      console.log('Contact form submission:', result.data);

      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      submitted = true;
    } catch {
      errors = { form: 'Submission failed. Please try again.' };
    } finally {
      submitting = false;
    }
  }

  function resetForm() {
    formData = {
      name: '',
      email: '',
      company: '',
      phone: '',
      subject: '',
      message: '',
    };
    errors = {};
    submitted = false;
  }
</script>

{#if submitted}
  <div class="rounded-lg border border-success-500/30 bg-success-500/5 p-6 text-center" role="alert">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mx-auto mb-3 h-12 w-12 text-success-500" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
    <h3 class="text-lg font-semibold text-gray-900">Message Sent Successfully</h3>
    <p class="mt-2 text-sm text-gray-600">
      Thank you for contacting us. Our team will review your message and respond within 1-2 business days.
    </p>
    <button
      onclick={resetForm}
      class="btn-secondary mt-4"
    >
      Send Another Message
    </button>
  </div>
{:else}
  <form onsubmit={handleSubmit} novalidate class="space-y-5">
    {#if errors.form}
      <div class="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-600" role="alert">
        {errors.form}
      </div>
    {/if}

    <!-- Name -->
    <div>
      <label for="contact-name" class="mb-1.5 block text-sm font-medium text-gray-700">
        Full Name <span class="text-error-500" aria-hidden="true">*</span>
      </label>
      <input
        id="contact-name"
        type="text"
        bind:value={formData.name}
        onblur={() => handleBlur('name')}
        aria-invalid={!!errors.name}
        aria-describedby={errors.name ? 'contact-name-error' : undefined}
        required
        class="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 {errors.name ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-primary-500'}"
        placeholder="John Smith"
      />
      {#if errors.name}
        <p id="contact-name-error" class="mt-1 text-sm text-error-500" role="alert">{errors.name}</p>
      {/if}
    </div>

    <!-- Email -->
    <div>
      <label for="contact-email" class="mb-1.5 block text-sm font-medium text-gray-700">
        Email Address <span class="text-error-500" aria-hidden="true">*</span>
      </label>
      <input
        id="contact-email"
        type="email"
        bind:value={formData.email}
        onblur={() => handleBlur('email')}
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? 'contact-email-error' : undefined}
        required
        class="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 {errors.email ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-primary-500'}"
        placeholder="john@company.com"
      />
      {#if errors.email}
        <p id="contact-email-error" class="mt-1 text-sm text-error-500" role="alert">{errors.email}</p>
      {/if}
    </div>

    <!-- Company -->
    <div>
      <label for="contact-company" class="mb-1.5 block text-sm font-medium text-gray-700">
        Company <span class="text-error-500" aria-hidden="true">*</span>
      </label>
      <input
        id="contact-company"
        type="text"
        bind:value={formData.company}
        onblur={() => handleBlur('company')}
        aria-invalid={!!errors.company}
        aria-describedby={errors.company ? 'contact-company-error' : undefined}
        required
        class="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 {errors.company ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-primary-500'}"
        placeholder="ACME Corp"
      />
      {#if errors.company}
        <p id="contact-company-error" class="mt-1 text-sm text-error-500" role="alert">{errors.company}</p>
      {/if}
    </div>

    <!-- Phone (optional) -->
    <div>
      <label for="contact-phone" class="mb-1.5 block text-sm font-medium text-gray-700">
        Phone <span class="font-normal text-gray-400">(optional)</span>
      </label>
      <input
        id="contact-phone"
        type="tel"
        bind:value={formData.phone}
        class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        placeholder="+1 (555) 123-4567"
      />
    </div>

    <!-- Subject -->
    <div>
      <label for="contact-subject" class="mb-1.5 block text-sm font-medium text-gray-700">
        Subject <span class="text-error-500" aria-hidden="true">*</span>
      </label>
      <input
        id="contact-subject"
        type="text"
        bind:value={formData.subject}
        onblur={() => handleBlur('subject')}
        aria-invalid={!!errors.subject}
        aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
        required
        class="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 {errors.subject ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-primary-500'}"
        placeholder="Product inquiry, technical question, etc."
      />
      {#if errors.subject}
        <p id="contact-subject-error" class="mt-1 text-sm text-error-500" role="alert">{errors.subject}</p>
      {/if}
    </div>

    <!-- Message -->
    <div>
      <label for="contact-message" class="mb-1.5 block text-sm font-medium text-gray-700">
        Message <span class="text-error-500" aria-hidden="true">*</span>
      </label>
      <textarea
        id="contact-message"
        bind:value={formData.message}
        onblur={() => handleBlur('message')}
        aria-invalid={!!errors.message}
        aria-describedby={errors.message ? 'contact-message-error' : undefined}
        required
        rows={5}
        class="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 {errors.message ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-primary-500'}"
        placeholder="How can we help you?"
      ></textarea>
      {#if errors.message}
        <p id="contact-message-error" class="mt-1 text-sm text-error-500" role="alert">{errors.message}</p>
      {/if}
    </div>

    <!-- Submit -->
    <button
      type="submit"
      disabled={submitting}
      class="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
    >
      {#if submitting}
        <svg class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Sending...
      {:else}
        Send Message
      {/if}
    </button>
  </form>
{/if}
