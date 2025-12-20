import { getCategory } from '@/actions/categories';
import { CategoryForm } from '@/components/admin/category-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const result = await getCategory(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const category = result.data;

  return (
    <div className="mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>
        <h1 className="text-2xl font-bold">Edit Category</h1>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <CategoryForm
          initialData={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            imageUrl: category.imageUrl || '',
          }}
        />
      </div>
    </div>
  );
}
