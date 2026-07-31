import { PageHeader } from '@/components/admin/ui/primitives';
import { TestimonialsManager } from '@/features/admin/testimonials-manager';
import { listTestimonials } from '@/services/admin/queries';

export default async function AdminTestimonialsPage() {
  const testimonials = await listTestimonials();

  return (
    <>
      <PageHeader
        title="Témoignages"
        description="Les avis clients. Celui marqué « mis en avant » occupe le grand encart de la section."
      />
      <TestimonialsManager testimonials={testimonials} />
    </>
  );
}
